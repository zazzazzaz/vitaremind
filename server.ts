import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Explicitly serve sw.js with application/javascript so Chrome accepts it as ServiceWorker
  app.get('/sw.js', (req, res) => {
    const swPath = path.resolve('public/sw.js');
    if (fs.existsSync(swPath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      return res.sendFile(swPath);
    }
    res.status(404).send('Not found');
  });

  // Explicitly serve manifest.json
  app.get('/manifest.json', (req, res) => {
    const manifestPath = path.resolve('public/manifest.json');
    if (fs.existsSync(manifestPath)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      return res.sendFile(manifestPath);
    }
    res.status(404).send('Not found');
  });

  // Serve public assets (icons, manifest, sw)
  app.use(express.static(path.resolve('public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Service-Worker-Allowed', '/');
      } else if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      }
    }
  }));

  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
