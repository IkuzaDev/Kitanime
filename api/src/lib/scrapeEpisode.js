import { load } from 'cheerio';
import axios from 'axios';
const { BASEURL } = process.env ?? 'https://otakudesu.best';
const scrapeEpisode = async (html) => {
    const $ = load(html);
    const episode = getEpisodeTitle($);
    const download_urls = createDownloadData($);
    const previous_episode = getPrevEpisode($);
    const stream_url = getStreamUrl($);
    const next_episode = getNextEpisode($);
    const anime = getAnimeData($);
    const qualityList = await getStreamQuality($);
    if (!episode)
        return undefined;
    return {
        episode,
        anime,
        has_next_episode: next_episode ? true : false,
        next_episode,
        has_previous_episode: previous_episode ? true : false,
        previous_episode,
        stream_url: qualityList['480p'] || stream_url,
        steramList : qualityList,
        download_urls,
    };
};
const getEpisodeTitle = ($) => {
    return $('.venutama .posttl').text();
};

const getStreamUrl = ($) => {
    return $('#pembed iframe').attr('src');
};

const postToGetData = async (action, action2, videoData) => {
    const tasks = Object.entries(videoData).map(async ([key, value]) => {
      if (!value) return [key, null];
      try {
        const url = `https://otakudesu.best/wp-admin/admin-ajax.php`;
        const form = new URLSearchParams();
        form.append("id", value.id);
        form.append("i", value.i);
        form.append("q", value.q);
        form.append("action", action);
  
        let res = await axios.post(url, form.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        const form2 = new URLSearchParams();
        form2.append("id", value.id);
        form2.append("i", value.i);
        form2.append("q", value.q);
        form2.append("action", action2);
        form2.append("nonce", res.data.data);
  
        res = await axios.post(url, form2.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        const $$ = load(Buffer.from(res.data.data, "base64").toString("utf8"));
        const pdrain_url = $$("iframe").attr("src");
  
        const pdarin = await axios.get(pdrain_url);
        const $$$ = load(pdarin.data);
        const finalUrl = $$$('meta[property="og:video:secure_url"]').attr("content");
  
        return [key.replace("m", ""), finalUrl];
      } catch (err) {
        console.error(`${key} error:`, err.message);
        return [key, null];
      }
    });
  
    const resultsArr = await Promise.all(tasks);
    return Object.fromEntries(resultsArr.filter(Boolean));
  };

const getStreamQuality = async($) => {
    const streamLable = $('.mirrorstream');
    const results = {};
    ["m360p", "m480p", "m720p"].forEach(q => {
        const items = streamLable.find(`ul.${q} li a`);
        const last = items
        .filter((i, el) => {
            const text = $(el).text().toLowerCase();
            return text.includes("drain") || text.includes("desu");
        }).first();
        if (last.length) {
            results[q] = JSON.parse(Buffer.from(last.attr("data-content"), "base64").toString("utf8"));
        }
    });
    const actions = [];
    $("script").each((i, el) => {
        const scriptContent = $(el).html();
        if (!scriptContent) return;
        const regex = /action\s*:\s*"([a-z0-9]+)"/gi;
        let match;
        while ((match = regex.exec(scriptContent)) !== null) {
          actions.push(match[1]);
        }
    });
    const uniqueActions = [...new Set(actions)];
    const init = uniqueActions[1];
    const action = uniqueActions[0];
    const data = await postToGetData(init, action, results);
    return data;
};

const createDownloadData = ($) => {
    const mp4 = getMp4DownloadUrls($);
    const mkv = getMkvDownloadUrls($);
    return {
        mp4,
        mkv,
    };
};
const getMp4DownloadUrls = ($) => {
    const result = [];
    const mp4DownloadEls = $('.download ul:first li')
        .toString()
        .split('</li>')
        .filter((item) => item.trim() !== '')
        .map((item) => `${item}</li>`);
    for (const el of mp4DownloadEls) {
        const $ = load(el);
        const downloadUrls = $('a')
            .toString()
            .split('</a>')
            .filter((item) => item.trim() !== '')
            .map((item) => `${item}</a>`);
        const urls = [];
        for (const downloadUrl of downloadUrls) {
            const $ = load(downloadUrl);
            urls.push({
                provider: $('a').text(),
                url: $('a').attr('href'),
            });
        }
        result.push({
            resolution: $('strong').text()?.replace(/([A-z][A-z][0-9] )/, ''),
            urls,
        });
    }
    return result;
};
const getMkvDownloadUrls = ($) => {
    const result = [];
    const mp4DownloadEls = $('.download ul:last li')
        .toString()
        .split('</li>')
        .filter((item) => item.trim() !== '')
        .map((item) => `${item}</li>`);
    for (const el of mp4DownloadEls) {
        const $ = load(el);
        const downloadUrls = $('a')
            .toString()
            .split('</a>')
            .filter((item) => item.trim() !== '')
            .map((item) => `${item}</a>`);
        const urls = [];
        for (const url of downloadUrls) {
            const $ = load(url);
            urls.push({
                provider: $('a').text(),
                url: $('a').attr('href'),
            });
        }
        result.push({
            resolution: $('strong').text()?.replace(/([A-z][A-z][A-z] )/, ''),
            urls,
        });
    }
    return result;
};
const getPrevEpisode = ($) => {
    if (!$('.flir a:first').attr('href')?.includes(`/episode/`)) return null;
    var nextEps = $('.flir a:first').attr('href');
    nextEps = nextEps.split('/episode/')[1].split('-episode-')[1];
    return nextEps.match(/\d+/)[0];
};
const getNextEpisode = ($) => {
    if (!$('.flir a:last').attr('href')?.includes(`/episode/`)) return null;
    var nextEps = $('.flir a:last').attr('href');
    nextEps = nextEps.split('/episode/')[1].split('-episode-')[1];
    return nextEps.match(/\d+/)[0];
};
const getAnimeData = ($) => {
    if ($('.flir a:nth-child(3)').text().trim() === '' || $('.flir a:nth-child(3)').text() === undefined) {
        
        return {
            slug: $('.flir a:first').attr('href')?.replace(`${BASEURL}/anime/`, '')?.replace('/', ''),
            otakudesu_url: $('.flir a:first').attr('href'),
        };
    }
    return {
        slug: $('.flir a:nth-child(2)').attr('href')?.replace(`${BASEURL}/anime/`, '')?.replace('/', ''),
        otakudesu_url: $('.flir a:nth-child(2)').attr('href'),
    };
};
export default scrapeEpisode;
