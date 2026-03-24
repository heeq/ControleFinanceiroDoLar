import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [react(), basicSsl()],
    resolve: {
        dedupe: ["react", "react-dom"],
    },
    server: {
        host: true,
        port: 5173,
        https: true,
        proxy: {
            '/api': {
                target: 'https://localhost:44331',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.error('Proxy error:', err)
                        if (!res.headersSent) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Proxy Error', details: err.message }));
                        }
                    })
                }
            }
        }
    }
})