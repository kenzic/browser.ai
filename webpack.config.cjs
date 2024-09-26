const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development", // or 'production'
  entry: {
    controls: "./src/browser/controls/entry.tsx",
    settings: "./src/browser/settings/entry.tsx",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "electron-renderer",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.renderer.json",
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "controls.html",
      chunks: ["controls"],
      template: path.resolve(__dirname, "src", "lib", "template.html"),
      title: "Controls Page",
    }),
    new HtmlWebpackPlugin({
      filename: "settings.html",
      chunks: ["settings"],
      template: path.resolve(__dirname, "src", "lib", "template.html"),
      title: "Settings Page",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
