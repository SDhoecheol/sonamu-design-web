import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-mock',
      configureServer(server) {
        server.middlewares.use('/api/s3-presign', async (req, res) => {
          // Dynamic import to load the handler
          try {
            // @ts-ignore
            const module = await import('./api/s3-presign.js');
            await module.default(req, res);
          } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
  },
})
