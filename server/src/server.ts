import { createServer, type Server } from 'node:http';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import {
  AdminProvisioningError,
  provisionInitialAdmin,
} from './services/admin-provisioning.service.js';

let httpServer: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down EcoCompute API`);

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await disconnectDatabase();
    process.exitCode = 0;
  } catch (error) {
    console.error(
      'EcoCompute API shutdown failed:',
      error instanceof Error ? error.name : 'UnknownError',
    );
    process.exitCode = 1;
  }
}

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await provisionInitialAdmin();

    httpServer = createServer(app);
    httpServer.on('error', (error) => {
      console.error(
        'EcoCompute API failed to start:',
        error instanceof Error ? error.name : 'UnknownError',
      );
      process.exitCode = 1;
    });

    await new Promise<void>((resolve, reject) => {
      httpServer?.listen(env.port, resolve);
      httpServer?.once('error', reject);
    });

    console.log(`EcoCompute API listening on port ${env.port}`);
  } catch (error) {
    if (error instanceof AdminProvisioningError) {
      console.error('EcoCompute API startup failed:', error.message);
    } else {
      console.error(
        'EcoCompute API startup failed:',
        error instanceof Error ? error.name : 'UnknownError',
      );
    }
    await disconnectDatabase().catch(() => undefined);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void start();
