/**
 * cPanel/Production startup script
 * This file is specifically designed for shared hosting environments
 * to prevent the "listen() called more than once" error
 */

const cluster = require('cluster');
const os = require('os');

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.CPANEL_ENV;
const isCPanel = process.env.CPANEL_ENV || process.env.SHARED_HOSTING;

// For cPanel/shared hosting, use single process
if (isCPanel || isProduction) {
  console.log('Starting in production/cPanel mode...');
  
  // Prevent multiple instances
  if (process.env.SERVER_STARTED) {
    console.log('Server already started, exiting...');
    process.exit(0);
  }
  
  process.env.SERVER_STARTED = 'true';
  
  // Start single instance
  require('./server.js');
  
} else {
  // Development mode - can use clustering if needed
  console.log('Starting in development mode...');
  
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    
    // Fork workers (limit to 1 for development)
    const numCPUs = 1; // Math.min(os.cpus().length, 2);
    
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      // Don't restart in development
    });
    
  } else {
    // Worker process
    require('./server.js');
    console.log(`Worker ${process.pid} started`);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});