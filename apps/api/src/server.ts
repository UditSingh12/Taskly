import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Taskly API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`📡 Health check: http://localhost:${env.PORT}/api/health`);
  });

  const shutdown = () => {
    console.log('🛑 Gracefully shutting down server...');
    server.close(() => {
      console.log('💥 Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
