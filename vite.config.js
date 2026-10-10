const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const esbuild = require('esbuild');

// This repo's JSX-containing files use a .js extension (not .jsx). Neither
// @vitejs/plugin-react's esbuild-delegated fast path nor its Babel fallback picks
// up .js by default for this Vite/plugin-react version combo, so this small plugin
// explicitly strips JSX from .js files under src/ via esbuild before anything else
// (including @vitejs/plugin-react) sees them. Runs first (default array order).
function jsxInJsFiles() {
  return {
    name: 'jsx-in-js-files',
    enforce: 'pre',
    async transform(code, id) {
      const [filepath] = id.split('?');
      if (!filepath.includes('/src/') || !filepath.endsWith('.js')) return null;
      const result = await esbuild.transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        jsxImportSource: 'react',
        sourcefile: filepath,
        sourcemap: true,
      });
      return { code: result.code, map: result.map };
    },
  };
}

module.exports = defineConfig({
  plugins: [jsxInJsFiles(), react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // The page tests render a whole product page; with the files running side by side a test that takes 1-2 s alone can take 6-10 s, past the
    // 5 s default (the same test passes alone). It is a time limit for a slow machine, not a place to hide a slow test.
    testTimeout: 20000,
  },
});
