const http  = require('http');
const https = require('https');
const url   = require('url');

const PORT     = 3001;
const API_BASE = 'footballdata.io';
const API_KEY  = 'fd_afb7a457facf3cc86e3cd0bbfe1a4325a12cfdb75877f772';

http.createServer((req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed  = url.parse(req.url, true);
  const apiPath = parsed.pathname.replace(/^\/proxy/, '') || '/';
  const qs      = parsed.search || '';

  const options = {
    hostname: API_BASE,
    port: 443,
    path: apiPath + qs,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    }
  };

  const proxyReq = https.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();

}).listen(PORT, () => {
  console.log(`6WIN proxy running on http://localhost:${PORT}`);
  console.log(`Serving index.html at http://localhost:${PORT}/`);
});

// Also serve the HTML file
const fs   = require('fs');
const path = require('path');

http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const file = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(file).pipe(res);
  } else {
    res.writeHead(404); res.end('Not found');
  }
}).listen(3000, () => {
  console.log(`6WIN site    running on http://localhost:3000`);
});
