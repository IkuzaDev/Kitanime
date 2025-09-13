const express = require('express');
const router = express.Router();
const axios = require('axios');
const {load} = require('cheerio');
const animeApi = require('../services/animeApi');

router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const animeData = await animeApi.getAnimeDetails(slug);

    if (!animeData) {
      return res.status(404).render('error', {
        title: 'Anime Tidak Ditemukan - KitaNime',
        error: {
          status: 404,
          message: 'Anime yang Anda cari tidak ditemukan'
        }
      });
    }

    const sanitizedAnime = animeApi.validateAnimeData(animeData, slug);
    const clean = sanitizedAnime.episodes.map(ep => {
      const match = ep.episode.match(/Episode\s+(\d+)/i);
      const num = match ? match[1] : null;

      return {
        ...ep,
        episode: num
      };
    });
    sanitizedAnime.episodes = clean;
    res.render('anime-detail', {
      title: `${sanitizedAnime.title} - KitaNime`,
      description: sanitizedAnime.synopsis ?
        sanitizedAnime.synopsis.substring(0, 160) + '...' :
        `Nonton ${sanitizedAnime.title} subtitle Indonesia`,
      anime: sanitizedAnime,
      currentPage: 'anime'
    });
  } catch (error) {
    console.error('Anime detail page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat detail anime'
      }
    });
  }
});

router.get('/:slug/episodes', async (req, res) => {
  try {
    const slug = req.params.slug;
    const [animeData, episodesData] = await Promise.all([
      animeApi.getAnimeDetails(slug),
      animeApi.getAnimeEpisodes(slug)
    ]);

    if (!animeData) {
      return res.status(404).render('error', {
        title: 'Anime Tidak Ditemukan - KitaNime',
        error: {
          status: 404,
          message: 'Anime yang Anda cari tidak ditemukan'
        }
      });
    }

    const sanitizedAnime = animeApi.validateAnimeData(animeData, slug);
    const clean = sanitizedAnime.episodes.map(ep => {
      const match = ep.episode.match(/Episode\s+(\d+)/i);
      const num = match ? match[1] : null;

      return {
        ...ep,
        episode: num
      };
    });
    res.render('anime-episodes', {
      title: `Episode ${sanitizedAnime.title} - KitaNime`,
      description: `Daftar episode ${sanitizedAnime.title} subtitle Indonesia`,
      anime: sanitizedAnime,
      episodes: clean || [],
      currentPage: 'anime'
    });
  } catch (error) {
    console.error('Anime episodes page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat daftar episode'
      }
    });
  }
});

router.get('/:slug/episode/:episode', async (req, res) => {
  try {
    const slug = req.params.slug;
    const episodeNumber = req.params.episode;

    const [animeData, episodeData] = await Promise.all([
      animeApi.getAnimeDetails(slug),
      animeApi.getEpisodeDetails(slug, episodeNumber)
    ]);

    if (!animeData || !episodeData) {
      return res.status(404).render('error', {
        title: 'Episode Tidak Ditemukan - KitaNime',
        error: {
          status: 404,
          message: 'Episode yang Anda cari tidak ditemukan'
        }
      });
    }

    const sanitizedAnime = animeApi.validateAnimeData(animeData, slug);

    const allEpisodes = episodeData.all_episodes || [];
    const currentEpisodeIndex = allEpisodes.findIndex(ep =>
      ep.episode_number == episodeNumber
    );
    const getEpisodeDetails = await animeApi.getEpisodeDetails(slug, episodeNumber);
    console.log(episodeData.next_episode);
    const modifiedStreamList = {};
    var qlist = [];
    for (const quality in getEpisodeDetails.steramList) {
      qlist.push(parseInt(quality.replace('p', '')));
      modifiedStreamList[parseInt(quality.replace('p', ''))] = `${getEpisodeDetails.steramList[quality]}`;
    }
    if(Object.keys(getEpisodeDetails.steramList).length == 0){
      qlist.push('480');
      const blogger = await axios.get(getEpisodeDetails.stream_url, {
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
      });
      const $$ = load(blogger.data);
      const googleVideoUrl = $$('#myIframe').attr('src');
      modifiedStreamList['480'] = googleVideoUrl;
    }
    if(!modifiedStreamList['480']){
      modifiedStreamList['480'] = 'aaaaaaaaaaa'
    }
    console.log(modifiedStreamList)
    
    var episodeDatas = {
        title: `${sanitizedAnime.title} Episode ${episodeNumber} - KitaNime`,
        description: `Nonton ${sanitizedAnime.title} Episode ${episodeNumber} subtitle Indonesia`,
        anime: sanitizedAnime,
        episode: {
          number: episodeNumber,
          title: episodeData.episode_title || `Episode ${episodeNumber}`,
          video_sources: `/stream?url=${getEpisodeDetails.stream_url}` || [],
          qlist,
          quality: modifiedStreamList || [],
          subtitles: episodeData.stream_url || [],
          download_links: getEpisodeDetails.download_urls || []
        },
        navigation: {
          isNext: episodeData.has_next_episode,
          isPrev: episodeData.has_previous_episode,
          prev: episodeData.previous_episode,
          next: episodeData.next_episode,
          all_episodes: sanitizedAnime.episodes
        },
        currentPage: 'anime'
    }
    res.render('episode-player', episodeDatas);
  } catch (error) {
    console.error('Episode player page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat episode'
      }
    });
  }
});

router.get('/:slug/batch', async (req, res) => {
  try {
    const slug = req.params.slug;
    const animeData = await animeApi.getAnimeDetails(slug);

    if (!animeData) {
      return res.status(404).render('error', {
        title: 'Anime Tidak Ditemukan - KitaNime',
        error: {
          status: 404,
          message: 'Anime yang Anda cari tidak ditemukan'
        }
      });
    }

    const sanitizedAnime = animeApi.validateAnimeData(animeData, slug);

    res.render('anime-batch', {
      title: `Download Batch ${sanitizedAnime.title} - KitaNime`,
      description: `Download batch ${sanitizedAnime.title} subtitle Indonesia`,
      anime: sanitizedAnime,
      batchLinks: animeData.batch_links || [],
      currentPage: 'anime'
    });
  } catch (error) {
    console.error('Batch download page error:', error);
    res.status(500).render('error', {
      title: 'Terjadi Kesalahan - KitaNime',
      error: {
        status: 500,
        message: 'Tidak dapat memuat halaman batch download'
      }
    });
  }
});

module.exports = router;
