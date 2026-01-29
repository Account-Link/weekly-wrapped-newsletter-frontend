import { Column, Img, Row, Section, Text } from "@react-email/components";

export interface DiagnosisBarChartBlockProps {
  barChartImageUrl?: string;
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
}

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
