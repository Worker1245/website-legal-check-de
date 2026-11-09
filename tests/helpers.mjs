// Test helpers: a static server for fixture sites that also answers for mapped
// third-party hosts, so no test ever contacts the real internet.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const TYPES = { '.html': 'text/html; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain', '.js': 'text/javascript' };
export const MAPPED_HOSTS = ['fonts.googleapis.com', 'www.google-analytics.com', 'www.googletagmanager.com', 'connect.facebook.net'];

/** Start a server for one fixture site. Returns base URL, browser launch args and close(). */
export async function serveFixture(name) {
  const root = path.isAbsolute(name) ? name : path.join(FIXTURES, name);
  const server = createServer(async (req, res) => {
    const host = (req.headers.host ?? '').split(':')[0];
    if (host !== '127.0.0.1') {
      res.writeHead(200, { 'content-type': 'text/javascript' }).end('/* stub third party */');
      return;
    }
    const { pathname } = new URL(req.url, 'http://127.0.0.1');
    const file = path.join(root, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    try {
      let body = await readFile(file, 'utf8');
      body = body.replaceAll('__BASE__', base);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const rules = MAPPED_HOSTS.map((h) => `MAP ${h} 127.0.0.1:${port}`).join(', ');
  return { base, launchArgs: [`--host-resolver-rules=${rules}`], close: () => new Promise((r) => server.close(r)) };
}
