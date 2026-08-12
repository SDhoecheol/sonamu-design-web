import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-mock',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const apiName = req.url.split('?')[0].replace('/api/', ''); // 쿼리스트링 제거
            import(`./api/${apiName}.js`).then(module => {
              module.default(req, res);
            }).catch(err => {
              console.error(`API route ${apiName} not found or error:`, err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
  },
})
