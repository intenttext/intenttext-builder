export type TemplateValidationIssue = {
  code: string;
  category: "parse" | "template" | "data_contract" | "system";
  message: string;
  path?: string;
  severity: "error" | "warning";
};

export type VariableInventory = {
  all: string[];
  required: string[];
  optional: string[];
  repeated: Array<{
    path: string;
    itemAlias?: string;
    collection?: string;
  }>;
};

export type TemplateValidationResult = {
  valid: boolean;
  issues: TemplateValidationIssue[];
  variables: VariableInventory;
};

export type RenderRequest = {
  template: string;
  data: Record<string, unknown>;
};

export type RuntimeMetrics = {
  durationMs: number;
  queueWaitMs: number;
  crashCount: number;
};

export type RenderPdfRequest = RenderRequest & {
  pdf?: {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
  runtimeConfig?: {
    browserPool?: {
      maxBrowsers?: number;
      maxPagesPerBrowser?: number;
      queueTimeoutMs?: number;
      launchTimeoutMs?: number;
      taskTimeoutMs?: number;
    };
    retryAttempts?: number;
    shutdownGraceMs?: number;
  };
};

export type RenderHtmlResponse = {
  html: string;
};

export type RenderPdfResponse = {
  html: string;
  pdfBase64: string;
  metrics: RuntimeMetrics | null;
};

const API_BASE = import.meta.env.VITE_RENDER_API_BASE_URL ?? "/api";

function endpoint(path: string): string {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function validateTemplate(
  template: string,
): Promise<TemplateValidationResult> {
  const res = await fetch(endpoint("/validate-template"), {
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
  req: RenderRequest,
): Promise<RenderHtmlResponse> {
  const res = await fetch(endpoint("/render-html"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`renderHtml failed: ${res.status}`);
  }
  return res.json() as Promise<RenderHtmlResponse>;
}

export async function renderPdf(
  req: RenderPdfRequest,
): Promise<RenderPdfResponse> {
  const res = await fetch(endpoint("/render-pdf"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`renderPdf failed: ${res.status}`);
  }
  return res.json() as Promise<RenderPdfResponse>;
}
