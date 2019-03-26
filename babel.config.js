module.exports = api => {
  api.cache.never();

  return {
    presets: getPresets(),
    plugins: getPlugins(),
    exclude: 'node_modules/**',
  };
};

function getPresets() {
  const basePresets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs',
        debug: !!process.env.DEBUG_BABEL,
        useBuiltIns: false,
      },
    ],
    '@babel/preset-typescript',
  ];

  return basePresets;
}

function getPlugins() {
  const basePlugins = [
    '@babel/plugin-proposal-class-properties',
    'dynamic-import-node',
  ];

  return basePlugins;
}
