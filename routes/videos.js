const express = require('express');
const { searchVideos } = require('../services/bilibili');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { keyword, count } = req.body;
    if (!keyword) return res.status(400).json({ error: '请提供搜索关键词' });

    const videos = await searchVideos(keyword, count || 5);
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Video search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
