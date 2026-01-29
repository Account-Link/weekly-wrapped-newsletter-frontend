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
  lastWeekLabel,
  thisWeekLabel,
  lastWeekValue,
  thisWeekValue,
}: DiagnosisBarChartBlockProps) {
  const maxBarHeight = 100;
  const thisWeekHeight = Math.round((thisWeekValue / 100) * maxBarHeight);
  const lastWeekHeight = Math.round((lastWeekValue / 100) * maxBarHeight);

  return (
    <Section className="mx-auto mb-10 max-w-[300px] h-[140px] align-bottom">
      {barChartImageUrl ? (
        <Img
          src={barChartImageUrl}
          alt="Weekly comparison"
          width="520"
          className="block mx-auto"
        />
      ) : (
        <Row>
          <Column className="text-center align-bottom w-1/2">
            <Text className="text-[12px] mb-[5px] text-[#AAAAAA]">
              {lastWeekLabel}
            </Text>
            <Section
              className="bg-chartMuted w-[20px] mx-auto rounded-t-[5px]"
              style={{ height: `${lastWeekHeight}px` }}
            />
          </Column>
          <Column className="text-center align-bottom w-1/2">
            <Text className="text-[12px] mb-[5px] text-[#AAAAAA]">
              {thisWeekLabel}
            </Text>
            <Section
              className="bg-chartActive w-[20px] mx-auto rounded-t-[5px]"
              style={{ height: `${thisWeekHeight}px` }}
            />
          </Column>
        </Row>
      )}
    </Section>
  );
}
