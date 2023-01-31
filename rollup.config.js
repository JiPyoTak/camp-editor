import del from "rollup-plugin-delete";
import alias from "@rollup/plugin-alias";
import path from "path";
import tsconfig from "./tsconfig.path.json" assert { type: "json" };
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

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

export default {
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
