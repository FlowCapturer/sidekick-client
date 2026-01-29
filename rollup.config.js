import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    json(),
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.lib.json',
      declaration: true,
      declarationDir: 'dist/types',
      rootDir: 'src',
      exclude: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx', 'src/main.tsx'],
      sourceMap: true,
      inlineSources: true,
    }),
    terser({
      sourceMap: true,
      compress: {
        drop_console: false,
      },
    }),
    {
      name: 'yalc-push',
      buildEnd: async (error) => {
        if (!error) {
          setTimeout(async () => {
            try {
              console.log('\n🚀 Running yalc push...');
              const { stdout, stderr } = await execAsync('yalc push');
              if (stdout) console.log(stdout);
              if (stderr) console.error(stderr);
              console.log('✅ yalc push completed\n');
            } catch (err) {
              console.error('❌ yalc push failed:', err.message);
            }
          }, 2000);
        }
      },
    },
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    // Make all dependencies external (don't bundle them)
    // This keeps the library small and prevents bundling issues
    /^@radix-ui\//,
    /^@tanstack\//,
    /^@marsidev\//,
    'axios',
    'class-variance-authority',
    'clsx',
    'input-otp',
    'lucide-react',
    'motion',
    'next-themes',
    'react-razorpay',
    'react-router',
    'sonner',
    'tailwind-merge',
    /^@tiptap\//,
  ],
  onwarn(warning, warn) {
    // Suppress warnings about 'use client' and other module-level directives
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  },
};
