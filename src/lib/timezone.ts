/**
 * 获取用户浏览器的时区
 * @returns IANA时区标识符，如 "America/New_York" 或 "Asia/Shanghai"
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    // 降级方案：如果浏览器不支持，返回UTC
    console.warn("Failed to get timezone, falling back to UTC", error);
    return "UTC";
  }
}

/**
 * 检测时区是否属于美国
 * @param timezone IANA时区标识符
 * @returns 如果时区属于美国返回true，否则返回false
 */
export function isUSTimezone(timezone: string): boolean {
  // 美国主要时区模式：
  // - America/* (大部分美国时区，如 America/New_York, America/Los_Angeles)
  // - Pacific/Honolulu (夏威夷)
  // - US/* (一些US时区别名)
  return (
    timezone.startsWith("America/") ||
    timezone === "Pacific/Honolulu" ||
    timezone.startsWith("US/")
  );
}
