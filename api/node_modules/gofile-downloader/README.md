---

# Gofile Downloader - Node.js Module

## Introduction

Le module **Gofile Downloader** permet d'interagir facilement avec l'API de Gofile.io pour récupérer des fichiers hébergés sur leur plateforme. Il simplifie les étapes d'authentification et d'accès aux fichiers partagés en utilisant un token invité. Ce module est destiné à être utilisé dans des applications Node.js pour automatiser le téléchargement de fichiers à partir de Gofile.io.

---

## Table des matières

- [Installation](#installation)
- [Utilisation](#utilisation)
  - [Récupérer le lien de téléchargement d'un fichier](#récupérer-le-lien-de-téléchargement-dun-fichier)
  - [Lister les fichiers dans un contenu](#lister-les-fichiers-dans-un-contenu)
  - [Récupérer le contenu d'un fichier](#récupérer-le-contenu-dun-fichier)
  - [Récupérer un token invité](#récupérer-un-token-invité)
  - [Récupérer la valeur `wt`](#récupérer-la-valeur-wt)
- [API](#api)
  - [`getDownloadLink`](#getdownloadlink)
  - [`listFiles`](#listfiles)
  - [`getContent`](#getcontent)
  - [`getToken`](#gettoke)
  - [`getWt`](#getwt)
- [Configuration](#configuration)
- [Tests](#tests)
- [Licence](#licence)

---

## Installation

### Prérequis

- Node.js (version 12 ou supérieure)
- npm (ou yarn)

### Installer via npm

Dans le terminal, exécutez la commande suivante pour installer le module via npm :

```bash
npm install gofile-downloader
```

### Installer via GitHub

Si vous voulez cloner ce repository directement depuis GitHub, utilisez la commande suivante :

```bash
git clone https://github.com/jujukingg/gofile-downloader.git
cd gofile-downloader
npm install
```

---

## Utilisation

Voici un aperçu des différentes fonctionnalités du module `gofile-downloader`.
### Récupérer le lien de téléchargement d'un fichier

Une fois que vous avez un `contentId`, vous pouvez obtenir un lien de téléchargement direct du fichier hébergé sur Gofile.io.

```javascript
const { getDownloadLink } = require('gofile-downloader');

(async () => {
    try {
        const contentId = 'ID_OU_LIEN'; // Remplacez par un ID de contenu valide
        const link = await getDownloadLink(contentId);
        console.log(`Lien de téléchargement : ${link}`);
    } catch (err) {
        console.error('Erreur :', err.message);
    }
})();
```

### Récupérer un token invité

Pour interagir avec l'API de Gofile, vous devez d'abord obtenir un token invité. Ce token est nécessaire pour effectuer des requêtes sur l'API.

```javascript
const { getToken } = require('gofile-downloader');

(async () => {
    try {
        const token = await getToken();
        console.log(`Token récupéré : ${token}`);
    } catch (err) {
        console.error('Erreur :', err.message);
    }
})();
```
### Lister les fichiers dans un contenu

Cette fonction permet de récupérer une liste de tous les fichiers d'un contenu partagé. Pour chaque fichier, le nom, la taille et le lien de téléchargement seront fournis.

```javascript
const { listFiles } = require('gofile-downloader');

(async () => {
    try {
        const contentId = 'ID_OU_LIEN'; // Remplacez par un ID valide
        const files = await listFiles(contentId);
        files.forEach(file => {
            console.log(`Nom : ${file.name}, Taille : ${file.size} octets, Lien : ${file.link}`);
        });
    } catch (err) {
        console.error('Erreur :', err.message);
    }
})();
```

### Récupérer le contenu d'un fichier

Cette fonction permet de récupérer le contenu d'un fichier spécifique (en l’occurrence, son lien direct).

```javascript
const { getContent } = require('gofile-downloader');

(async () => {
    try {
        const contentId = 'ID_OU_LIEN';  // Remplacez par un ID de contenu valide
        const token = await getToken();
        const wt = await getWt();
        const content = await getContent(contentId, token, wt);
        console.log(`Contenu récupéré : ${content}`);
    } catch (err) {
        console.error('Erreur :', err.message);
    }
})();
```

### Récupérer la valeur `wt`

Le module récupère aussi la valeur `wt`, nécessaire pour effectuer certaines requêtes à l'API.

```javascript
const { getWt } = require('gofile-downloader');

(async () => {
    try {
        const wt = await getWt();
        console.log(`Valeur wt récupérée : ${wt}`);
    } catch (err) {
        console.error('Erreur :', err.message);
    }
})();
```

---

## API
### `getDownloadLink(contentId)`

Retourne le lien de téléchargement d'un fichier spécifié par son `contentId`.

#### Exemple :

```javascript
const downloadLink = await getDownloadLink('ID_OU_LIEN');
```

### `listFiles(contentId)`

Liste les fichiers d'un contenu spécifié par `contentId`, avec leur nom, taille et lien de téléchargement.

#### Exemple :

```javascript
const files = await listFiles('ID_OU_LIEN');
```

### `getContent(contentId, token, wt)`

Récupère le contenu d'un fichier spécifique à partir de son `contentId`, du `token` et de la valeur `wt`.

#### Exemple :

```javascript
const content = await getContent('ID_OU_LIEN', token, wt);
```

### `getToken()`

Retourne un token invité pour interagir avec l'API de Gofile.io.

#### Exemple :

```javascript
const token = await getToken();
```

### `getWt()`

Récupère la valeur `wt` nécessaire pour effectuer certaines requêtes sur l'API de Gofile.io.

#### Exemple :

```javascript
const wt = await getWt();
```



---

## Configuration

- **CONTENT_ID** :  
  Vous pouvez définir manuellement un `contentId` (l'**ID** ou le **lien** Gofile) **directement dans le fichier** à la **ligne 4** du fichier `test.js`.  
  Sinon, vous pouvez aussi passer l'ID ou le lien directement en argument lors du test.

## Tests

Pour tester le module, exécutez simplement le fichier `test.js`.  
Il contient plusieurs exemples pour utiliser toutes les fonctions disponibles.

Assurez-vous d'avoir installé toutes les dépendances avant d'exécuter les tests.

```bash
npm test ["ID_OU_LIEN"]
```

- L'argument `"ID_OU_LIEN"` est **optionnel** :  
  - Si vous le fournissez, il sera utilisé.  
  - Sinon, la valeur définie dans le fichier `test.js` (ligne 4) sera prise par défaut.

---


## Licence

Ce projet est sous licence **ISC**, avec une exigence supplémentaire :

- Toute utilisation, modification, distribution ou réutilisation de ce module **doit obligatoirement inclure** une mention claire de l'auteur original (**JujuKing**) dans votre projet, votre documentation ou votre dépôt.
- Si vous modifiez ou améliorez ce code, **vous devez forker** le dépôt original et conserver un lien vers celui-ci.
- Toute reprise du code sans attribution claire à l'auteur initial est **strictement interdite**.

**Respectez le travail de l'auteur.**  
**Forkez, mentionnez et créditez correctement.**
Made by ❤️ and ☕ by jujuking
---