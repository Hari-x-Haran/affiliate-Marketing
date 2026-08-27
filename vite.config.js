import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'json-db-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/db' && req.method === 'GET') {
            const dbPath = path.resolve(__dirname, 'data/db.json');
            if (fs.existsSync(dbPath)) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(fs.readFileSync(dbPath, 'utf-8'));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ affiliateUsers: [], affiliateLinks: [], currentAffiliateUser: null }));
            }
          } else if (req.url === '/api/db' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const dbPath = path.resolve(__dirname, 'data/db.json');
                const dbDir = path.dirname(dbPath);
                if (!fs.existsSync(dbDir)) {
                  fs.mkdirSync(dbDir, { recursive: true });
                }
                const parsed = JSON.parse(body);
                // Ensure proper keys exist
                const dbData = {
                  affiliateUsers: parsed.affiliateUsers || [],
                  affiliateLinks: parsed.affiliateLinks || [],
                  currentAffiliateUser: parsed.currentAffiliateUser !== undefined ? parsed.currentAffiliateUser : null
                };
                fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})

