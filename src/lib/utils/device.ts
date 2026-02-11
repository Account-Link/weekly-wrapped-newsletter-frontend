/**
 * Check if the current device is a mobile device.
 * (检测当前设备是否为移动设备)
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor;

  // Common mobile User Agent keywords
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

  // Check for iPadOS 13+ (often mimics MacIntel but has touch points)
  // (检测 iPadOS 13+，通常伪装成 MacIntel 但有触摸点)
  const isIpad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return mobileRegex.test(userAgent) || isIpad;
};

/**
 * Check if the current device is a PC.
 * (检测当前设备是否为 PC)
 */
export const checkIsPc = (): boolean => {
  return !isMobileDevice();
};
