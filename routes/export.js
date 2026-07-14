const express = require('express');
const path = require('path');
const { generateDocx } = require('../services/docx');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const lesson = req.body;
    if (!lesson || !lesson.theme) {
      return res.status(400).json({ error: '缺少课程数据' });
    }

    const filename = `课程讲义_${lesson.theme}_${Date.now()}.docx`;
    const outputPath = path.join(__dirname, '..', 'data', filename);

    await generateDocx(lesson, outputPath);

    res.download(outputPath, `${lesson.theme}_课程讲义.docx`, (err) => {
      if (err) console.error('Download error:', err.message);
    });
  } catch (error) {
    console.error('Export error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
