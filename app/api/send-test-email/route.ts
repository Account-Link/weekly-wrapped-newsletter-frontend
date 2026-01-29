import { generateEmailHtml } from "@/lib/email-generator";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const caseKey = searchParams.get("case") || "curious";

  if (!email && !process.env.SMTP_HOST) {
    // If no real SMTP and no email provided, we can still run with Ethereal but we need a recipient.
    // Actually Ethereal doesn't need a real recipient, it intercepts everything.
  }

  try {
    const html = await generateEmailHtml(caseKey);

    let transporter;
    let isEthereal = false;

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

    const recipient = email || "test@example.com";

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FYP Scout" <no-reply@example.com>',
      to: recipient,
      subject: `FYP Scout Weekly Wrapped (Case: ${caseKey})`,
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
