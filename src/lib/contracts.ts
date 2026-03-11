export type TemplateValidationIssue = {
  code: string;
  message: string;
  path?: string;
  severity: "error" | "warning";
};

export type TemplateValidationResult = {
  valid: boolean;
  issues: TemplateValidationIssue[];
  variables: string[];
};

export type RenderRequest = {
  template: string;
  data: Record<string, unknown>;
};

export type RenderHtmlResponse = {
  html: string;
};

const API_BASE =
  import.meta.env.VITE_RENDER_API_BASE_URL ?? "http://localhost:8080";

export async function validateTemplate(
  template: string
): Promise<TemplateValidationResult> {
  const res = await fetch(`${API_BASE}/validate-template`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ template }),
  });
  if (!res.ok) {
    throw new Error(`validateTemplate failed: ${res.status}`);
  }
  return res.json() as Promise<TemplateValidationResult>;
}

export async function renderHtml(
  req: RenderRequest
): Promise<RenderHtmlResponse> {
  const res = await fetch(`${API_BASE}/render-html`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`renderHtml failed: ${res.status}`);
  }
  return res.json() as Promise<RenderHtmlResponse>;
}
