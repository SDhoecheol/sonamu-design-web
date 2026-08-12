import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-mock',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const apiPath = req.url.split('?')[0];
            try {
              if (apiPath === '/api/s3-presign') {
                // @ts-ignore
                const module = await import('./api/s3-presign.js');
                await module.default(req, res);
              } else if (apiPath === '/api/s3-delete') {
                // @ts-ignore
                const module = await import('./api/s3-delete.js');
                await module.default(req, res);
              } else if (apiPath === '/api/get-page-count') {
                // @ts-ignore
                const module = await import('./api/get-page-count.js');
                await module.default(req, res);
              } else if (apiPath === '/api/viewer') {
                // @ts-ignore
                const module = await import('./api/viewer.js');
                await module.default(req, res);
              } else {
                next();
              }
            } catch (err) {
              console.error(`API route ${apiPath} error:`, err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
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
