const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure SVG transformer - only processes .svg files
const { transformer, resolver } = config;

// Create a custom transformer that only processes SVG files
const svgTransformer = require.resolve('react-native-svg-transformer');

config.transformer = {
  ...transformer,
  // Only use SVG transformer for SVG files
  babelTransformerPath: svgTransformer,
  assetRegistryPath: require.resolve('react-native/Libraries/Image/AssetRegistry'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

// Apply NativeWind configuration
module.exports = withNativeWind(config, { input: './app/global.css' });