const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const axios = require('axios');
const request = require('request');
const createSessionConfig = require('./config/session');

const indexRoutes = require('./routes/index');
const animeRoutes = require('./routes/anime');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const cookieConsent = require('./middleware/cookieConsent');
const adSlots = require('./middleware/adSlots');

const { initializeDatabase } = require('./models/database');

const app = express();

// Gunakan PORT dari environment variable atau default ke 3000 untuk cPanel
const PORT = process.env.PORT || process.env.CPANEL_PORT || 3000;

// Security headers
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware
app.use(compression());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.locals.req = req;
  next();
});

// Stream endpoint untuk video proxy
app.get('/stream', async (req, res) => {
  try {
    const googleVideoUrl = req.query.url;
    const range = req.headers.range;
    const token = req.query.token;
    
    if (!googleVideoUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Set CORS headers early
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    
    console.log('Stream request for URL:', googleVideoUrl);
    console.log('Range header:', range);
    console.log('Token:', token);
    
    let response;
    
    // Check if it's a direct image/video URL
    if (googleVideoUrl.includes('.jpg') || googleVideoUrl.includes('.png') || googleVideoUrl.includes('.jpeg') || googleVideoUrl.includes('.webp')) {
      // Direct image proxy
      response = await axios.get(googleVideoUrl, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Referer': 'https://otakudesu.best/'
        }
      });
    } else if (token) {
      // Handle gofile with token
      response = await axios.get(googleVideoUrl, {
        responseType: 'stream',
        headers: {
          'Range': range,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Authorization': `Bearer ${token}`,
          'Referer': 'https://gofile.io/'
        }
      });
    } else if (googleVideoUrl.includes('desustream.info')) {
      // Handle desustream
      const iframeRes = await axios.get(googleVideoUrl, {
        headers: {
          'Host': 'desustream.info',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Sec-GPC': '1',
          'Sec-CH-UA': '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
          'Connection': 'keep-alive'
        }
      });
      
      console.log('Desustream response received, looking for video URL...');
      
      // Try multiple regex patterns for different desustream formats
      let match = iframeRes.data.match(/file:"([^"]+)"/);
      if (!match) {
        match = iframeRes.data.match(/src:"([^"]+)"/);
      }
      if (!match) {
        match = iframeRes.data.match(/source src="([^"]+)"/);
      }
      if (!match) {
        match = iframeRes.data.match(/video.*?src="([^"]+)"/);
      }
      
      if (!match || !match[1]) {
        console.error('Video URL not found in desustream response');
        console.log('Response preview:', iframeRes.data.substring(0, 500));
        throw new Error('Video URL not found in iframe response');
      }
      
      const videoUrl = match[1];
      console.log('Found video URL:', videoUrl);
      const host = new URL(videoUrl).hostname;
      
      response = await axios.get(videoUrl, {
        responseType: 'stream',
        headers: {
          'Host': host,
          'Range': range,
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Referer': googleVideoUrl
        }
      });
    } else {
      // Fallback for other URLs - try direct access
      response = await axios.get(googleVideoUrl, {
        responseType: 'stream',
        headers: {
          'Range': range,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      });
    }
    
    // Set response headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
    if (range && response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
      res.setHeader('Accept-Ranges', 'bytes');
      res.status(206);
    } else {
      res.setHeader('Accept-Ranges', 'bytes');
    }
    
    // Handle response errors
    response.data.on('error', (err) => {
      console.error('Stream pipe error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      }
    });
    
    // Pipe the response
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Stream error:', error.message);
    console.error('Error details:', error.response?.status, error.response?.statusText);
    console.error('Full error:', error);
    console.error('Request URL:', req.query.url);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to stream video',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        url: req.query.url,
        details: process.env.NODE_ENV === 'production' ? undefined : {
          status: error.response?.status,
          statusText: error.response?.statusText,
          stack: error.stack
        }
      });
    }
  }
});

// Proxy endpoint untuk image proxy
app.get('/proxy', (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    request
      .get(url)
      .on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Proxy request failed' });
      })
      .pipe(res);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

// Handle OPTIONS requests for CORS
app.options('/stream', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.status(200).end();
});

app.options('/proxy', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.status(200).end();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware
app.use(session(createSessionConfig()));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Custom middleware
app.use(cookieConsent);
app.use(adSlots);

// Routes
app.use('/', indexRoutes);
app.use('/anime', animeRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan - FreeNime',
    error: {
      status: 404,
      message: 'Halaman yang Anda cari tidak ditemukan'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Terjadi Kesalahan - FreeNime',
    error: {
      status: err.status || 500,
      message: process.env.NODE_ENV === 'production' ? 
        'Terjadi kesalahan pada server' : err.message
    }
  });
});

// Fungsi untuk memulai server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // In cPanel environment, don't call listen() - it's handled by the hosting
    if (process.env.CPANEL || process.env.LSWS) {
      console.log('Running in cPanel environment - server will be handled by hosting');
      return;
    }
    
    // Start server only for local development
    app.listen(PORT, () => {
      console.log(`FreeNime server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server ready for cPanel deployment`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export untuk cPanel hosting
module.exports = app;

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}
