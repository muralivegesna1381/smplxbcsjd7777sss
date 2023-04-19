/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    assetPlugins: ['react-native-svg-asset-plugin'],
  },
};

module.exports = {
  transformer: {
    // ...
    assetPlugins: ['react-native-svg-asset-plugin'],
    svgAssetPlugin: {
      pngCacheDir: '.png-cache',
      scales: [1, 2, 3,4],
      output: {
        compressionLevel: 9,
      },
    },
  },
};
