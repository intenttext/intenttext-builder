import { ensurePost, getPdfRuntime, toBase64 } from "./_shared.js";

export default async function handler(req, res) {
  if (!ensurePost(req, res)) return;

  try {
    const template = String(req.body?.template || "");
    const data =
      req.body?.data && typeof req.body.data === "object" ? req.body.data : {};
    const pdf =
      req.body?.pdf && typeof req.body.pdf === "object"
        ? req.body.pdf
        : undefined;
    const runtimeConfig =
      req.body?.runtimeConfig && typeof req.body.runtimeConfig === "object"
        ? req.body.runtimeConfig
        : undefined;

    const runtime = await getPdfRuntime();
    if (typeof runtime.createPdf !== "function") {
      throw new Error("PDF runtime missing createPdf");
    }

    const result = await runtime.createPdf(
      { template, data, pdf },
      runtimeConfig,
    );

    res.status(200).json({
      html: result.html,
      pdfBase64: toBase64(result.pdf),
      metrics: result.metrics || null,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
