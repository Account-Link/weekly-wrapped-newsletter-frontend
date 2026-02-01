// 文件功能：邮件通用按钮组件，处于邮件内容渲染阶段
// 方法概览：样式映射与按钮渲染
import { Column, Img, Link, Row, Section } from "@react-email/components";
import type { CSSProperties } from "react";

// 方法功能：邮件按钮类型定义
type EmailButtonType = "dark" | "bright" | "blue";

// 方法功能：邮件按钮入参定义
interface EmailButtonProps {
  href: string;
  label: string;
  iconUrl?: string;
  iconWidth?: number;
  iconHeight?: number;
  type: EmailButtonType;
}

// 方法功能：按钮类型到样式的映射
const typeStyles: Record<EmailButtonType, CSSProperties> = {
  dark: {
    backgroundColor: "#000001",
    backgroundImage: "linear-gradient(#000001, #000001)",
    color: "#FFFFFE",
    border: "1px solid #000001",
  },
  bright: {
    backgroundColor: "#FFFFFE",
    backgroundImage: "linear-gradient(#FFFFFE, #FFFFFE)",
    color: "#000001",
    border: "1px solid #000001",
  },
  blue: {
    backgroundColor: "#6A00F4",
    backgroundImage: "linear-gradient(#6A00F4, #6A00F4)",
    color: "#FFFFFE",
    border: "1px solid #6A00F4",
  },
};

// 方法功能：渲染邮件按钮
export function EmailButton({
  href,
  label,
  iconUrl,
  iconWidth = 13,
  iconHeight = 13,
  type,
}: EmailButtonProps) {
  return (
    <Section align="center">
      <Row>
        <Column align="center">
          <Link
            href={href}
            style={{
              display: "inline-block",
              height: "56px",
              lineHeight: "56px",
              padding: "0 36px",
              borderRadius: "60px",
              fontSize: "18px",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              boxSizing: "border-box",
              ...typeStyles[type],
            }}
          >
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              {label}
            </span>
            {iconUrl ? (
              <Img
                src={iconUrl}
                alt=""
                width={iconWidth}
                height={iconHeight}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginLeft: 10,
                }}
              />
            ) : null}
          </Link>
        </Column>
      </Row>
    </Section>
  );
}
