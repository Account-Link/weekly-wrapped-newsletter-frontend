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

interface FypScoutReportEmailProps {
  data: WeeklyData;
}

export function FypScoutReportEmail({ data }: FypScoutReportEmailProps) {
  const assetBaseUrl = data.hero.imageUrl
    ? data.hero.imageUrl.split("/figma/")[0]
    : "";
  const clampPercent = (value: number) =>
    `${Math.max(0, Math.min(100, value))}%`;
  const trendWidth = clampPercent(data.hero.trendProgress);
  const leftTrendWidth = clampPercent(100 - data.hero.trendProgress);

  // Vertical bar heights for diagnosis (max 100px)
  const maxBarHeight = 100;
  const thisWeekHeight = Math.round(
    (data.diagnosis.thisWeekValue / 100) * maxBarHeight,
  );
  const lastWeekHeight = Math.round(
    (data.diagnosis.lastWeekValue / 100) * maxBarHeight,
  );
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
          <style>{responsiveAndDarkModeCss}</style>
        </Head>
        <Preview>FYP Scout Weekly Newsletter</Preview>
        <Body className="bg-bgDark m-0 font-sans body">
          <Container className="w-full mx-auto bg-bgDark">
            {/* OPENING SECTION */}
            <Section className="bg-bgDark pt-[30px] px-5 text-center text-white">
              <Img
                src={`${assetBaseUrl}/figma/cat.gif`}
                alt="Opening Cat"
                width="223"
                height="223"
                className="mx-auto mb-[38px]"
              />
              <Text className="text-[30px] font-bold leading-[40px]">
                {data.opening.title}
              </Text>
              <Text className="text-[30px] font-bold leading-[40px]">
                {data.opening.subtitle}
              </Text>
              <Text className="text-[18px] text-white mb-10">
                {data.opening.dateRange}
              </Text>
            </Section>

            {/* TREND SECTION */}
            <Section className="h-[492px] bg-bgNudge text-center text-black">
              {/* Layer 1: Frames (Bottom) */}
              {/* <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <Img
                  src={`${assetBaseUrl}/figma/frame1.png`}
                  className="absolute left-0 top-2 max-w-[150px]"
                  alt=""
                />
                <Img
                  src={`${assetBaseUrl}/figma/frame3.png`}
                  className="absolute right-[60px] top-2 max-w-[150px]"
                  alt=""
                />
                <Img
                  src={`${assetBaseUrl}/figma/frame2.png`}
                  className="absolute left-[50%] translate-x-[-50%] top-2 max-w-[150px]"
                  alt=""
                />
              </div> */}

              {/* Layer 2: Pager BG (Middle) */}
              {/* <Img
                src={`${assetBaseUrl}/figma/pager-bg.png`}
                className="absolute inset-0 w-[1080px] h-700px z-[1]"
                alt=""
              /> */}

              {/* Layer 3: Content (Top) */}
              <Img
                src={data.trend.stickerUrl}
                alt="Topic Sticker"
                width="73"
                height="61"
                className="mx-auto pt-[10px] mb-[10px]"
              />
              <Text className="text-[30px] leading-[36px] font-bold mb-[0px]">
                {data.trend.topic}
              </Text>
              <Text className="text-[18px] text-brand mt-[0px] font-bold">
                {data.trend.statusText}
              </Text>
              <Text className="text-[18px] mt-[10px] mb-5 font-bold">
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
              <Section className="my-5" align="center">
                {data.trend.progressImageUrl ? (
                  <Section className="w-[520px] mx-0" align="left">
                    <Img
                      src={data.trend.progressImageUrl}
                      alt="Trend progress"
                      width="520"
                      height="64"
                      className="block"
                    />
                  </Section>
                ) : (
                  <>
                    <Section className="w-[520px] mx-auto h-[32px] bg-[#D1D1D1] rounded-[32px]">
                      <Row>
                        <Column
                          align="left"
                          className="bg-trendFill rounded-[32px] h-full"
                          style={{ width: trendWidth }}
                        >
                          <Img
                            src={`${assetBaseUrl}/figma/fire.png`}
                            alt=""
                            width="45"
                            height="55"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle"
                            }}
                          />
                        </Column>
                        <Column style={{ width: leftTrendWidth }}></Column>
                      </Row>
                    </Section>
                    <Section className="w-[520px] mx-auto">
                      <Section className="h-[32px] bg-[#D1D1D1] rounded-[32px] w-full">
                        <Section
                          className="relative bg-trendFill rounded-[32px] h-full"
                          style={{ width: trendWidth }}
                          align="left"
                        >
                          <Img
                            src={`${assetBaseUrl}/figma/fire.png`}
                            alt=""
                            width="45"
                            height="55"
                            className="absolute top-[-11px] right-[-22px]"
                          />
                        </Section>
                      </Section>
                    </Section>
                    <Row>
                      <Column style={{ width: "15%" }}>
                        <Text className="text-[12px] font-bold">
                          {data.trend.startTag}
                        </Text>
                      </Column>
                      <Column style={{ width: "15%" }}>
                        <Text className="text-[12px] font-bold">
                          {data.trend.endTag}
                        </Text>
                      </Column>
                    </Row>
                  </>
                )}
              </Section>
              <Button
                className="w-[236px] h-[61px] leading-[61px] mx-auto box-border rounded-[60px] bg-black text-center text-white text-[18px] font-bold"
                href="https://react.email"
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
            <Section className="bg-bgDark py-10 px-5 text-white text-center">
              <Text className="text-[20px] font-bold mb-5">
                {data.diagnosis.title}
              </Text>

              <Row className="mb-5">
                <Column className="border border-[#555] rounded-[30px] p-2.5 w-[245px] h-[104px]">
                  <Text className="text-[18px] font-bold text-brand">
                    {data.diagnosis.totalVideosValue}{" "}
                    <span className="text-[12px] text-white font-normal ml-[5px]">
                      {data.diagnosis.totalVideosUnit}
                    </span>
                  </Text>
                  <Text className="text-[12px] text-[#AAAAAA] mt-[5px]">
                    Total Videos
                  </Text>
                </Column>
                <Column className="border border-[#fffff] rounded-[30px] p-2.5 w-[245px] h-[104px] mr-[30px]">
                  <Text className="text-[18px] font-bold text-brand">
                    {data.diagnosis.totalTimeValue}{" "}
                    <span className="text-[12px] text-white font-normal ml-[5px]">
                      {data.diagnosis.totalTimeUnit}
                    </span>
                  </Text>
                  <Text className="text-[12px] text-[#AAAAAA] mt-[5px]">
                    Total Time
                  </Text>
                </Column>
              </Row>

              <Text className="text-[14px] mb-[30px]">
                {data.diagnosis.comparisonDiff && (
                  <span className="text-brand font-bold">
                    {data.diagnosis.comparisonDiff}{" "}
                  </span>
                )}
                {data.diagnosis.comparisonText}
                <br />
                Your thumb ran{" "}
                <span className="text-brand font-bold">
                  {data.diagnosis.miles} miles
                </span>{" "}
                {data.diagnosis.milesComment}
              </Text>

              <Section className="mx-auto mb-10 max-w-[300px] h-[140px] align-bottom">
                {data.diagnosis.barChartImageUrl ? (
                  <Img
                    src={data.diagnosis.barChartImageUrl}
                    alt="Weekly comparison"
                    width="300"
                    height="140"
                    className="block mx-auto"
                  />
                ) : (
                  <Row>
                    <Column className="text-center align-bottom w-1/2">
                      <Text className="text-[12px] mb-[5px] text-[#AAAAAA]">
                        {data.diagnosis.lastWeekLabel}
                      </Text>
                      <Section
                        className="bg-chartMuted w-[20px] mx-auto rounded-t-[5px]"
                        style={{ height: `${lastWeekHeight}px` }}
                      />
                    </Column>
                    <Column className="text-center align-bottom w-1/2">
                      <Text className="text-[12px] mb-[5px] text-[#AAAAAA]">
                        {data.diagnosis.thisWeekLabel}
                      </Text>
                      <Section
                        className="bg-chartActive w-[20px] mx-auto rounded-t-[5px]"
                        style={{ height: `${thisWeekHeight}px` }}
                      />
                    </Column>
                  </Row>
                )}
              </Section>

              <Text className="text-[16px] text-[#AAAAAA] my-[30px] mb-[20px]">
                • New contents you got into •
              </Text>
              <Row className="mb-[30px]">
                {data.newContents.map((content) => (
                  <Column key={content.label} className="text-center w-1/3">
                    <Img
                      src={content.stickerUrl}
                      width="88"
                      height="88"
                      className="rounded-full border-2 border-[#555] mb-[10px]"
                    />
                    <Text className="text-[12px] text-white">
                      {content.label}
                    </Text>
                  </Column>
                ))}
              </Row>

              <Text className="text-[16px] text-[#AAAAAA] my-[30px] mb-[20px]">
                - Deepest rabbit hole -
              </Text>
              <Section className="bg-[#222] rounded-[10px] p-5 my-5 text-left">
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text className="text-[12px] text-brand mb-[5px]">
                      {data.rabbitHole.timeLabel}
                    </Text>
                    <Text className="text-[16px] font-bold text-white">
                      {data.rabbitHole.description}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }}>
                    <Img
                      src={data.rabbitHole.imageUrl}
                      width="120"
                      className="rounded-full border-2 border-white"
                    />
                  </Column>
                </Row>
              </Section>

              <Section className="bg-white rounded-[20px] py-[10px] px-5 inline-block my-5">
                <Link href="#" className="text-black no-underline font-bold">
                  <Text className="m-0 text-black">
                    {data.weeklyNudge.ctaLabel}
                  </Text>
                </Link>
              </Section>
            </Section>

            {/* NUDGE SECTION */}
            <Section className="bg-bgNudge pt-10 px-5 text-center text-black">
              <Text className="text-[18px] font-bold mb-[10px]">
                {data.weeklyNudge.title}
              </Text>
              <Text className="text-[14px] mb-5">
                {data.weeklyNudge.message}
              </Text>
              <Section className="bg-trendFill rounded-[20px] py-[10px] px-[30px] inline-block mb-10">
                <Link href="#" className="text-white no-underline font-bold">
                  Share Invite Link
                </Link>
              </Section>
              <Img
                src={`${assetBaseUrl}/figma/torn-paper-bottom-grey.png`}
                alt="Divider"
                width="600"
                className="block w-full max-w-[600px]"
              />
            </Section>

            {/* FOOTER */}
            <Section className="bg-bgDark py-10 px-5 text-center text-white">
              <Img
                src={`${assetBaseUrl}/figma/feedling-icon.png`}
                width="80"
                height="80"
                className="rounded-[10px] mb-[10px]"
              />
              <Text className="text-[18px] font-bold mb-[10px]">
                Who’s Feedling?
              </Text>
              <Text className="text-[12px] text-[#AAAAAA] mb-5 max-w-[400px] mx-auto">
                Feeding is an app that turns your TikTok habits into a virtual
                pet you grow and nurture with your scrolling. We're launching
                soon!
              </Text>
              <Section className="bg-white rounded-[20px] py-[10px] px-5 inline-block mb-10">
                <Link href="#" className="text-black no-underline font-bold">
                  Follow us on TikTok
                </Link>
              </Section>
              <Img
                src={`${assetBaseUrl}/figma/footer-decors.png`}
                width="600"
                className="w-full max-w-[600px]"
              />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

// 保留 body 暗色模式兜底，并重置 p 标签默认 margin
const responsiveAndDarkModeCss = `
  @media (prefers-color-scheme: dark) {
    .body { background-color: #000000 !important; }
  }
`;
