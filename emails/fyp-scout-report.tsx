import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { WeeklyData } from "../src/lib/firebase-admin";
import { TrendProgressBlock } from "./components/TrendProgressBlock";
import { DiagnosisBarChartBlock } from "./components/DiagnosisBarChartBlock";
import { EmailButton } from "./components/EmailButton";

interface FypScoutReportEmailProps {
  data: WeeklyData;
}

export function FypScoutReportEmail({ data }: FypScoutReportEmailProps) {
  const assetBaseUrl = data.hero.imageUrl
    ? data.hero.imageUrl.split("/figma/")[0]
    : "";
  const trackingPixelUrl = data.trackingBaseUrl
    ? `${data.trackingBaseUrl}/api/track?event=email_open&uid=${encodeURIComponent(
        data.uid,
      )}&weekStart=${encodeURIComponent(data.weekStart)}&source=email`
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
  const [contentA, contentB, contentC] = data.newContents;

  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <style>{`
@media screen and (max-width: 480px) {
  .mobile-max-330 {
    max-width: 330px !important;
  }
  .mobile-width-330 {
    width: 330px !important;
    max-width: 330px !important;
  }
  .mobile-img-330 {
    width: 330px !important;
    height: auto !important;
  }
  .mobile-text-28 {
    font-size: 28px !important;
    line-height: 36px !important;
  }
  .mobile-text-24 {
    font-size: 24px !important;
    line-height: 32px !important;
  }
  .mobile-text-20 {
    font-size: 20px !important;
    line-height: 24px !important;
  }
  .mobile-text-16 {
    font-size: 16px !important;
    line-height: 1.3 !important;
  }
  .mobile-text-22 {
    font-size: 22px !important;
    line-height: 1.3 !important;
  }
  .mobile-text-12 {
    font-size: 12px !important;
    line-height: 16px !important;
  }
  .mobile-mb-40 {
    margin-bottom: 40px !important;
  }
  .mobile-stat-box {
    width: 155px !important;
    height: 72px !important;
  }
  .mobile-gap-20 {
    width: 20px !important;
  }
  .mobile-gap-12 {
    width: 12px !important;
  }
  .mobile-content-item {
    width: 100px !important;
  }
  .mobile-content-img {
    width: 100px !important;
    height: 100px !important;
  }
  .mobile-rabbit-img {
    width: 120px !important;
    height: auto !important;
  }
  .mobile-px-20 {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
          `}</style>
        </Head>
        <Preview>FYP Scout Weekly Newsletter</Preview>
        <Body className="m-0 w-full font-sans body">
          {trackingPixelUrl ? (
            <Img
              src={trackingPixelUrl}
              alt=""
              width="1"
              height="1"
              style={{ display: "none" }}
            />
          ) : null}
          <Container className="w-full max-w-[1080px] mx-auto bg-bgDark">
            {/* OPENING SECTION */}
            <Section className="bg-bgDark pt-[30px] px-5 text-center text-white">
              <Img
                src={`${assetBaseUrl}/figma/cat_main.png`}
                alt="Opening Cat"
                width="520"
                height="200"
                className="mx-auto mb-[38px] mobile-img-330"
              />
              <Text className="text-[30px] font-bold leading-[40px] mb-[0px] mobile-text-24">
                This week you explored
              </Text>
              <Text className="text-[30px] font-bold leading-[40px] mt-[0px] mobile-text-24">
                a lot of <span className="text-brand">New Corners</span> in
                TikTok.
              </Text>
              <Text className="text-[18px] text-white mb-10 mobile-text-16">
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
              <Text className="text-[30px] leading-[36px] font-bold mt-[0px] mb-[0px] mobile-text-28">
                {data.trend.topic}
              </Text>
              <Text className="text-[18px] text-brand mt-[0px] font-bold mobile-text-16">
                {data.trend.statusText}
              </Text>
              <Text className="text-[18px] font-bold mb-[10px] mobile-text-16">
                {data.trend.rank !== null ? (
                  <>
                    You were{" "}
                    <span className="text-brand text-[24px] font-bold mobile-text-16">
                      #{data.trend.rank.toLocaleString()}
                    </span>{" "}
                    to discover out of{" "}
                    <span className="text-brand text-[24px] font-bold mobile-text-16">
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
              <EmailButton
                href={data.trend.shareUrl || "https://react.email"}
                label={data.trend.ctaLabel}
                iconUrl={`${assetBaseUrl}/figma/download-icon.png`}
                type="black"
              />
            </Section>

            {/* DIAGNOSIS SECTION */}
            <Section className="max-w-[520px] mx-auto py-10 px-[40px] text-white text-center mobile-max-330 mobile-px-20">
              <Img
                src={`${assetBaseUrl}/figma/stats-icon.png`}
                alt="Topic Sticker"
                width="126"
                height="113"
                className="mx-auto mb-[0px]"
              />
              <Text className="text-[30px] font-bold mt-[0px] mb-[60px] mobile-text-24 mobile-mb-40">
                {data.diagnosis.title}
              </Text>

              <Row className="mb-[56px] mobile-mb-40">
                <Column
                  className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px] text-center mobile-stat-box"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile-text-20">
                    {data.diagnosis.totalVideosValue}{" "}
                    {data.diagnosis.totalVideosUnit}
                  </Text>
                  <Text className="text-[14px] text-[#ffffff] mt-[0px] mobile-text-12">
                    Total Videos
                  </Text>
                </Column>
                <Column className="w-[30px] mobile-gap-20"></Column>
                <Column
                  className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px] mr-[30px] text-center mobile-stat-box"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile-text-20">
                    {data.diagnosis.totalTimeValue}{" "}
                    {data.diagnosis.totalTimeUnit}
                  </Text>
                  <Text className="text-[14px] text-[#ffffff] mt-[0px] mobile-text-12">
                    Total Time
                  </Text>
                </Column>
              </Row>

              <Text className="text-[18px] mb-[30px] leading-[32px] font-bold mobile-text-16">
                {data.diagnosis.comparisonDiff && (
                  <span className="text-[24px] text-brand mobile-text-22">
                    {data.diagnosis.comparisonDiff}{" "}
                  </span>
                )}
                {data.diagnosis.comparisonText}
                <br />
                <span className="mobile-text-16">
                  Your thumb ran{" "}
                  <span className="text-[24px] text-brand mobile-text-22">
                    {data.diagnosis.miles} miles
                  </span>{" "}
                  {data.diagnosis.milesComment}
                </span>
              </Text>

              <DiagnosisBarChartBlock
                barChartImageUrl={data.diagnosis.barChartImageUrl}
                lastWeekLabel={data.diagnosis.lastWeekLabel}
                thisWeekLabel={data.diagnosis.thisWeekLabel}
                lastWeekValue={data.diagnosis.lastWeekValue}
                thisWeekValue={data.diagnosis.thisWeekValue}
              />

              <Text className="text-[20px] font-bold text-[#fff] leading-none mt-[40px] mb-[60px] mobile-text-16">
                • New contents you got into •
              </Text>
              <Row
                className="mb-[30px] w-[520px] mx-auto mobile-width-330"
                align="center"
              >
                {contentA ? (
                  <Column
                    className="text-center mobile-content-item"
                    align="center"
                    style={{ width: "150px" }}
                  >
                    <Img
                      src={contentA.stickerUrl}
                      width="150"
                      height="150"
                      className="rounded-full border-[1px] border-[#ffffff4d] mb-[10px] mx-auto mobile-content-img"
                    />
                    <Text className="text-[16px] text-white font-bold mobile-text-12">
                      {contentA.label}
                    </Text>
                  </Column>
                ) : null}
                <Column className="w-[35px] mobile-gap-12"></Column>
                {contentB ? (
                  <Column
                    className="text-center mobile-content-item"
                    align="center"
                    style={{ width: "150px" }}
                  >
                    <Img
                      src={contentB.stickerUrl}
                      width="150"
                      height="150"
                      className="rounded-full border-[1px] border-[#ffffff4d] mb-[10px] mx-auto mobile-content-img"
                    />
                    <Text className="text-[16px] text-white font-bold mobile-text-12">
                      {contentB.label}
                    </Text>
                  </Column>
                ) : null}
                <Column className="w-[35px] mobile-gap-12"></Column>
                {contentC ? (
                  <Column
                    className="text-center mobile-content-item"
                    align="center"
                    style={{ width: "150px" }}
                  >
                    <Img
                      src={contentC.stickerUrl}
                      width="150"
                      height="150"
                      className="rounded-full border-[1px] border-[#ffffff4d] mb-[10px] mx-auto mobile-content-img"
                    />
                    <Text className="text-[16px] text-white font-bold mobile-text-12">
                      {contentC.label}
                    </Text>
                  </Column>
                ) : null}
              </Row>

              <Text className="text-[20px] font-bold text-[#fff] my-[30px] mb-[30px] mobile-text-16">
                • Deepest rabbit hole •
              </Text>
              <Section className="text-left mb-[60px]">
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text className="text-[18px] text-brand font-bold mb-[16px] mobile-text-16">
                      {data.rabbitHole.timeLabel}
                    </Text>
                    <Text className="text-[30px] font-bold text-white leading-[40px] mobile-text-24">
                      {data.rabbitHole.description}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }} align="right">
                    <Img
                      src={`${assetBaseUrl}/figma/cat_sleep.png`}
                      width="160"
                      className="mobile-rabbit-img"
                    />
                  </Column>
                </Row>
              </Section>

              <EmailButton
                href={data.diagnosis.shareUrl || "https://react.email"}
                label={data.weeklyNudge.ctaLabel}
                iconUrl={`${assetBaseUrl}/figma/download-icon_black.png`}
                type="white"
              />
            </Section>

            {/* NUDGE SECTION */}
            <Section className="bg-bgNudge py-[60px] text-center text-black">
              <Section
                className="max-w-[520px] mx-auto mobile-max-330"
                align="center"
              >
                <Text className="text-[30px] leading-[40px] font-bold mt-[0px] mb-[60px] text-center mobile-text-24">
                  “Try putting your phone down before 3 AM this week!”
                </Text>
                <Text className="text-[18px] text-center mobile-text-16">
                  {data.weeklyNudge.message}
                </Text>
                <EmailButton
                  href={data.weeklyNudge.linkUrl || "https://react.email"}
                  label="Share Invite Link"
                  iconUrl={`${assetBaseUrl}/figma/share-icon.png`}
                  type="blue"
                />
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
              <Section className="max-w-[520px] mx-auto py-10 px-5 text-center text-white mobile-max-330">
                <Img
                  src={`${assetBaseUrl}/figma/feedling-icon.png`}
                  width="120"
                  height="120"
                  className="rounded-[10px] mb-[10px] mx-auto"
                />
                <Text className="text-[30px] font-bold mb-[30px] mobile-text-24">
                  Who’s Feedling?
                </Text>
                <Text className="text-[14px] leading-[20px] text-[#fff] mb-[60px] mx-auto mobile-text-12">
                  Feeding is an app that turns your TikTok habits into a virtual
                  pet you grow and nurture with your scrolling. We&apos;re
                  launching soon!
                </Text>
                <EmailButton
                  href={"https://www.tiktok.com/@your.feedling"}
                  label="Follow us on TikTok"
                  iconUrl={`${assetBaseUrl}/figma/tiktok-icon.png`}
                  type="white"
                />
                <Text className="text-[14px] text-[#fff] text-center mobile-text-12">
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
