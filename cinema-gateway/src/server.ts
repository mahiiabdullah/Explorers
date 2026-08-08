import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 9000;

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
  console.log(`[gateway] GATEWAY_SECRET=${process.env.GATEWAY_SECRET ? 'set' : 'using default (z2p-2026-secret)'}`);
});