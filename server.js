const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const generateRouter = require('./routes/generate');
const chatRouter = require('./routes/chat');
const videosRouter = require('./routes/videos');
const exportRouter = require('./routes/export');
const historyRouter = require('./routes/history');
const templatesRouter = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/generate', generateRouter);
app.use('/api/chat', chatRouter);
app.use('/api/videos', videosRouter);
app.use('/api/export', exportRouter);
app.use('/api/history', historyRouter);
app.use('/api/templates', templatesRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  \u5FC3\u6027\u6559\u80B2\u8BFE\u7A0B\u7B56\u5212\u7CFB\u7EDF \u5DF2\u542F\u52A8`);
  console.log(`  \u8BBF\u95EE\u5730\u5740: http://localhost:${PORT}\n`);
});
