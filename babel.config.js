module.exports = (api) => {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '15.3.0',
          },
          debug: !!process.env.DEBUG_BABEL,
          useBuiltIns: false,
          bugfixes: true,
        },
      ],
      ['@babel/preset-typescript'],
    ],
    ignore: [
      'node_modules',
      api.env('production') && '**/*.spec.ts',
      api.env('production') && '**/*.test.ts',
      api.env('production') && '**/*.d.ts',
    ].filter(Boolean),
    plugins: [],
    sourceMaps: api.env('production') ? true : 'inline',
  };
};
