import { load } from 'cheerio';
const { BASEURL } = process.env ?? 'https://otakudesu.best';
const scrapeEpisode = (html) => {
    const $ = load(html);
    const episode = getEpisodeTitle($);
    const stream_url = getStreamUrl($);
    const download_urls = createDownloadData($);
    const previous_episode = getPrevEpisode($);
    const next_episode = getNextEpisode($);
    const anime = getAnimeData($);
    if (!episode)
        return undefined;
    return {
        episode,
        anime,
        has_next_episode: next_episode ? true : false,
        next_episode,
        has_previous_episode: previous_episode ? true : false,
        previous_episode,
        stream_url,
        download_urls,
    };
};
const getEpisodeTitle = ($) => {
    return $('.venutama .posttl').text();
};
const getStreamUrl = ($) => {
    return $('#pembed iframe').attr('src');
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
    nextEps = nextEps.split('/episode/')[1];
    return nextEps.match(/\d+/)[0];
};
const getNextEpisode = ($) => {
    if (!$('.flir a:last').attr('href')?.includes(`/episode/`)) return null;
    var nextEps = $('.flir a:last').attr('href');
    nextEps = nextEps.split('/episode/')[1];
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
