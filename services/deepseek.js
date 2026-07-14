const axios = require('axios');
const path = require('path');
const fs = require('fs');

// 从 .env 文件读取配置
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

async function chatCompletion(messages, options = {}) {
  const response = await axios.post(DEEPSEEK_BASE_URL + '/chat/completions', {
    model: options.model || 'deepseek-chat',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens || 4000,
  }, {
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  });
  return response.data.choices[0].message.content;
}

module.exports = { chatCompletion };
