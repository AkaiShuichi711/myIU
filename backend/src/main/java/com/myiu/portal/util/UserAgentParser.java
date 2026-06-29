package com.myiu.portal.util;

public final class UserAgentParser {

    private UserAgentParser() {}

    public static String parseBrowser(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown Browser";
        if (ua.contains("Edg/") || ua.contains("EdgA/")) return "Microsoft Edge";
        if (ua.contains("OPR/") || ua.contains("Opera/")) return "Opera";
        if (ua.contains("SamsungBrowser/")) return "Samsung Browser";
        if (ua.contains("CriOS/")) return "Chrome";
        if (ua.contains("FxiOS/") || ua.contains("Firefox/")) return "Firefox";
        if (ua.contains("Chrome/")) return "Chrome";
        if (ua.contains("Safari/")) return "Safari";
        if (ua.contains("MSIE") || ua.contains("Trident/")) return "Internet Explorer";
        return "Unknown Browser";
    }

    public static String parseBrowserVersion(String ua) {
        if (ua == null || ua.isBlank()) return "";
        String[] markers = {"Edg/", "EdgA/", "OPR/", "SamsungBrowser/", "CriOS/", "FxiOS/", "Firefox/", "Chrome/"};
        for (String marker : markers) {
            int idx = ua.indexOf(marker);
            if (idx >= 0) {
                String rest = ua.substring(idx + marker.length());
                String version = rest.split("[/ .\\)]")[0];
                return version;
            }
        }
        return "";
    }

    public static String parseOs(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown OS";
        if (ua.contains("Windows NT 10.0") || ua.contains("Windows NT 11.0")) return "Windows 10/11";
        if (ua.contains("Windows NT 6.3")) return "Windows 8.1";
        if (ua.contains("Windows NT 6.2")) return "Windows 8";
        if (ua.contains("Windows NT 6.1")) return "Windows 7";
        if (ua.contains("Windows")) return "Windows";
        if (ua.contains("iPhone")) return "iOS (iPhone)";
        if (ua.contains("iPad")) return "iOS (iPad)";
        if (ua.contains("Android")) {
            int idx = ua.indexOf("Android ");
            if (idx >= 0) {
                String v = ua.substring(idx + 8).split("[;) ]")[0];
                return "Android " + v;
            }
            return "Android";
        }
        if (ua.contains("Mac OS X")) {
            int idx = ua.indexOf("Mac OS X ");
            if (idx >= 0) {
                String v = ua.substring(idx + 9).split("[;) ]")[0].replace('_', '.');
                return "macOS " + v;
            }
            return "macOS";
        }
        if (ua.contains("Linux")) return "Linux";
        return "Unknown OS";
    }

    public static String parseDeviceType(String ua) {
        if (ua == null || ua.isBlank()) return "desktop";
        if (ua.contains("iPhone") || (ua.contains("Android") && ua.contains("Mobile"))) return "mobile";
        if (ua.contains("iPad") || (ua.contains("Android") && !ua.contains("Mobile"))) return "tablet";
        return "desktop";
    }
}
