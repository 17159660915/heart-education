const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'courses.json');

function readHistory() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveHistory(courses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2), 'utf-8');
}

router.get('/', (req, res) => {
  const courses = readHistory();
  res.json({ success: true, courses: courses.map(c => ({ id: c.id, theme: c.theme, grade: c.grade, createdAt: c.createdAt })) });
});

router.get('/:id', (req, res) => {
  const courses = readHistory();
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: '未找到课程' });
  res.json({ success: true, course });
});

router.post('/', (req, res) => {
  const courses = readHistory();
  const newCourse = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  courses.unshift(newCourse);
  if (courses.length > 50) courses.pop();
  saveHistory(courses);
  res.json({ success: true, id: newCourse.id });
});

router.delete('/:id', (req, res) => {
  let courses = readHistory();
  courses = courses.filter(c => c.id !== req.params.id);
  saveHistory(courses);
  res.json({ success: true });
});

module.exports = router;
