// 文件功能：邮件趋势进度区块组件，处于邮件内容渲染阶段
// 方法概览：渲染进度图与标签文本
import { Column, Img, Row, Section, Text } from "@react-email/components";

// 方法功能：趋势进度区块入参定义
export interface TrendProgressBlockProps {
  progressImageUrl?: string;
  startTag: string;
  startPercent: string;
  endTag: string;
  endPercent: string;
}

// 方法功能：渲染趋势进度区块
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
              width="566px"
              height="auto"
              className="mobile-img-376"
              style={{ margin: "0 auto", display: "inline-block" }}
            />
          </Section>
        )}
      </Section>
      <Section
        className=" w-[520px] text-[16px] text-black font-bold mobile-width-330"
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
