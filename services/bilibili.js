const axios = require('axios');

async function searchVideos(keyword, count = 5) {
  try {
    const url = `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    const videos = [];
    const titlePattern = /<a[^>]*title="([^"]+)"[^>]*href="(\/\/www\.bilibili\.com\/video\/[A-Za-z0-9]+)/g;
    const durationPattern = /class="[^"]*duration[^"]*"[^>]*>([^<]+)</g;

    let match;
    const seen = new Set();
    while ((match = titlePattern.exec(data)) !== null && videos.length < count) {
      const title = match[1];
      const link = 'https:' + match[2];
      if (!seen.has(link) && title.length > 4) {
        seen.add(link);
        videos.push({ title, link, duration: '?' });
      }
    }

    return videos;
  } catch (error) {
    console.error('Bilibili search error:', error.message);
    return [];
  }
}

module.exports = { searchVideos };
