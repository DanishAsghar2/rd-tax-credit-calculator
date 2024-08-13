const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/rd-tax-credit-calc/'
    : '/',
  outputDir: 'docs', // GitHub Pages uses the /docs folder by default
});
