import { defineConfig } from 'vite';
import * as sass from 'sass';

export default defineConfig({
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                implementation: sass
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
}); 