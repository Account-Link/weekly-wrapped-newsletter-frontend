import React from "react";
import {
  Body,
  Column,
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
import {
  getClickTrackingUrl,
  getOpenPixelUrl,
} from "../src/lib/tracking/server";

import SplitBg from "../src/assets/figma/split-bg.png";
import CatCuriousGif from "../src/assets/figma/Curious.gif";
import CatExcitedGif from "../src/assets/figma/Excited.gif";
import CatCozyGif from "../src/assets/figma/Cozy.gif";
import CatSleepyGif from "../src/assets/figma/Sleepy.gif";
import CatDizzyGif from "../src/assets/figma/Dizzy.gif";
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

  const catIconByState = {
    curious: CatCuriousGif,
    excited: CatExcitedGif,
    cozy: CatCozyGif,
    sleepy: CatSleepyGif,
    dizzy: CatDizzyGif,
  };

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
              className="text-brand text-[24px] font-bold mobile:text-[16px]"
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
  // 辅助函数：注入通用参数到目标 URL
  const targetParams = new URLSearchParams();
  targetParams.set("uid", data.uid);
  if (data.period_start) targetParams.set("period_start", data.period_start);
  if (data.period_end) targetParams.set("period_end", data.period_end);
  const paramsString = targetParams.toString();

  const appendParams = (url: string) => {
    if (!url) return "";
    const hasQuery = url.includes("?");
    return `${url}${hasQuery ? "&" : "?"}${paramsString}`;
  };

  // 重要逻辑：使用 weekStart 作为 emailId，保证同一封邮件的去重一致
  const emailId = data.id ? String(data.id) : data.weekStart;

  // 重要逻辑：生成打开埋点像素 URL
  const trackingPixelUrl = getOpenPixelUrl(data.uid, emailId);
  // 重要逻辑：构建点击追踪 URL，避免邮件内直连造成丢失统计
  const trendShareTrackingUrl = data.trend.shareUrl
    ? getClickTrackingUrl({
        uid: data.uid,
        emailId,
        type: "redirect",
        action: "share_week",
        targetUrl: appendParams(data.trend.shareUrl),
        extraData: {
          period_start: data.period_start,
          period_end: data.period_end,
        },
      })
    : data.trend.shareUrl || "";
  const statsShareTrackingUrl = data.diagnosis.shareUrl
    ? getClickTrackingUrl({
        uid: data.uid,
        emailId,
        type: "redirect",
        action: "share_stats",
        targetUrl: appendParams(data.diagnosis.shareUrl),
        extraData: {
          period_start: data.period_start,
          period_end: data.period_end,
        },
      })
    : data.diagnosis.shareUrl || "";
  const inviteTrackingUrl = getClickTrackingUrl({
    uid: data.uid,
    emailId,
    type: "redirect",
    action: "invite_click",
    targetUrl: `/invite?${paramsString}`,
    extraData: {
      period_start: data.period_start,
      period_end: data.period_end,
    },
  });
  const unsubscribeTrackingUrl = getClickTrackingUrl({
    uid: data.uid,
    emailId,
    type: "redirect",
    action: "unsubscribe",
    targetUrl: `/unsubscribe?${paramsString}`,
    extraData: {
      period_start: data.period_start,
      period_end: data.period_end,
    },
  });
  const tailwindConfig = {
    theme: {
      spacing: {},
      fontSize: {},
      extend: {
        colors: {
          black: "#000000",
          white: "#ffffff",
          brand: "#FF5678",
          bgDark: "#313131",
          bgWhite: "#E4E4E4",
        },
        screens: {
          mobile: { max: "480px" },
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
      <Column className="text-center w-[150px] mobile:w-[100px]" align="center">
        <Img
          src={getImgUrl(imgSrc)}
          width="150"
          height="150"
          className="w-[150px] mobile:w-[100px] h-[150px] mobile:h-[100px] rounded-full border-[1px] border-[#ffffff4d] mb-[10px]"
        />
        <Text className="text-[16px] text-white font-bold mobile:text-[12px]">
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
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <style></style>
        </Head>
        {/* <Preview>FYP Scout Weekly Newsletter</Preview> */}
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
          <Section
            className="w-full max-w-[600px] mx-auto box-border bg-bgDark"
            style={{
              width: "100%",
            }}
          >
            {/* OPENING SECTION */}
            <Section
              className="pt-[30px] pb-[60px] px-5 text-center text-white box-border"
              style={{
                backgroundImage: `url(${getImgUrl(SplitBg.src)})`,
                backgroundSize: "1080px 194px",
                backgroundPosition: "center bottom",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Img
                width="520"
                height="200"
                className="mx-auto mb-[38px] w-[520px] h-[200px] mobile:w-[330px] mobile:h-[127px]"
                src={getImgUrl(
                  (catIconByState[data.feedlingState] || CatCuriousGif).src,
                )}
                alt="Opening Cat Icon"
              />
              <Text className="text-[30px] w-[480px] mx-auto font-bold leading-[40px] mb-[0px] mobile:text-[24px] mobile:leading-[32px] mobile:w-[330px]">
                {openingPrefix}
                {openingHighlight ? (
                  <span
                    className="text-brand"
                    style={{ marginLeft: 4, marginRight: 4 }}
                  >
                    {openingHighlight}
                  </span>
                ) : null}
                {openingSuffix}
              </Text>
              <Text className="text-[18px] text-white mb-10 mobile:text-[16px]">
                {data.opening.dateRange}
              </Text>
            </Section>

            {/* TREND SECTION */}
            <Section className="h-[570px] w-full text-center  text-black py-[40px] box-border bg-bgWhite">
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
              <Text className="text-[30px] leading-[36px] font-bold mt-[0px] mb-[0px]  text-black mobile:text-[24px] mobile:leading-[40px]">
                {data.trend.topic}
              </Text>
              <Text className="text-[18px] text-brand mt-[0px] font-bold mobile:text-[16px]">
                {data.trend.statusText}
              </Text>
              <Text
                className="text-[18px] font-bold mb-[10px] text-black mobile:text-[16px] "
                style={{ color: "#111" }}
              >
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
                      width="566"
                      src={data.trend.progressImageUrl}
                      alt="Trend progress"
                      className="mx-auto inline-block w-[566px] mobile:w-[376px]"
                    />
                  </Section>
                ) : null}
              </Section>
              <Section
                className="mx-auto w-[520px] text-[16px] text-black font-bold mobile:w-[330px]"
                align="center"
              >
                <Row>
                  <Column className="w-[50%]" align="left">
                    {/* <Text className="mt-[0px] leading-[14px] mb-[0px] text-black">
                      {data.trend.startTag}
                    </Text> */}
                    <Text className="mt-[0px] text-black">
                      {data.trend.startPercent}
                    </Text>
                  </Column>
                  <Column className="w-[50%]" align="right">
                    {/* <Text className="mt-[0px] leading-[14px] mb-[0px] text-black">
                      {data.trend.endTag}
                    </Text> */}
                    <Text className="mt-[0px] text-black">
                      {data.trend.endPercent}
                    </Text>
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

            {/* DIAGNOSIS SECTION */}
            <Section className="w-[520px] mx-auto py-[40px] text-white text-center mobile:w-[330px] mobile:px-20 box-border">
              <Img
                src={getImgUrl(StatsIcon.src)}
                alt="Topic Sticker"
                width="126"
                height="113"
                className="mx-auto mb-[0px]"
              />
              <Text className="text-[30px] font-bold mt-[0px] mb-[60px] mobile:text-[24px] mobile:mb-[40px]">
                {data.diagnosis.title}
              </Text>

              <Row className="mb-[56px] mobile:mb-[40px]">
                <Column
                  className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px] text-center mobile:w-[155px] mobile:h-[72px]"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile:text-[20px]">
                    {data.diagnosis.totalVideosValue}{" "}
                    {data.diagnosis.totalVideosUnit}
                  </Text>
                  <Text className="text-[14px] text-white mt-[0px] mobile:text-[12px]">
                    Total Videos
                  </Text>
                </Column>
                <Column className="w-[30px] mobile:w-[20px]"></Column>
                <Column
                  className="border border-[#ffffff4d] rounded-[30px] w-[245px] h-[104px] mr-[30px] text-center mobile:w-[155px] mobile:h-[72px]"
                  align="center"
                >
                  <Text className="text-[30px] font-bold text-brand leading-[36px] mb-[0px] mobile:text-[20px]">
                    {data.diagnosis.totalTimeValue}{" "}
                    {data.diagnosis.totalTimeUnit}
                  </Text>
                  <Text className="text-[14px] text-white mt-[0px] mobile:text-[12px]">
                    Total Time
                  </Text>
                </Column>
              </Row>

              <Text className="text-[18px] mb-[30px] leading-[32px] font-bold mobile:text-[16px]">
                {data.diagnosis.comparisonDiff && (
                  <span className="text-[24px] text-brand mobile:text-[22px]">
                    {data.diagnosis.comparisonDiff}{" "}
                  </span>
                )}
                {data.diagnosis.comparisonText}
                <br />
                <span>
                  Your thumb ran{" "}
                  <span className="text-[24px] text-brand mobile:text-[22px]">
                    {data.diagnosis.miles} miles
                  </span>{" "}
                  {data.diagnosis.milesComment}
                </span>
              </Text>

              <Section className="mx-auto mb-[40px] align-bottom">
                {data.diagnosis.barChartImageUrl ? (
                  <Img
                    src={data.diagnosis.barChartImageUrl}
                    alt="Weekly comparison"
                    width="520"
                    className="block w-[520px] mx-auto mobile:w-[330px]"
                  />
                ) : null}
              </Section>

              <Text className="text-[20px] font-bold text-white leading-none mt-[40px] mb-[60px] mobile:text-[16px]">
                • New contents you got into •
              </Text>
              {contentCount > 0 ? (
                <Row
                  className="mb-[30px] w-[520px] mx-auto mobile:w-[330px]"
                  align="center"
                >
                  {contentCount === 1 ? (
                    <>
                      <Column className="w-[185px] mobile:w-[115px]"></Column>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[185px] mobile:w-[115px]"></Column>
                    </>
                  ) : null}
                  {contentCount === 2 ? (
                    <>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[220px] mobile:w-[130px]"></Column>
                      {renderNewContent(newContents[1], 1)}
                    </>
                  ) : null}
                  {contentCount === 3 ? (
                    <>
                      {renderNewContent(newContents[0], 0)}
                      <Column className="w-[35px] mobile:w-[15px]"></Column>
                      {renderNewContent(newContents[1], 1)}
                      <Column className="w-[35px] mobile:w-[15px]"></Column>
                      {renderNewContent(newContents[2], 2)}
                    </>
                  ) : null}
                </Row>
              ) : null}

              <Text className="text-[20px] font-bold text-white my-[30px] mb-[30px] mobile:text-[16px]">
                • Deepest rabbit hole •
              </Text>
              <Section className="text-left mb-[60px]">
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text className="text-[18px] text-brand font-bold mb-[16px] mobile:text-[16px]">
                      {data.rabbitHole.timeLabel}
                    </Text>
                    <Text className="text-[30px] font-bold text-white leading-[40px] mobile:text-[24px] mobile-leading-[36px]">
                      {data.rabbitHole.description}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%" }} align="right">
                    <Img
                      src={getImgUrl(CatSleep.src)}
                      width="160"
                      className="w-[160px] mobile:w-[120px]"
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
            <Section className="bg-bgWhite py-[60px] text-center text-black box-border">
              <Section
                className="w-[520px] mx-auto mobile:w-[330px]"
                align="center"
              >
                <Text className="text-[30px] leading-[40px] font-bold mt-[0px] mb-[60px] text-center mobile:text-[24px] mobile-leading-[36px]">
                  {data.weeklyNudge.title}
                </Text>
                <Text className="text-[18px] text-center mobile:text-[16px] mobile-leading-[24px] text-black">
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
              <Section className="w-[520px] mx-auto py-[40px] text-center text-white mobile:w-[330px]">
                <Img
                  src={getImgUrl(FeedlingIcon.src)}
                  width="120"
                  height="120"
                  className="rounded-[10px] mb-[10px] mx-auto"
                />
                <Text className="text-[30px] font-bold mb-[30px] mobile:text-[24px]">
                  Who’s Feedling?
                </Text>
                <Text className="text-[14px] leading-[20px] text-white mb-[60px] mx-auto">
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
                  <Text className="inline-block m-[0px] mx-[8px] text-white/70">
                    |
                  </Text>
                  <Link
                    className="text-white/70 ml-[4px]"
                    href="https://jjpi4asql2zl.jp.larksuite.com/wiki/Mt9VwGGZcimz1Skgqj2jsGa8pXe"
                    style={{ textDecoration: "underline", color: "#ffffffb3" }}
                  >
                    Privacy Policy
                  </Link>
                  <Text className="text-white/70 text-[14px] text-center mobile:text-[12px] mt-[30px]">
                    @ Honey Badger Cooperation Labs, Inc.
                    <br />
                    123 Main St, San Francisco, CA 94102
                  </Text>
                </Section>
              </Section>
            </Section>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  );
}
