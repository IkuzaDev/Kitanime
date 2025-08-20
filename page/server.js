#!/usr/bin/env node

/**
 * Production server entry point for cPanel/shared hosting
 * This file ensures only one instance of the server runs
 */

const app = require('./app');
const { initializeDatabase } = require('./models/database');

const PORT = process.env.PORT || 3001;

// Flag to prevent multiple server starts
let serverStarted = false;

async function startProductionServer() {
  // Prevent multiple server instances
  if (serverStarted) {
    console.log('Server already started, skipping...');
    return;
  }
  
  try {
    serverStarted = true;
    
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`KitaNime server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`Process ID: ${process.pid}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    return server;
    
  } catch (error) {
    console.error('Failed to start production server:', error);
    serverStarted = false;
    process.exit(1);
  }
}

// Start the server
startProductionServer();