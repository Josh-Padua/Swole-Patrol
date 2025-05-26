const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// Solution credit: https://github.com/expo/expo/issues/36588#issuecomment-2849257385
//
// Firebase / Expo SDK 53: allow “.cjs” files and use classic Node “exports”
// resolution so Firebase sub‑packages are bundled correctly.
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes("cjs")) {
    config.resolver.sourceExts.push("cjs");
}
// Disable the new, stricter “package.json exports” resolution until every
// dependency (Firebase, React‑Native‑WebView, etc.) ships full export maps.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' })