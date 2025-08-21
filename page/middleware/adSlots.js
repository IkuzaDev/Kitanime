const { getAdSlotsByPosition, getSetting } = require('../models/database');

async function adSlots(req, res, next) {
  try {

    const adsenseEnabled = await getSetting('adsense_enabled');

    const [headerAds, sidebarTopAds, sidebarBottomAds, contentBottomAds, playerBottomAds] = await Promise.all([
      getAdSlotsByPosition('header'),
      getAdSlotsByPosition('sidebar-top'),
      getAdSlotsByPosition('sidebar-bottom'),
      getAdSlotsByPosition('content-bottom'),
      getAdSlotsByPosition('player-bottom')
    ]);

    res.locals.adSlots = {
      header: headerAds || [],
      sidebarTop: sidebarTopAds || [],
      sidebarBottom: sidebarBottomAds || [],
      contentBottom: contentBottomAds || [],
      playerBottom: playerBottomAds || []
    };
    
    res.locals.adsenseEnabled = adsenseEnabled === '1';

    next();
  } catch (error) {
    console.error('Ad slots middleware error:', error);
    res.locals.adSlots = {
      header: [],
      sidebarTop: [],
      sidebarBottom: [],
      contentBottom: [],
      playerBottom: []
    };
    res.locals.adsenseEnabled = false;
    next();
  }
}

module.exports = adSlots;
