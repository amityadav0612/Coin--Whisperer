// Simplified vite config
export default {
  plugins: [],
  resolve: {
    alias: {}
  },
  root: "client",
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5173',
    },
  },
}; 