import 'zone.js/node';
import express from 'express';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import AppServerModule from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { renderModule } from '@angular/platform-server';

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/art-gallery-1-project/browser');
  const indexHtml = existsSync(join(distFolder, 'index.server.html')) ? 'index.server.html' : 'index.csr.html';

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('*.*', express.static(distFolder, { maxAge: '1y' }));
  server.get('*', async (req: express.Request, res: express.Response) => {
    try {
      const indexPath = join(distFolder, indexHtml);
      const template = readFileSync(indexPath, 'utf8');
      const html = await renderModule(AppServerModule as any, {
        document: template,
        url: req.url,
        extraProviders: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
      });
      res.status(200).send(html);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err && err.message ? err.message : String(err));
    }
  });

  return server;
}

function run() {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  run();
}

export * from './src/main.server';
