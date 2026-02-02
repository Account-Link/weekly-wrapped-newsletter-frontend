import React from "react";
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
  Link,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { WeeklyData } from "../src/lib/firebase-admin";
import { EmailButton } from "./components/EmailButton";
import { FEEDLING_COPY_MAP } from "../src/domain/report/logic-map";
import { getClickTrackingUrl, getOpenPixelUrl } from "../src/lib/tracking";

import TrendBg from "../src/assets/figma/trend-bg.png";
import CatBgCurious from "../src/assets/figma/cat-bg_curious.png";
import CatBgExcited from "../src/assets/figma/cat-bg_excited.png";
import CatBgCozy from "../src/assets/figma/cat-bg_cozy.png";
import CatBgSleepy from "../src/assets/figma/cat-bg_sleepy.png";
import CatBgDizzy from "../src/assets/figma/cat-bg_dizzy.png";
import CatCuriousGif from "../src/assets/figma/cat_curious.gif";
import CatExcitedGif from "../src/assets/figma/cat_excited.gif";
import CatCozyGif from "../src/assets/figma/cat_cozy.gif";
import CatSleepyGif from "../src/assets/figma/cat_sleepy.gif";
import CatDizzyGif from "../src/assets/figma/cat_dizzy.gif";
import TrendIconSound from "../src/assets/figma/trend-icon_sound.png";
import TrendIconHashtag from "../src/assets/figma/trend-icon_hashtag.png";
import TrendIconCreator from "../src/assets/figma/trend-icon_creator.png";
import TrendIconFormat from "../src/assets/figma/trend-icon_format.png";
import TrendIconDefault from "../src/assets/figma/trend-icon.png";
import TrendIconBg from "../src/assets/figma/trend-icon-bg.png";
import StatsIcon from "../src/assets/figma/stats-icon.png";
import CatSleep from "../src/assets/figma/cat_sleep.png";
import BtnTrend from "../src/assets/figma/btn_trend.png";
import BtnStats from "../src/assets/figma/btn_stats.png";
import BtnInvite from "../src/assets/figma/btn_invite.png";
import BottomBg from "../src/assets/figma/bottom-bg.png";
import FeedlingIcon from "../src/assets/figma/feedling-icon_x2.png";
import BtnFollow from "../src/assets/figma/btn_follow.png";
import ContentSticker1 from "../src/assets/figma/content-sticker-1.png";
import ContentSticker2 from "../src/assets/figma/content-sticker-2.png";
import ContentSticker3 from "../src/assets/figma/content-sticker-3.png";

// 方法功能：邮件模板入参定义
interface FypScoutReportEmailProps {
  data: WeeklyData;
}

