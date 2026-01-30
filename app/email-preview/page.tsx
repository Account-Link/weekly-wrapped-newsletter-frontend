// 文件功能：邮件 HTML 预览页面，处于本地预览入口
// 方法概览：解析参数、生成 HTML、渲染 iframe
import { generateEmailHtml } from "@/lib/email-generator";

// 方法功能：渲染邮件预览页面
export default async function EmailPreviewPage({
  searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const caseKey =
    typeof resolvedSearchParams.case === "string"
      ? resolvedSearchParams.case
      : "curious";
  const uid =
    typeof resolvedSearchParams.uid === "string"
      ? resolvedSearchParams.uid
      : undefined;

  // 重要逻辑：预览模式禁用上传，避免外部依赖
  const html = await generateEmailHtml(caseKey, {
    uidOverride: uid,
    useUploads: false,
  });

  return (
    <main style={{ margin: 0, padding: 16, background: "#F3F4F6" }}>
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>Email Preview</h2>
      <iframe
        title="FYP Scout Email Preview"
        srcDoc={html}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          background: "#FFFFFF",
        }}
      />
    </main>
  );
}
