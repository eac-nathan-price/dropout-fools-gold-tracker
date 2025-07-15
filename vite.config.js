import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    },
    css: {
        preprocessorOptions: {
            scss: {}
        }
    },
    server: {
        port: 3000,
        open: true
    }
}); 