// 方法功能：渲染周报邮件模板
export function FypScoutReportEmail({ data }: FypScoutReportEmailProps) {
  // 重要逻辑：从已有资源 URL 推导静态资源根路径
  const assetBaseUrl = data.assetBaseUrl
    ? data.assetBaseUrl.replace(/\/$/, "")
    : "";
  const getImgUrl = (src: string) => {
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    return `${assetBaseUrl}${src}`;
  };

  const openingCopyByState: Record<WeeklyData["feedlingState"], string> =
    FEEDLING_COPY_MAP;
  const catBgByState = {
    curious: CatBgCurious,
    excited: CatBgExcited,
    cozy: CatBgCozy,
    sleepy: CatBgSleepy,
    dizzy: CatBgDizzy,
  };
  const catIconByState = {
    curious: CatCuriousGif,
    excited: CatExcitedGif,
    cozy: CatCozyGif,
    sleepy: CatSleepyGif,
    dizzy: CatDizzyGif,
  };
  const catIconLeftByState: Record<
    WeeklyData["feedlingState"],
    number | string
  > = {
    curious: 136,
    cozy: 232,
    excited: 55,
    sleepy: 89,
    dizzy: 198,
  };
  const catIconLeft = catIconLeftByState[data.feedlingState];
  const catIconSizeByState: Record<WeeklyData["feedlingState"], number> = {
    curious: 249,
    sleepy: 240,
    excited: 223,
    cozy: 223,
    dizzy: 223,
  };
  const catIconSize = catIconSizeByState[data.feedlingState];
  const normalizedCatIconLeft = Number(catIconLeft) || 0;
  const openingIconSizePercent = (catIconSize / 520) * 100;
  const openingIconLeftPercent = (normalizedCatIconLeft / 520) * 100;
  const openingCopy =
    openingCopyByState[data.feedlingState] ||
    "This week you explored a lot of new corners in TikTok.";
  const highlightByState: Record<WeeklyData["feedlingState"], string> = {
    curious: "new corners",
    excited: "trend instincts",
    cozy: "balanced week",
    sleepy: "late nights",
    dizzy: "little chaotic",
  };
  const highlightTarget = highlightByState[data.feedlingState] || "";
  const trendIconByType = {
    sound: TrendIconSound,
    hashtag: TrendIconHashtag,
    creator: TrendIconCreator,
    format: TrendIconFormat,
  };
  const trendIconFile = data.trend.type
    ? trendIconByType[data.trend.type]
    : TrendIconDefault;
  // 方法功能：将高亮关键词拆分为前中后三段
  const getHighlightParts = (text: string, target: string) => {
    // 重要逻辑：大小写不敏感匹配，保留原始文本
    if (!target) return [text, "", ""];
    const lowerText = text.toLowerCase();
    const lowerTarget = target.toLowerCase();
    const index = lowerText.indexOf(lowerTarget);
    if (index === -1) return [text, "", ""];
    const start = index;
    const end = index + target.length;
    return [text.slice(0, start), text.slice(start, end), text.slice(end)];
  };
  // 方法功能：转义正则特殊字符
  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 方法功能：将发现文案拆分并高亮排名/总数
  const buildDiscoverySegments = (
    text: string | undefined,
    rank: number,
    total: number,
  ) => {
    // 重要逻辑：使用正则捕获排名与总数字串并渲染强调样式
    const rankToken = `#${rank.toLocaleString()}`;
    const totalToken = total.toLocaleString();
    const regex = new RegExp(
      `(${escapeRegExp(rankToken)}|${escapeRegExp(totalToken)})`,
      "g",
    );
    return (text ?? "")
      .split(regex)
      .filter(Boolean)
      .map((part, index) => {
        if (part === rankToken || part === totalToken) {
          return (
            <span
              key={`discovery-${index}`}
              className="text-brand text-[24px] font-bold mobile-text-16"
            >
              {part}
            </span>
          );
        }
        return part;
      });
  };
  const [openingPrefix, openingHighlight, openingSuffix] = getHighlightParts(
    openingCopy,
    highlightTarget,
  );
  // 重要逻辑：使用 weekStart 作为 emailId，保证同一封邮件的去重一致
  const emailId = data.weekStart;
  // 重要逻辑：生成打开埋点像素 URL
  const trackingPixelUrl = getOpenPixelUrl(
    data.uid,
    emailId,
    data.trackingBaseUrl,
  );
  // 重要逻辑：构建点击追踪 URL，避免邮件内直连造成丢失统计
  const trendShareTrackingUrl =
    data.trend.shareUrl && data.trackingBaseUrl
      ? getClickTrackingUrl(
          data.uid,
          emailId,
          "share_week",
          data.trend.shareUrl,
          data.trackingBaseUrl,
        )
      : data.trend.shareUrl || "";
  const statsShareTrackingUrl =
    data.diagnosis.shareUrl && data.trackingBaseUrl
      ? getClickTrackingUrl(
          data.uid,
          emailId,
          "share_stats",
          data.diagnosis.shareUrl,
          data.trackingBaseUrl,
        )
      : data.diagnosis.shareUrl || "";
  const inviteTrackingUrl =
    data.weeklyNudge.linkUrl && data.trackingBaseUrl
      ? getClickTrackingUrl(
          data.uid,
          emailId,
          "invite_click",
          data.weeklyNudge.linkUrl,
          data.trackingBaseUrl,
        )
      : data.weeklyNudge.linkUrl || "";
  const unsubscribeTrackingUrl = data.trackingBaseUrl
    ? getClickTrackingUrl(
        data.uid,
        emailId,
        "unsubscribe",
        undefined,
        data.trackingBaseUrl,
      )
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
          black: "#000001",
          white: "#fffffe",
          brand: "#FF5678",
          bgDark: "#313131",
          bgNudge: "#E4E4E4",
          trendFill: "#6A00F4",
          chartActive: "#00CC66",
          chartMuted: "#555555",
        },
      },
    },
  };
  type NewContentItem = WeeklyData["newContents"][number];
  const contentStickers = [ContentSticker1, ContentSticker2, ContentSticker3];
  const newContents = data.newContents.slice(0, 3);
  const contentCount = newContents.length;
  const renderNewContent = (content: NewContentItem, index: number) => {
    let imgSrc = content.stickerUrl;
    if (imgSrc.includes("content-sticker-")) {
      imgSrc = (contentStickers[index] || ContentSticker1).src;
    }
    return (
      <Column
        className="text-center mobile-content-item"
        align="center"
        style={{ width: "150px" }}
      >
        <Img
          src={getImgUrl(imgSrc)}
          width="150"
          height="150"
          className="rounded-full border-[1px] border-[#fffffe4d] mb-[10px] mx-auto mobile-content-img"
        />
        <Text className="text-[16px] text-[#fffffe] font-bold mobile-text-12 force-text-light">
          {content.label}
        </Text>
      </Column>
    );
  };

  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <style>{`
:root {
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  .force-dark {
    background-color: #313131 !important;
    background-image: linear-gradient(#313131, #313131) !important;
    color: #fffffe !important;
  }
  .force-light {
    background-color: #e4e4e4 !important;
    color: #000001 !important;
  }
  .force-text-dark {
    color: #000001 !important;
  }
  .force-text-light {
    color: #fffffe !important;
  }
  .force-text-light-70 {
    color: rgba(255, 255, 255, 0.7) !important;
  }
  .keep-brand {
    color: #ff5678 !important;
  }
}
[data-ogsc] .force-dark {
  background-color: #313131 !important;
  background-image: linear-gradient(#313131, #313131) !important;
  color: #fffffe !important;
}
[data-ogsc] .force-light {
  background-color: #e4e4e4 !important;
  color: #000001 !important;
}
[data-ogsc] .force-text-dark {
  color: #000001 !important;
}
[data-ogsc] .force-text-light {
  color: #fffffe !important;
}
[data-ogsc] .keep-brand {
  color: #ff5678 !important;
}
@media screen and (max-width: 480px) {
  .mobile-max-330 {
    max-width: 330px !important;
  }
  .mobile-width-330 {
    width: 330px !important;
    max-width: 330px !important;
  }
  .mobile-opening-bg {
    width: 330px !important;
    height: 127px !important;
    background-size: 330px 127px !important;
  }
  .mobile-opening-cell {
    height: 127px !important;
  }
  .mobile-img-330 {
    width: 330px !important;
    height: auto !important;
  }
  .mobile-img-376 {
    width: 376px !important;
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
        <Body
          className="m-0 p-0 w-full box-border"
          style={{ margin: 0, padding: 0, width: "100%" }}
        >
          {trackingPixelUrl ? (
            <Img
              src={trackingPixelUrl}
              alt=""
              width="1"
              height="1"
              style={{ display: "none" }}
            />
          ) : null}
          <Container
            className="w-full max-w-[1080px] mx-auto box-border"
            style={{
              width: "100%",
              maxWidth: "1080px",
              backgroundColor: "#313131",
              backgroundImage: "linear-gradient(#313131, #313131)",
            }}
          >
            {/* First Screen */}
            <Section
              style={{
                backgroundImage: `url(${getImgUrl(TrendBg.src)})`,
                backgroundSize: "1080px 739px",
                backgroundPosition: "center bottom",
                backgroundRepeat: "no-repeat",
              }}
              className="box-border"
            >
              {/* OPENING SECTION */}
              <Section className="pt-[30px] pb-[60px] px-5 text-center text-[#fffffe] box-border">
                <Section
                  align="center"
                  className="mx-auto mb-[38px] w-[520px] h-[200px] bg-size-[520px_200px] bg-center bg-no-repeat mobile-width-330 mobile-opening-bg"
                  style={{
                    backgroundImage: `url(${getImgUrl((catBgByState[data.feedlingState] || CatBgCurious).src)})`,
                  }}
                >
                  <Row>
                    <Column
                      className="mobile-opening-cell"
                      style={{
                        height: "200px",
                        verticalAlign: "middle",
                      }}
                    >
                      <Img
                        src={getImgUrl(
                          (catIconByState[data.feedlingState] || CatCuriousGif)
                            .src,
                        )}
                        alt="Opening Cat Icon"
                        width={catIconSize}
                        height={catIconSize}
                        style={{
                          display: "block",
                          width: `${openingIconSizePercent}%`,
                          height: "auto",
                          marginLeft: `${openingIconLeftPercent}%`,
                        }}
                      />
                    </Column>
                  </Row>
                </Section>
                <Text className="text-[30px] w-[480px] mx-auto font-bold leading-[40px] mb-[0px] mobile-text-24 mobile-max-330">
                  {openingPrefix}
                  {openingHighlight ? (
                    <span
                      className="text-brand keep-brand"
                      style={{ marginLeft: 4, marginRight: 4 }}
                    >
                      {openingHighlight}
                    </span>
                  ) : null}
                  {openingSuffix}
                </Text>
                <Text className="text-[18px] text-[#fffffe] mb-10 mobile-text-16">
                  {data.opening.dateRange}
                </Text>
              </Section>

              {/* TREND SECTION */}
              <Section className="h-[570px] w-full text-center text-[#000001] p-[40px] box-border">
                <Section
                  className="mx-auto mb-[0px] w-[126px] h-[113px] align-middle"
                  style={{
                    backgroundImage: `url(${getImgUrl(TrendIconBg.src)})`,
                    backgroundSize: "cover",
                  }}
                  align="center"
                >
                  <Img
                    src={getImgUrl(trendIconFile.src)}
                    alt="Topic Sticker"
                    width="73"
                    height="60"
                    className="mx-auto align-middle"
                  />
                </Section>
                <Text className="text-[30px] leading-[36px] font-bold mt-[0px] mb-[0px] mobile-text-28">
                  {data.trend.topic}
                </Text>
                <Text className="text-[18px] text-brand mt-[0px] font-bold mobile-text-16 keep-brand">
                  {data.trend.statusText}
                </Text>
                <Text className="text-[18px] font-bold mb-[10px] mobile-text-16">
                  {data.trend.rank !== null
                    ? buildDiscoverySegments(
                        data.trend.discoveryText,
                        data.trend.rank,
                        data.trend.totalDiscoverers,
                      )
                    : data.trend.discoveryText}
                </Text>
                <Section align="center">
                  {data.trend.progressImageUrl ? (
                    <Section
                      className="w-full mx-auto text-center"
                      align="center"
                    >
                      <Img
                        src={data.trend.progressImageUrl}
                        alt="Trend progress"
                        width="566px"
                        height="auto"
                        className="mobile-img-376"
                        style={{ margin: "0 auto", display: "inline-block" }}
                      />
                    </Section>
                  ) : null}
                </Section>
                <Section
                  className=" w-[520px] text-[16px] text-[#000001] font-bold mobile-width-330"
                  align="center"
                >
                  <Row>
                    <Column className="w-[50%]" align="left">
                      {/* <Text className="mt-[0px] leading-[14px] mb-[0px]">
                      {data.trend.startTag}
                    </Text> */}
                      <Text className="mt-[0px]">
                        {data.trend.startPercent}
                      </Text>
                    </Column>
                    <Column className="w-[50%]" align="right">
                      {/* <Text className="mt-[0px] leading-[14px] mb-[0px]">
                      {data.trend.endTag}
                    </Text> */}
                      <Text className="mt-[0px]">{data.trend.endPercent}</Text>
                    </Column>
                  </Row>
                </Section>
                <EmailButton
                  href={trendShareTrackingUrl}
                  imageUrl={getImgUrl(BtnTrend.src)}
                  label={data.trend.ctaLabel}
                  height={61}
                />
              </Section>
            </Section>

            {/* DIAGNOSIS SECTION */}
            <Section className="max-w-[520px] mx-auto py-10 px-[40px] text-[#fffffe] text-center mobile-max-330 mobile-px-20 box-border">
              <Img
                src={getImgUrl(StatsIcon.src)}
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
                  className="border border-[#fffffe4d] rounded-[30px] w-[245px] h-[104px] text-center mobile-stat-box"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile-text-20 keep-brand">
                    {data.diagnosis.totalVideosValue}{" "}
                    {data.diagnosis.totalVideosUnit}
                  </Text>
                  <Text className="text-[14px] text-[#fffffe] mt-[0px] mobile-text-12 force-text-light">
                    Total Videos
                  </Text>
                </Column>
                <Column className="w-[30px] mobile-gap-20"></Column>
                <Column
                  className="border border-[#fffffe4d] rounded-[30px] w-[245px] h-[104px] mr-[30px] text-center mobile-stat-box"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile-text-20 keep-brand">
                    {data.diagnosis.totalTimeValue}{" "}
                    {data.diagnosis.totalTimeUnit}
                  </Text>
                  <Text className="text-[14px] text-[#fffffe] mt-[0px] mobile-text-12 force-text-light">
                    Total Time
                  </Text>
                </Column>
              </Row>

              <Text className="text-[18px] mb-[30px] leading-[32px] font-bold mobile-text-16">
                {data.diagnosis.comparisonDiff && (
                  <span className="text-[24px] text-brand mobile-text-22 keep-brand">
                    {data.diagnosis.comparisonDiff}{" "}
                  </span>
                )}
                {data.diagnosis.comparisonText}
                <br />
                <span className="mobile-text-16">
                  Your thumb ran{" "}
                  <span className="text-[24px] text-brand mobile-text-22 keep-brand">
                    {data.diagnosis.miles} miles
                  </span>{" "}
                  {data.diagnosis.milesComment}
                </span>
              </Text>

              <Section className="mx-auto mb-10 align-bottom">
                {data.diagnosis.barChartImageUrl ? (
                  <Img
                    src={data.diagnosis.barChartImageUrl}
                    alt="Weekly comparison"
                    width="520"
                    className="block mx-auto mobile-img-330"
                  />
                ) : null}
              </Section>

              <Text className="text-[20px] font-bold text-[#fffffe] leading-none mt-[40px] mb-[60px] mobile-text-16 force-text-light">
                • New contents you got into •
              </Text>
              {contentCount > 0 ? (
                <Row
                  className="mb-[30px] w-[520px] mx-auto mobile-width-330"
                  align="center"
                >
                  {contentCount === 1 ? (
                    <>
                      <Column className="w-[185px] mobile-gap-12"></Column>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[185px] mobile-gap-12"></Column>
                    </>
                  ) : null}
                  {contentCount === 2 ? (
                    <>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[220px] mobile-gap-12"></Column>
                      {renderNewContent(newContents[1], 1)}
                    </>
                  ) : null}
                  {contentCount === 3 ? (
                    <>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[35px] mobile-gap-12"></Column>
                      {renderNewContent(newContents[1], 1)}
                      <Column className="w-[35px] mobile-gap-12"></Column>
                      {renderNewContent(newContents[2], 2)}
                    </>
                  ) : null}
                </Row>
              ) : null}

              <Text className="text-[20px] font-bold text-[#fffffe] my-[30px] mb-[30px] mobile-text-16">
                • Deepest rabbit hole •
              </Text>
              <Section className="text-left mb-[60px]">
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text className="text-[18px] text-brand font-bold mb-[16px] mobile-text-16 keep-brand">
                      {data.rabbitHole.timeLabel}
                    </Text>
                    <Text className="text-[30px] font-bold text-[#fffffe] leading-[40px] mobile-text-24">
                      {data.rabbitHole.description}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }} align="right">
                    <Img
                      src={getImgUrl(CatSleep.src)}
                      width="160"
                      height="160"
                      className="mobile-rabbit-img"
                    />
                  </Column>
                </Row>
              </Section>

              <EmailButton
                href={statsShareTrackingUrl}
                label={data.weeklyNudge.ctaLabel}
                imageUrl={getImgUrl(BtnStats.src)}
                height={61}
              />
            </Section>

            {/* NUDGE SECTION */}
            <Section className="bg-bgNudge py-[60px] text-center text-[#000001] force-light box-border">
              <Section
                className="max-w-[520px] mx-auto mobile-max-330"
                align="center"
              >
                <Text className="text-[30px] leading-[40px] font-bold mt-[0px] mb-[60px] text-center mobile-text-24">
                  {data.weeklyNudge.title}
                </Text>
                <Text className="text-[18px] text-center mobile-text-16">
                  {data.weeklyNudge.message}
                </Text>
                <EmailButton
                  href={inviteTrackingUrl}
                  label={data.weeklyNudge.ctaLabel}
                  imageUrl={getImgUrl(BtnInvite.src)}
                  height={61}
                />
              </Section>
            </Section>

            {/* FOOTER */}
            <Section
              className="w-full text-center pb-[160px] box-border"
              style={{
                backgroundImage: `url(${getImgUrl(BottomBg.src)})`,
                backgroundSize: "1080px 258px",
                backgroundPosition: "bottom center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Section className="max-w-[520px] mx-auto py-10 px-5 text-center text-[#fffffe] mobile-max-330 force-text-light">
                <Img
                  src={getImgUrl(FeedlingIcon.src)}
                  width="120"
                  height="120"
                  className="rounded-[10px] mb-[10px] mx-auto"
                />
                <Text className="text-[30px] font-bold mb-[30px] mobile-text-24">
                  Who’s Feedling?
                </Text>
                <Text className="text-[14px] leading-[20px] text-[#fffffe] mb-[60px] mx-auto mobile-text-12">
                  Feeding is an app that turns your TikTok habits into a virtual
                  pet you grow and nurture with your scrolling. We&apos;re
                  launching soon!
                </Text>
                <EmailButton
                  href={"https://www.tiktok.com/@your.feedling"}
                  label="Follow us on TikTok"
                  imageUrl={getImgUrl(BtnFollow.src)}
                  height={61}
                />
                <Section className="text-white/70 text-center text-[14px] leading-[20px] mt-[30px]">
                  <Link
                    className="text-white/70 mr-[4px]"
                    href={unsubscribeTrackingUrl}
                    style={{ textDecoration: "underline", color: "#ffffffb3" }}
                  >
                    Unsubscribe
                  </Link>
                  <Text className="inline-block m-0 mx-2 text-white/70">|</Text>
                  <Link
                    className="text-white/70 ml-[4px]"
                    href="https://feedling.app/privacy"
                    style={{ textDecoration: "underline", color: "#ffffffb3" }}
                  >
                    Privacy Policy
                  </Link>
                </Section>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
