export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent);

export const isAndroid = () =>
  /android/i.test(navigator.userAgent);

export const isOnline = () => navigator.onLine;
