import path from 'path';
import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import prettier from 'rollup-plugin-prettier';
import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';
import alias from '@rollup/plugin-alias';
import image from '@rollup/plugin-image';

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
      sourcemap: true,
    },
    plugins: [
      postcss({
        module: true,
        extract: true,
        plugins: [
          url({
            url: 'inline',
            maxSize: 10,
            fallback: 'copy',
          }),
        ],
      }),
      typescript({}),
      image(),
      del({ targets: 'dist/*' }),
      alias({
        entries: paths,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'cjs' }],
    external: [/\.css$/],
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
];
