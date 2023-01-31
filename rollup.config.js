import path from 'path';
import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import prettier from 'rollup-plugin-prettier';
import alias from '@rollup/plugin-alias';
import postcss from 'rollup-plugin-postcss';

const paths = [
  {
    find: '@',
    replacement: path.resolve(__dirname, 'src'),
  },
];

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
    },
    plugins: [
      typescript({}),
      del({ targets: 'dist/*' }),
      alias({
        entries: paths,
      }),
    ],
  },
  {
    input: 'src/editor.ts',
    output: [{ file: 'dist/index.d.ts', format: 'cjs' }],
    plugins: [
      dts.default({}),
      alias({
        entries: paths,
      }),
      prettier({
        parser: 'babel-ts',
        tabWidth: 2,
      }),
    ],
  },
  {
    input: 'src/assets/camp-editor.css',
    output: [{ file: 'dist/index.css', name: 'style' }],
    plugins: [
      postcss({
        module: true,
        extract: true,
      }),
    ],
  },
];
