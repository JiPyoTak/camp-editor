const del = require("rollup-plugin-delete");
const alias = require("@rollup/plugin-alias");
const path = require("path");
const typescript = require("rollup-plugin-typescript2");
const dts = require("rollup-plugin-dts");
const prettier = require("rollup-plugin-prettier");

const paths = [
  {
    find: '@',
    replacement: path.resolve(__dirname, 'src')
  }
]

module.exports = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
    },
    plugins: [
      del({ targets: "dist/*" }),
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
        parser: 'babel',
        tabWidth: 2,
      }),
    ],
  },
];
