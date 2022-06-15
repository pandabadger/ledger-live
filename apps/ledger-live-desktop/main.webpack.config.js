const path = require("path");
const babelPlugins = require("./babel.plugins");
const UnusedWebpackPlugin = require("unused-webpack-plugin");

const babelConfig = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    "@babel/preset-flow",
  ],
  plugins: babelPlugins,
};

module.exports = {
  stats: "errors-only",
  target: "electron-main",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, ".webpack"),
    filename: "main.bundle.js",
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  plugins: [
    new UnusedWebpackPlugin({
      directories: [path.join(__dirname, "src/main"), path.join(__dirname, "src/internal")],
      exclude: ["*.test.js", "*.html", "updater/*"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: babelTsConfig,
      },
      {
        test: /\.js$/i,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: babelConfig,
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
    ],
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "node_modules")],
    // Some modules have different exports signatures depending on the main field. (for instance bignumber.js)
    // Picking the the main field first is safer.
    // See this comment: https://github.com/webpack/webpack/issues/4742#issuecomment-295115576
    mainFields: ["main", "module"],
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
    ...(process.env.V3
      ? {
          extensions: [
            ".v3.tsx",
            ".v3.ts",
            ".v3.jsx",
            ".v3.js",
            ".tsx",
            ".ts",
            ".jsx",
            ".js",
            "...",
          ],
        }
      : {}),
  },
};
