// Récepteur de webhook local pour tester la transmission réelle des demandes.
import http from 'node:http';
import fs from 'node:fs';
const file = process.argv[2] || 'qa/received.jsonl';
http
  .createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      fs.appendFileSync(file, JSON.stringify({ secret: req.headers['x-webhook-secret'] ?? null, body: JSON.parse(body || '{}') }) + '\n');
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
    });
  })
  .listen(4555, '127.0.0.1', () => console.log('webhook receiver on 4555'));
