// 文件功能：发送测试邮件 API，处于本地联调与验证阶段
// 方法概览：生成邮件 HTML、选择 SMTP/Ethereal、发送并返回结果
import { generateEmailHtml } from "@/lib/email-generator";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// 方法功能：生成 HTML 并发送测试邮件
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
    // 重要逻辑：生成 HTML，确保模板与资源注入生效
    // 如果传入了 uid，则尝试拉取真实数据
    const html = await generateEmailHtml(caseKey, {
      uidOverride: uid || undefined,
      useRealData: !!uid,
    });

    let transporter;
    let isEthereal = false;

    // 重要逻辑：优先使用真实 SMTP，否则使用 Ethereal 测试
    if (process.env.SMTP_HOST) {
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
      console.log("No SMTP config found, using Ethereal...");
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

    // 重要逻辑：无收件人时使用占位地址，配合 Ethereal 预览
    const recipient = email || "test@example.com";

    // 重要逻辑：发送邮件并返回 messageId 以便追踪
    // 添加时间戳防止 Gmail 折叠邮件 (Conversation View threading)
    const timestamp = new Date().toLocaleTimeString();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FYP Scout" <no-reply@example.com>',
      to: recipient,
      subject: `FYP Scout Weekly Wrapped (Case: ${caseKey}) - ${timestamp}`,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    let previewUrl = "";
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log("Preview URL: %s", previewUrl);
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
    console.error("Error sending email:", error);
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
