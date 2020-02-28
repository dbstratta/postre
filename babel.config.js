module.exports = api => {
  const babelEnv = api.env();

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '13.8.0',
        },
        debug: !!process.env.DEBUG_BABEL,
        useBuiltIns: false,
      },
    ],
    '@babel/preset-typescript',
  ];

  const plugins = ['dynamic-import-node'];

  const ignore = getIgnoredPaths(babelEnv);

  const sourceMaps = babelEnv === 'production' ? true : 'inline';

  return {
    presets,
    ignore,
    plugins,
    sourceMaps,
  };
};

function getIgnoredPaths(babelEnv) {
  const baseIgnorePaths = ['node_modules'];

  if (babelEnv === 'production') {
    return [...baseIgnorePaths, '**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'];
  }

  return baseIgnorePaths;
}
