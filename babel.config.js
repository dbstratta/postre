module.exports = api => {
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '13.11.0',
        },
        debug: !!process.env.DEBUG_BABEL,
        useBuiltIns: false,
        bugfixes: true,
      },
    ],
    '@babel/preset-typescript',
  ];

  const plugins = ['dynamic-import-node'];

  const ignore = getIgnoredPaths(api);

  const sourceMaps = api.env('production') ? true : 'inline';

  return {
    presets,
    ignore,
    plugins,
    sourceMaps,
  };
};

function getIgnoredPaths(api) {
  const ignorePaths = ['node_modules'];

  if (api.env('production')) {
    ignorePaths.push('**/*.spec.ts', '**/*.test.ts', '**/*.d.ts');
  }

  return ignorePaths;
}
