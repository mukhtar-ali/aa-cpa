/** SVGO config for committed brand assets (task T028): keep viewBox and root size, strip editor noise. */
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: { overrides: { removeViewBox: false, cleanupIds: { minify: false } } },
    },
    'removeDimensions',
  ].filter((p) => p !== 'removeDimensions'),
};
