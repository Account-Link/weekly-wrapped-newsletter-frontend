import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { WeeklyData } from "../src/lib/firebase-admin";
import { TrendProgressBlock } from "./components/TrendProgressBlock";
import { DiagnosisBarChartBlock } from "./components/DiagnosisBarChartBlock";

interface FypScoutReportEmailProps {
  data: WeeklyData;
}

export function FypScoutReportEmail({ data }: FypScoutReportEmailProps) {
  const assetBaseUrl = data.hero.imageUrl
    ? data.hero.imageUrl.split("/figma/")[0]
    : "";
  const tailwindConfig = {
    theme: {
      spacing: {
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        14: "56px",
        16: "64px",
        20: "80px",
        24: "96px",
        28: "112px",
        32: "128px",
        36: "144px",
        40: "160px",
        44: "176px",
        48: "192px",
        52: "208px",
        56: "224px",
        60: "240px",
        64: "256px",
        72: "288px",
        80: "320px",
        96: "384px",
        0.5: "2px",
        1.5: "6px",
        2.5: "10px",
        3.5: "14px",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "1" }],
        "6xl": ["60px", { lineHeight: "1" }],
        "7xl": ["72px", { lineHeight: "1" }],
        "8xl": ["96px", { lineHeight: "1" }],
        "9xl": ["128px", { lineHeight: "1" }],
      },
      extend: {
        colors: {
          brand: "#FF345D",
          bgDark: "#313131",
          bgNudge: "#E4E4E4",
          trendFill: "#6A00F4",
          chartActive: "#00CC66",
          chartMuted: "#555555",
        },
      },
    },
  };

  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <style></style>
        </Head>
        <Preview>FYP Scout Weekly Newsletter</Preview>
        <Body className="m-0 w-full font-sans body">
          <Container className="w-full max-w-[1080px] mx-auto bg-bgDark">
            {/* OPENING SECTION */}
            <Section className="bg-bgDark pt-[30px] px-5 text-center text-white">
              <Img
                src={`${assetBaseUrl}/figma/cat_main.png`}
                alt="Opening Cat"
                width="520"
                height="200"
                className="mx-auto mb-[38px]"
              />
              <Text className="text-[30px] font-bold leading-[40px] mb-[0px]">
                This week you explored
              </Text>
              <Text className="text-[30px] font-bold leading-[40px] mt-[0px]">
                a lot of <span className="text-brand">New Corners</span> in
                TikTok.
              </Text>
              <Text className="text-[18px] text-white mb-10">
                {data.opening.dateRange}
              </Text>
            </Section>

            {/* TREND SECTION */}
            <Section
              className="h-[770px] w-full text-center text-black p-[40px] pt-[200px] mt-[-100px]"
              style={{
                backgroundImage: `url(${assetBaseUrl}/figma/trend-bg.png)`,
                backgroundSize: "1080px 770px",
                backgroundPosition: "center",
              }}
            >
              <Img
                src={`${assetBaseUrl}/figma/trend-icon.png`}
                alt="Topic Sticker"
                width="126"
                height="113"
                className="mx-auto mb-[0px]"
              />
              <Text className="text-[30px] leading-[36px] font-bold mt-[0px] mb-[0px]">
                {data.trend.topic}
              </Text>
              <Text className="text-[18px] text-brand mt-[0px] font-bold">
                {data.trend.statusText}
              </Text>
              <Text className="text-[18px] font-bold mb-[10px]">
                {data.trend.rank !== null ? (
                  <>
                    You were{" "}
                    <span className="text-brand text-[24px] font-bold">
                      #{data.trend.rank.toLocaleString()}
                    </span>{" "}
                    to discover out of{" "}
                    <span className="text-brand text-[24px] font-bold">
                      {data.trend.totalDiscoverers.toLocaleString()}
                    </span>{" "}
                    people.
                  </>
                ) : (
                  data.trend.discoveryText
                )}
              </Text>
              <TrendProgressBlock
                progressImageUrl={data.trend.progressImageUrl}
                startTag={data.trend.startTag}
                startPercent={data.trend.startPercent}
                endTag={data.trend.endTag}
                endPercent={data.trend.endPercent}
              />
              <Button
                className="w-[236px] h-[61px] leading-[61px] mx-auto box-border rounded-[60px] bg-black text-center text-white text-[18px] font-bold"
                href={data.trend.shareUrl || "https://react.email"}
              >
                {data.trend.ctaLabel}
                <Img
                  src={`${assetBaseUrl}/figma/download-icon.png`}
                  alt=""
                  width="13"
                  height="13"
                  className="inline-block ml-[10px]"
                />
              </Button>
            </Section>

            {/* DIAGNOSIS SECTION */}
            <Section className="max-w-[520px] mx-auto py-10 px-[40px] text-white text-center">
              <Img
                src={`${assetBaseUrl}/figma/diagnosis-icon.png`}
                alt="Topic Sticker"
                width="126"
                height="113"
                className="mx-auto mb-[0px]"
              />
              <Text className="text-[30px] font-bold mt-[0px] mb-[60px]">
                {data.diagnosis.title}
              </Text>

              <Row className="mb-[56px]">
                <Column className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px]">
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px]">
                    {data.diagnosis.totalVideosValue}{" "}
                    {data.diagnosis.totalVideosUnit}
                  </Text>
                  <Text className="text-[14px] text-[#ffffff] mt-[0px]">
                    Total Videos
                  </Text>
                </Column>
                <Column className="w-[30px]"></Column>
                <Column className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px] mr-[30px]">
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px]">
                    {data.diagnosis.totalTimeValue}{" "}
                    {data.diagnosis.totalTimeUnit}
                  </Text>
                  <Text className="text-[14px] text-[#ffffff] mt-[0px]">
                    Total Time
                  </Text>
                </Column>
              </Row>

              <Text className="text-[18px] mb-[30px] leading-[32px] font-bold">
                {data.diagnosis.comparisonDiff && (
                  <span className="text-[24px] text-brand">
                    {data.diagnosis.comparisonDiff}{" "}
                  </span>
                )}
                {data.diagnosis.comparisonText}
                <br />
                Your thumb ran{" "}
                <span className="text-[24px] text-brand">
                  {data.diagnosis.miles} miles
                </span>{" "}
                {data.diagnosis.milesComment}
              </Text>

              <DiagnosisBarChartBlock
                barChartImageUrl={data.diagnosis.barChartImageUrl}
                lastWeekLabel={data.diagnosis.lastWeekLabel}
                thisWeekLabel={data.diagnosis.thisWeekLabel}
                lastWeekValue={data.diagnosis.lastWeekValue}
                thisWeekValue={data.diagnosis.thisWeekValue}
              />

              <Text className="text-[20px] font-bold text-[#fff] my-[30px] mb-[30px]">
                • New contents you got into •
              </Text>
              <Row className="mb-[30px]">
                {data.newContents.map((content) => (
                  <Column
                    key={content.label}
                    className="text-center w-1/3"
                    align="center"
                  >
                    <Img
                      src={content.stickerUrl}
                      width="150"
                      height="150"
                      className="rounded-full border-[1px] border-[#ffffff4d] mb-[10px] mx-auto"
                    />
                    <Text className="text-[16px] text-white font-bold">
                      {content.label}
                    </Text>
                  </Column>
                ))}
              </Row>

              <Text className="text-[20px] font-bold text-[#fff] my-[30px] mb-[30px]">
                • Deepest rabbit hole •
              </Text>
              <Section className="text-left mb-[60px]">
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text className="text-[18px] text-brand font-bold mb-[16px]">
                      {data.rabbitHole.timeLabel}
                    </Text>
                    <Text className="text-[30px] font-bold text-white leading-[40px]">
                      {data.rabbitHole.description}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }} align="right">
                    <Img
                      src={`${assetBaseUrl}/figma/cat_sleep.png`}
                      width="160"
                    />
                  </Column>
                </Row>
              </Section>

              <Button
                className="w-[288px] h-[61px] leading-[61px] mx-auto box-border rounded-[60px] bg-white text-center text-black text-[18px] font-bold"
                href={data.diagnosis.shareUrl || "https://react.email"}
              >
                {data.weeklyNudge.ctaLabel}
                <Img
                  src={`${assetBaseUrl}/figma/download-icon_black.png`}
                  alt=""
                  width="13"
                  height="13"
                  className="inline-block ml-[10px]"
                />
              </Button>
            </Section>

            {/* NUDGE SECTION */}
            <Section className="bg-bgNudge py-[60px] text-center text-black">
              <Section className="max-w-[520px] mx-auto">
                <Text className="text-[30px] leading-[40px] font-bold mt-[0px] mb-[60px]">
                  “Try putting your phone down before 3 AM this week!”
                </Text>
                <Text className="text-[18px]">{data.weeklyNudge.message}</Text>
                <Button
                  className="w-[248px] h-[61px] leading-[61px] mx-auto box-border rounded-[60px] bg-trendFill text-center text-white text-[18px] font-bold"
                  href="https://react.email"
                >
                  Share Invite Link
                  <Img
                    src={`${assetBaseUrl}/figma/share-icon.png`}
                    alt=""
                    width="13"
                    height="13"
                    className="inline-block ml-[10px]"
                  />
                </Button>
              </Section>
            </Section>

            {/* FOOTER */}
            <Section
              className="w-full text-center pb-[160px]"
              style={{
                backgroundImage: `url(${assetBaseUrl}/figma/bottom-bg.png)`,
                backgroundSize: "1080px 258px",
                backgroundPosition: "bottom center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Section className="max-w-[520px] mx-auto py-10 px-5 text-center text-white">
                <Img
                  src={`${assetBaseUrl}/figma/feedling-icon.png`}
                  width="120"
                  height="120"
                  className="rounded-[10px] mb-[10px] mx-auto"
                />
                <Text className="text-[30px] font-bold mb-[30px]">
                  Who’s Feedling?
                </Text>
                <Text className="text-[14px] leading-[20px] text-[#fff] mb-[60px] mx-auto">
                  Feeding is an app that turns your TikTok habits into a virtual
                  pet you grow and nurture with your scrolling. We're launching
                  soon!
                </Text>
                <Button
                  className="w-[276px] h-[61px] leading-[61px] mx-auto box-border rounded-[60px] bg-white text-center text-black text-[18px] font-bold align-middle"
                  href="https://react.email"
                >
                  Follow us on TikTok
                  <Img
                    src={`${assetBaseUrl}/figma/tiktok-icon.png`}
                    alt=""
                    width="13"
                    height="13"
                    className="inline-block ml-[10px]"
                  />
                </Button>
                <Text className="text-[14px] text-[#fff] text-center">
                  @ 2025 Honey Badger Cooperation Labs, Inc.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
