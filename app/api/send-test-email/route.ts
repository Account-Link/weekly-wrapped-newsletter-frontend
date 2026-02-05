/**
 * API Route: Send Test Email
 * (API 路由：发送测试邮件)
 *
 * Used for local debugging and verification of email templates.
 * Supports sending via real SMTP or Ethereal (fake SMTP service).
 * (用于邮件模板的本地调试和验证。支持通过真实 SMTP 或 Ethereal（伪造 SMTP 服务）发送。)
 */
import { generateEmailHtml } from "@/lib/email-generator";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API/SendTestEmail");

/**
 * GET Handler
 * (GET 处理程序)
 *
 * Generates HTML and sends a test email.
 * (生成 HTML 并发送测试邮件。)
 *
 * @param request - The incoming HTTP request (传入的 HTTP 请求)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const caseKey = searchParams.get("case") || "curious";
  const uid = searchParams.get("uid");

  if (!email && !process.env.SMTP_HOST) {
    // If no real SMTP and no email provided, we can still run with Ethereal but we need a recipient.
    // Actually Ethereal doesn't need a real recipient, it intercepts everything.
  }

  try {
    // Generate HTML, ensuring templates and asset injection work
    // (生成 HTML，确保模板与资源注入生效)
    // If uid is provided, try to fetch real data
    // (如果传入了 uid，则尝试拉取真实数据)
    logger.info(`Generating email HTML. case=${caseKey}, uid=${uid}`);
    const html = await generateEmailHtml(caseKey, {
      uidOverride: uid || undefined,
      useRealData: !!uid,
    });

    let transporter;
    let isEthereal = false;

    // Prioritize real SMTP, otherwise use Ethereal for testing
    // (优先使用真实 SMTP，否则使用 Ethereal 测试)
    if (process.env.SMTP_HOST) {
      logger.info("Using real SMTP configuration.");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create Ethereal test account
      logger.warn("No SMTP config found, using Ethereal...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      isEthereal = true;
    }

    // Use placeholder address if no recipient, compatible with Ethereal preview
    // (无收件人时使用占位地址，配合 Ethereal 预览)
    const recipient = email || "test@example.com";

    // Send email and return messageId for tracking
    // (发送邮件并返回 messageId 以便追踪)
    // Add timestamp to prevent Gmail threading
    // (添加时间戳防止 Gmail 折叠邮件)
    const timestamp = new Date().toLocaleTimeString();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FYP Scout" <no-reply@example.com>',
      to: recipient,
      subject: `FYP Scout Weekly Wrapped (Case: ${caseKey}) - ${timestamp}`,
      html: html,
    });

    logger.success(`Message sent: ${info.messageId}`);
    let previewUrl = "";
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      logger.info(`Preview URL: ${previewUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
      recipient: recipient,
      mode: isEthereal ? "Ethereal (Fake)" : "Real SMTP",
    });
  } catch (error: unknown) {
    logger.error("Error sending email", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
