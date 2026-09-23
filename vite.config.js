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
  },
});
