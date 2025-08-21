const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const axios = require('axios');
const request = require('request');

const indexRoutes = require('./routes/index');
const animeRoutes = require('./routes/anime');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const cookieConsent = require('./middleware/cookieConsent');

const { initializeDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(cors(
  {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.locals.req = req;

  next();
});

app.get('/stream', async (req, res) => {
  try {
    const url = req.query.url;
    const range = req.headers.range;
    const token = req.query.token;

    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Check if it's an image URL
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

    if (isImage) {
      // Handle image streaming
      try {
        const response = await axios.get(url, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 10000
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

        response.data.pipe(res);
      } catch (imageError) {
        console.error('Image streaming error:', imageError.message);
        res.status(404).json({ error: 'Image not found or cannot be loaded' });
      }
      return;
    }

    // Handle video streaming (existing logic)
    if (!token) {
      try {
        const iframeRes = await axios.get(url, {
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
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          timeout: 10000
        });

        const match = iframeRes.data.match(/file:"([^"]+)"/);
        if (!match) {
          return res.status(404).json({ error: 'Video file not found' });
        }

        const videoUrl = match[1];
        const host = new URL(videoUrl).hostname;

        const response = await axios.get(videoUrl, {
          responseType: 'stream',
          headers: {
            'Host': host,
            'Range': range,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Sec-CH-UA': '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Sec-GPC': '1',
            'Referer': 'https://www.youtube.com/'
          },
          timeout: 30000
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');

        if (range) {
          res.setHeader('Content-Range', response.headers['content-range']);
          res.setHeader('Accept-Ranges', 'bytes');
          res.status(206);
        }

        response.data.pipe(res);
      } catch (videoError) {
        console.error('Video streaming error:', videoError.message);
        res.status(500).json({ error: 'Video streaming failed' });
      }
    }
  } catch (error) {
    console.error('Stream endpoint error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/proxy', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');
  request
    .get(url)
    .on('error', (err) => res.status(500).send('Proxy error'))
    .pipe(res);
});

// Alternative image endpoint using request library
app.get('/img', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');

  console.log('IMG request for URL:', url);

  // Add referer to bypass some restrictions
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://otakudesu.best/',
      'Origin': 'https://otakudesu.best'
    },
    followRedirect: true,
    followAllRedirects: true,
    maxRedirects: 5,
    timeout: 15000
  };

  request
    .get(url, options)
    .on('error', (err) => {
      console.error('IMG proxy error:', err.message);
      res.status(500).send('Proxy error');
    })
    .on('response', (response) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      console.log('IMG loaded successfully, content-type:', response.headers['content-type']);
    })
    .pipe(res);
});

// Simple direct image proxy
app.get('/p', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');

  console.log('P request for URL:', url);

  // Add proper headers for image requests
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://otakudesu.best/',
      'Origin': 'https://otakudesu.best'
    },
    followRedirect: true,
    followAllRedirects: true,
    maxRedirects: 5,
    timeout: 15000
  };

  request(url, options)
    .on('error', (err) => {
      console.error('P proxy error:', err.message);
      res.status(500).send('Proxy error');
    })
    .on('response', (response) => {
      // Set proper headers for image
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      console.log('P loaded successfully, content-type:', response.headers['content-type']);
    })
    .pipe(res);
});

// Simple image proxy endpoint
app.get('/image', async (req, res) => {
  try {
    const url = req.query.url;
    console.log('Image request for URL:', url);

    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    console.log('Image loaded successfully, content-type:', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    console.error('Error details:', error.response?.status, error.response?.statusText);

    // Return a fallback image or error message
    if (error.response?.status === 403 || error.response?.status === 404) {
      res.status(404).json({
        error: 'Image not found or access denied',
        originalUrl: req.query.url,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Failed to load image',
        message: error.message,
        originalUrl: req.query.url
      });
    }
  }
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'kitanime-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieConsent);

app.use('/', indexRoutes);
app.use('/anime', animeRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan - KitaNime',
    error: {
      status: 404,
      message: 'Halaman yang Anda cari tidak ditemukan'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Terjadi Kesalahan - KitaNime',
    error: {
      status: err.status || 500,
      message: process.env.NODE_ENV === 'production' ? 
        'Terjadi kesalahan pada server' : err.message
    }
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`KitaNime server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly (not required as module)
if (require.main === module) {
  startServer();
}

module.exports = app;
