module.exports = function (api) {
  // Cache keyed on NODE_ENV: the Tamagui plugin's `disableExtraction` flips
  // between dev and production, so the config must re-evaluate per environment.
  api.cache.using(() => process.env.NODE_ENV);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
    ],
    plugins: [
      // Allows `@/*` alias resolution at runtime.
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // Tamagui optimizing compiler: extracts styles at build time in
      // production, disabled in dev so Fast Refresh / runtime path is
      // untouched. Config uses only relative imports (no `@/` alias) so the
      // plugin's standalone loader resolves it without Metro.
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/theme/tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Reanimated plugin MUST be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
