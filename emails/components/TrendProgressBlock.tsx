import { Column, Img, Row, Section, Text } from "@react-email/components";

export interface TrendProgressBlockProps {
  progressImageUrl?: string;
  startTag: string;
  startPercent: string;
  endTag: string;
  endPercent: string;
}

export function TrendProgressBlock({
  progressImageUrl,
  startTag,
  startPercent,
  endTag,
  endPercent,
}: TrendProgressBlockProps) {
  return (
    <>
      <Section align="center">
        {progressImageUrl && (
          <Section className="w-full mx-auto text-center" align="center">
            <Img
              src={progressImageUrl}
              alt="Trend progress"
              width="520px"
              height="auto"
              style={{ margin: "0 auto", display: "inline-block" }}
            />
          </Section>
        )}
      </Section>
      <Section
        className=" w-[520px] text-[16px] text-black font-bold"
        align="center"
      >
        <Row>
          <Column className="w-[50%]" align="left">
            <Text className="mt-[0px] leading-[14px] mb-[0px]">{startTag}</Text>
            <Text className="mt-[0px]">{startPercent}</Text>
          </Column>
          <Column className="w-[50%]" align="right">
            <Text className="mt-[0px] leading-[14px] mb-[0px]">{endTag}</Text>
            <Text className="mt-[0px]">{endPercent}</Text>
          </Column>
        </Row>
      </Section>
    </>
  );
}
