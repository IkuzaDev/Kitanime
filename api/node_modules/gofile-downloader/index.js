const axios = require('axios');

let cachedToken = null;

const getWt = async () => {
    try {
        const res = await axios.get('https://gofile.io/dist/js/global.js');
        const scriptContent = res.data;
        const regex = /appdata\.wt\s*=\s*['"]([^'"]+)['"]/;
        const match = scriptContent.match(regex);
        if (match && match[1]) {
            return match[1];
        } else {
            throw new Error("Impossible de trouver 'wt' dans global.js");
        }
    } catch (err) {
        throw new Error(`Problème en récupérant 'wt' : ${err.message}`);
    }
};

const createGuestAccount = async () => {
    try {
        const res = await axios.post('https://api.gofile.io/accounts');
        if (res.data.status !== 'ok') throw new Error(res.data.status);
        const token = res.data.data.token;
        cachedToken = token;
        return token;
    } catch (err) {
        throw new Error(`Problème pour créer un compte invité : ${err.message}`);
    }
};

const getToken = async () => {
    return cachedToken || await createGuestAccount();
};

const extractContentIdFromUrl = (url) => {
    const regex = /(?:gofile\.io\/file\/|gofile\.io\/\w+\/)([\w-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error("Impossible de récupérer l'ID du contenu depuis l'URL");
};

const getContent = async (contentIdOrUrl, token, wt) => {
    try {
        const contentId = contentIdOrUrl.startsWith('http') 
            ? extractContentIdFromUrl(contentIdOrUrl) 
            : contentIdOrUrl;

        const url = `https://api.gofile.io/contents/${contentId}`;
        const params = {
            wt,
            contentFilter: "",
            page: 1,
            pageSize: 1000,
            sortField: "createTime",
            sortDirection: -1
        };

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params
        });

        if (response.data.status !== "ok") {
            throw new Error(`Erreur de l'API : ${response.data.status}`);
        }

        const children = response.data.data.children;
        const firstFileKey = Object.keys(children)[0];
        const file = children[firstFileKey];
        return file.link;
    } catch (err) {
        throw new Error(`Problème pour récupérer le contenu : ${err.message}`);
    }
};

const getDownloadLink = async (contentIdOrUrl) => {
    try {
        const contentId = contentIdOrUrl.startsWith('http') 
            ? extractContentIdFromUrl(contentIdOrUrl) 
            : contentIdOrUrl;
        
        const wt = await getWt();
        const token = await getToken();
        return await getContent(contentId, token, wt);
    } catch (err) {
        throw err;
    }
};

const listFiles = async (contentIdOrUrl) => {
    try {
        const contentId = contentIdOrUrl.startsWith('http') 
            ? extractContentIdFromUrl(contentIdOrUrl) 
            : contentIdOrUrl;

        const wt = await getWt();
        const token = await getToken();
        const url = `https://api.gofile.io/contents/${contentId}`;
        const params = {
            wt,
            contentFilter: "",
            page: 1,
            pageSize: 1000,
            sortField: "createTime",
            sortDirection: -1
        };

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params
        });

        if (response.data.status !== "ok") {
            throw new Error(`Erreur de l'API : ${response.data.status}`);
        }

        const files = response.data.data.children;
        const fileList = Object.keys(files).map(key => {
            const file = files[key];
            return {
                name: file.name,
                size: file.size,
                link: file.link
            };
        });

        return fileList;
    } catch (err) {
        throw new Error(`Problème pour récupérer la liste des fichiers : ${err.message}`);
    }
};

module.exports = {
    getWt,
    createGuestAccount,
    getContent,
    getDownloadLink,
    getToken,
    listFiles,
    extractContentIdFromUrl
};
