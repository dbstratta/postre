import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import builtinModules from 'builtin-modules';

import pkg from './package.json';

const extensions = ['.js', '.mjs', '.ts'];

const externalModules = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const commonPlugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  resolve({ extensions }),
  commonjs(),
  babel({ extensions }),
];

export default [
  {
    input: './src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true, interop: false },
      { file: pkg.module, format: 'es', sourcemap: true, interop: false },
    ],
    external: externalModules,
    plugins: [...commonPlugins],
  },
  {
    input: './src/bin.ts',
    output: [{ file: pkg.bin, format: 'cjs', sourcemap: true, interop: false }],
    external: externalModules,
    plugins: [...commonPlugins, preserveShebangs()],
  },
];
