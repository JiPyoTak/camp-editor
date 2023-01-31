const del = require("rollup-plugin-delete");
const alias = require("@rollup/plugin-alias");
const path = require("path");
const tsconfig = require("./tsconfig.path.json");
const typescript = require("rollup-plugin-typescript2");
const dts = require("rollup-plugin-dts");
const prettier = require("rollup-plugin-prettier");

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

module.exports = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
    },
    plugins: [
      del({ targets: "dist/*" }),
      // dts.default(),
      alias({
        entries: paths,
      }),
      typescript(),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [
      dts.default(),
      alias({
        entries: paths,
      }),
      prettier({
        tabWidth: 2,
      }),
    ],
  },
];
