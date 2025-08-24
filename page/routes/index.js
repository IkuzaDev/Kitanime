const express = require('express');
const router = express.Router();
const animeApi = require('../services/animeApi');
const { getSetting } = require('../models/database');
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const request = require('request');
router.get('/', async (req, res) => {
  try {
    const homeData = await animeApi.getHomeData();
    const siteTitle = await getSetting('site_title') || 'KitaNime - Streaming Anime Subtitle Indonesia';
    const siteDescription = await getSetting('site_description') || 'Nonton anime subtitle Indonesia terlengkap dan terbaru';
    
    res.render('index', {
      title: siteTitle,
      description: siteDescription,
      ongoingAnime: homeData?.ongoing_anime || [],
      completeAnime: homeData?.complete_anime || [],
      currentPage: 'home'
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data anime'
      }
    });
  }
});

router.get('/ongoing', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const ongoingData = await animeApi.getOngoingAnime(page);
    res.render('ongoing', {
      title: `Anime Ongoing - Halaman ${page} - KitaNime`,
      description: 'Daftar anime ongoing terbaru dengan subtitle Indonesia',
      animeList: ongoingData.data || [],
      pagination: ongoingData?.pagination || { current_page: page, last_visible_page: 1 },
      currentPage: 'ongoing'
    });
  } catch (error) {
    console.error('Ongoing page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data anime ongoing'
      }
    });
  }
});

router.get('/complete', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const completeData = await animeApi.getCompleteAnime(page);
    res.render('complete', {
      title: `Anime Complete - Halaman ${page} - KitaNime`,
      description: 'Daftar anime complete dengan subtitle Indonesia',
      animeList: completeData?.data || [],
      pagination: completeData?.pagination || { current_page: page, total_pages: 1 },
      currentPage: 'complete'
    });
  } catch (error) {
    console.error('Complete page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data anime complete'
      }
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    
    let searchResults = null;
    if (keyword.trim()) {
      searchResults = await animeApi.searchAnime(keyword, page);
    }
    const genres = await animeApi.getGenres();
    res.render('search', {
      title: keyword ? `Pencarian: ${keyword} - KitaNime` : 'Pencarian Anime - KitaNime',
      description: keyword ? `Hasil pencarian untuk "${keyword}"` : 'Cari anime favorit Anda',
      keyword,
      searchResults: searchResults.data || [],
      pagination: searchResults?.pagination || { current_page: page, total_pages: 1 },
      currentPage: 'search',
      genres
    });
  } catch (error) {
    console.error('Search page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat melakukan pencarian'
      }
    });
  }
});

router.get('/genres', async (req, res) => {
  try {
    const genresData = await animeApi.getGenres();
    res.render('genres', {
      title: 'Genre Anime - KitaNime',
      description: 'Jelajahi anime berdasarkan genre favorit Anda',
      genres: genresData || [],
      currentPage: 'genres'
    });
  } catch (error) {
    console.error('Genres page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data genre'
      }
    });
  }
});

router.get('/genres/:slug', async (req, res) => {
  try {
    const genreSlug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const response = await animeApi.getAnimeByGenre(genreSlug, page);

    // Handle API response structure: { status: "Ok", data: { anime: [...], pagination: {...} } }
    const genreData = response?.data || response;
    const animeList = genreData?.anime || [];
    const pagination = genreData?.pagination || { current_page: page, last_visible_page: 1 };
    const genreName = genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1); // Capitalize first letter

    res.render('genre-detail', {
      title: `Genre ${genreName} - KitaNime`,
      description: `Anime dengan genre ${genreName}`,
      genreName,
      genreSlug,
      animeList,
      pagination,
      currentPage: 'genres'
    });
  } catch (error) {
    console.error('Genre detail page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data genre'
      }
    });
  }
});

router.get('/movies/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    var movieData = await animeApi.getMovies(page);
    if(!movieData) {
      return res.status(404).render('error', {
        title: 'Tidak ada film anime - KitaNime',
        error: {
          status: 404,
          message: 'Tidak ada film anime\nCoba Kembali!'
        }
      });
    }
    res.render('movie-list', {
      title: `Daftar Film Anime - KitaNime`,
      description: `Daftar film anime terbaru`,
      animeList: movieData.data.movies || [],
      pagination : movieData.data.pagination || { current_page: 1, total_pages: 2 },
      currentPage: 'movies'
    });
  } catch (error) {
    console.error('Movies page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data film anime'
      }
    });
  }
});

router.get('/movies/:year/:month/:slug', async (req, res) => {
  try {
    const { year, month, slug } = req.params;

    const movieData = await animeApi.getMovieDetails(year, month, slug);
    var movie = movieData.data.stream_url;
    movie = movie.split('/')[3];
    //https://www.mp4upload.com/embed-iwzh09efokfj.html
    movie = `https://www.mp4upload.com/embed-${movie}.html`;
    
    movieData.data.stream_url = movie;
    res.render('movie-player', {
      title: `${movieData?.data.title || slug} - KitaNime`,
      description: `Film anime ${movieData?.data.title || slug}`,
      anime: movieData.data,
      stream: movieData.data.stream_url,
      currentPage: 'movies'
    });
  } catch (error) {
    console.error('Movie detail page error:', error);
    res.render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat data film anime'
      }
    });
  }
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const homeData = await animeApi.getHomeData();
    const ongoingAnime = homeData?.ongoing_anime || [];
    const completeAnime = homeData?.complete_anime || [];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/ongoing</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/complete</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/genres</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add anime URLs
    [...ongoingAnime, ...completeAnime].forEach(anime => {
      if (anime.slug) {
        sitemap += `
  <url>
    <loc>${baseUrl}/anime/${anime.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

router.post('/cookie-consent', (req, res) => {
  res.cookie('cookie_consent', 'accepted', {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true });
});

module.exports = router;
