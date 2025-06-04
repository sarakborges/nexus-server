import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], // Your entry point
  outDir: 'dist', // Output directory
  format: ['esm'], // ESM for compatibility with modern platforms
  splitting: false, // Disable code splitting for APIs
  shims: true, // Inject Node.js globals (like __dirname)
  clean: true, // Clean output folder before build
  sourcemap: true, // Helpful for debugging
  target: 'node18', // Adjust to your Node version
  dts: false, // No need for types in production builds
});
