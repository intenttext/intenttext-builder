import { useMemo, useState } from "react";
import {
  type TemplateValidationIssue,
  type TemplateValidationResult,
  renderHtml,
  validateTemplate,
} from "./lib/contracts";

const DEFAULT_TEMPLATE = `title: Invoice\nsection: Bill To\ntext: {{client_name}}\ntext: {{client_address}}`;
const DEFAULT_DATA = `{
  "client_name": "Atlas Corp",
  "client_address": "Riyadh, KSA"
}`;

const ISSUE_HINTS: Record<string, string> = {
  LAYOUT_PAGE_SIZE_UNSUPPORTED:
    "Use A4, Letter, or Legal for predictable print output.",
  LAYOUT_MARGIN_NOT_NUMBER:
    "Set margin fields as numeric mm values, for example 12 or 12mm.",
  LAYOUT_MARGIN_RANGE:
    "Keep margins between 0 and 60mm unless there is a special print reason.",
  LAYOUT_SAFE_AREA_NOT_NUMBER: "Set safeArea as a numeric mm value.",
  LAYOUT_SAFE_AREA_RANGE: "Recommended safeArea range is 0 to 30mm.",
  LAYOUT_IMAGE_MISSING:
    "Provide image source in content or one of imageUrl/src/url/image properties.",
  LAYOUT_FIT_INVALID:
    "Use fit value contain, cover, or stretch for header/footer zones.",
  LAYOUT_ZONE_HEIGHT_NOT_NUMBER: "Set header/footer height as numeric mm.",
  LAYOUT_ZONE_HEIGHT_RANGE:
    "Keep header/footer heights within recommended zone ranges.",
  LAYOUT_BACKGROUND_IMAGE_MISSING:
    "Provide a background/watermark image source.",
  LAYOUT_BACKGROUND_FIT_INVALID:
    "Use fit value contain or cover for full-page background.",
  LAYOUT_OPACITY_NOT_NUMBER:
    "Set background opacity to a number between 0 and 1.",
  LAYOUT_OPACITY_RANGE: "Keep background opacity within 0..1.",
  LAYOUT_PAGE_BLOCK_RECOMMENDED:
    "Add page: block with size and margins for deterministic print layout.",
};

function App() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [html, setHtml] = useState<string>("");
  const [output, setOutput] = useState<string>("Ready");
  const [validation, setValidation] = useState<TemplateValidationResult | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const parsedData = useMemo(() => {
    try {
      return JSON.parse(dataJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [dataJson]);

  const groupedIssues = useMemo(() => {
    const grouped: Record<string, TemplateValidationIssue[]> = {
      parse: [],
      template: [],
      data_contract: [],
      system: [],
    };
    for (const issue of validation?.issues || []) {
      grouped[issue.category].push(issue);
    }
    return grouped;
  }, [validation]);

  async function onValidate() {
    setBusy(true);
    try {
      const result = await validateTemplate(template);
      setValidation(result);
      setOutput(
        result.valid
          ? `Template valid (${result.variables.all.length} variables found)`
          : `Template invalid (${result.issues.length} issues)`,
      );
    } catch (err) {
      setValidation(null);
      setOutput(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onPreview() {
    if (!parsedData) {
      setOutput("Invalid JSON data payload");
      return;
    }
    setBusy(true);
    try {
      const result = await renderHtml({ template, data: parsedData });
      setHtml(result.html);
      setOutput("Preview rendered from shared render API");
    } catch (err) {
      setOutput(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="layout">
      <header>
        <h1>IntentText Builder</h1>
        <p>V1 shell: template editor + validate + shared-render preview.</p>
      </header>

      <section className="grid">
        <article>
          <h2>Template</h2>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </article>

        <article>
          <h2>Data JSON</h2>
          <textarea
            value={dataJson}
            onChange={(e) => setDataJson(e.target.value)}
          />
        </article>
      </section>

      <section className="actions">
        <button onClick={onValidate} disabled={busy}>
          Validate Template
        </button>
        <button onClick={onPreview} disabled={busy}>
          Render Preview
        </button>
      </section>

      <section className="grid">
        <article>
          <h2>Output</h2>
          <pre>{output}</pre>

          <h2>Variables</h2>
          <div className="pill-wrap">
            {!validation || validation.variables.all.length === 0 ? (
              <span className="empty">No variables detected yet</span>
            ) : (
              validation.variables.all.map((v) => (
                <span key={v} className="pill var">
                  {v}
                </span>
              ))
            )}
          </div>

          <h2>Repeated Variables</h2>
          <div className="issue-list">
            {!validation ? (
              <span className="empty">
                Run validate to inspect repeated variables
              </span>
            ) : validation.variables.repeated.length === 0 ? (
              <span className="empty">No repeated variables detected</span>
            ) : (
              validation.variables.repeated.map((item, idx) => (
                <div key={`${item.path}-${idx}`} className="issue-item">
                  <span className="pill var">REPEATED</span>
                  <span className="issue-code">{item.path}</span>
                  {item.collection ? (
                    <span className="issue-path">from {item.collection}</span>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <h2>Validation Issues</h2>
          {!validation ? (
            <span className="empty">Run validate to see issues</span>
          ) : validation.issues.length === 0 ? (
            <span className="empty">No issues</span>
          ) : (
            <>
              {(["template", "parse", "data_contract", "system"] as const).map(
                (category) =>
                  groupedIssues[category].length > 0 ? (
                    <div key={category} className="issue-group">
                      <h3>{category.replace("_", " ")}</h3>
                      <div className="issue-list">
                        {groupedIssues[category].map((issue, idx) => (
                          <div
                            key={`${category}-${issue.code}-${idx}`}
                            className="issue-item"
                          >
                            <span
                              className={`pill ${
                                issue.severity === "error" ? "error" : "warning"
                              }`}
                            >
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="issue-code">{issue.code}</span>
                            <span>{issue.message}</span>
                            {issue.path ? (
                              <span className="issue-path">({issue.path})</span>
                            ) : null}
                            {ISSUE_HINTS[issue.code] ? (
                              <div className="issue-hint">
                                Hint: {ISSUE_HINTS[issue.code]}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
              )}
            </>
          )}
        </article>
        <article>
          <h2>HTML Preview</h2>
          <iframe title="preview" srcDoc={html} />
        </article>
      </section>
    </div>
  );
}

export default App;
