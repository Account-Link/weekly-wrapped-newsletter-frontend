import { generateEmailHtml } from "@/lib/email-generator";

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
