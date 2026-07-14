const express = require('express');
const { chatCompletion } = require('../services/deepseek');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history, current_lesson } = req.body;
    if (!message) return res.status(400).json({ error: '请输入消息' });

    const systemPrompt = `\u4F60\u662F\u5FC3\u6027\u6559\u80B2\u8BFE\u7A0B\u7B56\u5212\u52A9\u624B\u3002\u7528\u6237\u6B63\u5728\u7F16\u8F91\u4E00\u8282\u8BFE\u7A0B\uFF0C\u4F60\u9700\u8981\u6839\u636E\u7528\u6237\u7684\u8981\u6C42\u8C03\u6574\u5185\u5BB9\u3002

\u5F53\u524D\u8BFE\u7A0B\u5185\u5BB9\uFF1A
${current_lesson || '\u65E0'}

\u8C03\u6574\u89C4\u5219\uFF1A
1. \u7528\u6237\u53EF\u80FD\u8BF4\u201C\u628A\u7B2C\u4E09\u5C42\u4E3E\u4F8B\u6362\u4E00\u4E0B\u201D\u201C\u591A\u52A0\u70B9\u4E92\u52A8\u201D\u201C\u8BED\u8A00\u964D\u4F4E\u4E00\u70B9\u201D\u7B49
2. \u4F60\u8981\u7406\u89E3\u7528\u6237\u610F\u56FE\uFF0C\u7136\u540E\u7ED9\u51FA\u8C03\u6574\u540E\u7684\u5B8C\u6574\u5185\u5BB9
3. \u8FD4\u56DE Markdown \u683C\u5F0F\uFF08\u4E0E\u539F\u59CB\u8BFE\u7A0B\u683C\u5F0F\u4E00\u81F4\uFF09
4. \u5982\u679C\u7528\u6237\u53EA\u662F\u95EE\u95EE\u9898\uFF0C\u76F4\u63A5\u56DE\u7B54\u5373\u53EF`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const content = await chatCompletion(messages);
    res.json({ success: true, content });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
