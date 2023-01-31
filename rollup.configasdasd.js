const del = require("rollup-plugin-delete");
const alias = require("@rollup/plugin-alias");
const path = require("path");
const tsconfig = require("./tsconfig.path.json");
const typescript = require("rollup-plugin-typescript2");
const dts = require("rollup-plugin-dts");

const paths = Object.entries(tsconfig.compilerOptions.paths).map(
  ([find, [replacement]]) => {
    find = find.replace(/\/\*/g, "");
    replacement = path.resolve(
      __dirname,
      "src",
      replacement.replace(/\/\*/g, "")
    );
    return { find, replacement };
  }
);

exports = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    del({ targets: "dist/*" }),
    dts(),
    alias({
      entries: paths,
    }),
    typescript(),
  ],
};
