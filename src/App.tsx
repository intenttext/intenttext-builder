import { useMemo, useState } from "react";
import { renderHtml, validateTemplate } from "./lib/contracts";

const DEFAULT_TEMPLATE = `title: Invoice\nsection: Bill To\ntext: {{client_name}}\ntext: {{client_address}}`;
const DEFAULT_DATA = `{
  "client_name": "Atlas Corp",
  "client_address": "Riyadh, KSA"
}`;

function App() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [html, setHtml] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const parsedData = useMemo(() => {
    try {
      return JSON.parse(dataJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [dataJson]);

  async function onValidate() {
    setBusy(true);
    try {
      const result = await validateTemplate(template);
      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
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
          <textarea value={template} onChange={(e) => setTemplate(e.target.value)} />
        </article>

        <article>
          <h2>Data JSON</h2>
          <textarea value={dataJson} onChange={(e) => setDataJson(e.target.value)} />
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
