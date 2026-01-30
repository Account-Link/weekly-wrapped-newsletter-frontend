// 文件功能：邮件诊断图表区块组件，处于邮件内容渲染阶段
// 方法概览：渲染诊断图表图片
import { Column, Img, Row, Section, Text } from "@react-email/components";

// 方法功能：诊断图表区块入参定义
export interface DiagnosisBarChartBlockProps {
  barChartImageUrl?: string;
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
}

// 方法功能：渲染诊断图表区块
export function DiagnosisBarChartBlock({
  barChartImageUrl,
}: DiagnosisBarChartBlockProps) {
  return (
    <Section className="mx-auto mb-10 align-bottom">
      {barChartImageUrl && (
        <Img
          src={barChartImageUrl}
          alt="Weekly comparison"
          width="520"
          className="block mx-auto mobile-img-330"
        />
      )}
    </Section>
  );
}
