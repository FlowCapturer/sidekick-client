#!/usr/bin/env node

/**
 * Build CSS using Vite with Tailwind plugin
 * This ensures all utility classes are properly generated
 */

import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

async function buildCSS() {
  console.log('🎨 Building CSS with Vite + Tailwind...');

  try {
    // Create a temporary entry file
    const tempDir = resolve(rootDir, '.temp');
    mkdirSync(tempDir, { recursive: true });

    const tempEntry = resolve(tempDir, 'entry.js');
    writeFileSync(tempEntry, `import '../src/index.css';`);

    // Build with Vite
    await build({
      plugins: [tailwindcss()],
      build: {
        lib: {
          entry: tempEntry,
          formats: ['es'],
          fileName: 'temp',
        },
        outDir: resolve(rootDir, 'dist'),
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            assetFileNames: 'index.css',
          },
        },
      },
      logLevel: 'info',
    });

    console.log('✅ CSS built successfully!');

    // Clean up temp files
    try {
      unlinkSync(resolve(rootDir, 'dist/temp.js'));
      console.log('🧹 Cleaned up temporary files');
    } catch (err) {
      // Ignore if file doesn't exist
    }
  } catch (error) {
    console.error('❌ Error building CSS:', error.message);
    process.exit(1);
  }
}

buildCSS();
