import { useMemo } from 'react';

export function useDeviceInfo() {
  return useMemo(() => {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    // If we need more granularity:
    // const isMac = /Macintosh/i.test(userAgent);
    // const isWindows = /Windows/i.test(userAgent);
    // const isLinux = /Linux/i.test(userAgent);

    // For simple usage, this covers phone-based checks:
    const isMobile = isAndroid || isIOS;

    return { isAndroid, isIOS, isMobile };
  }, []);
}
