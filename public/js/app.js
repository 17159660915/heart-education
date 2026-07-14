// ============================================
//   心性教育课程策划系统 - 前端逻辑
// ============================================

// ---- State ----
let state = {
  currentLesson: '',
  currentTheme: '',
  chatHistory: [],
  isLoading: false,
};

// ---- DOM refs ----
const $ = id => document.getElementById(id);
const els = {
  topicInput: $('topicInput'),
  gradeSelect: $('gradeSelect'),
  coreTruthInput: $('coreTruthInput'),
  generateBtn: $('generateBtn'),
  videoKeyword: $('videoKeyword'),
  searchVideoBtn: $('searchVideoBtn'),
  videoSelected: $('videoSelected'),
  videoTitle: $('videoTitle'),
  videoDuration: $('videoDuration'),
  videoResults: $('videoResults'),
  templateGrid: $('templateGrid'),
  previewStatus: $('previewStatus'),
  previewArea: $('previewArea'),
  emptyState: $('emptyState'),
  markdownBody: $('markdownBody'),
  chatMessages: $('chatMessages'),
  chatInput: $('chatInput'),
  sendChatBtn: $('sendChatBtn'),
  clearChatBtn: $('clearChatBtn'),
  newBtn: $('newBtn'),
  historyBtn: $('historyBtn'),
  saveBtn: $('saveBtn'),
  exportBtn: $('exportBtn'),
  copyBtn: $('copyBtn'),
  toast: $('toast'),
  drawerOverlay: $('historyOverlay'),
  historyDrawer: $('historyDrawer'),
  closeHistoryBtn: $('closeHistoryBtn'),
  historyList: $('historyList'),
  sidebar: $('sidebar'),
  chatPane: $('chatPane'),
  navToggle: $('navToggle'),
};

// ---- Toast ----
function showToast(msg, dur = 2000) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), dur);
}

// ---- Simple Markdown Renderer ----
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // HR
    .replace(/^---$/gm, '<hr/>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  // Wrap in paragraph
  html = '<p>' + html + '</p>';

  // Fix: group consecutive li into ul
  html = html.replace(/(<li>.*?<\/li>)(?=<li>)/g, '$1');
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
  html = html.replace(/<ul>(<li>)/g, '<ul>$1');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- API Calls ----
async function generateLesson() {
  const topic = els.topicInput.value.trim();
  if (!topic) { showToast('请输入课程主题'); return; }

  setLoading(true);
  els.previewStatus.textContent = '正在生成课程...';

  try {
    const body = {
      topic,
      grade: els.gradeSelect.value,
      core_truth: els.coreTruthInput.value.trim(),
    };
    // Add video info if selected
    if (els.videoTitle.textContent) {
      body.video_info = `${els.videoTitle.textContent} - ${els.videoDuration.textContent || ''}`;
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      state.currentLesson = data.content;
      state.currentTheme = topic;
      renderPreview(data.content);
      els.previewStatus.textContent = `已生成：${topic}`;
      showToast('课程生成成功！');
    } else {
      showToast('生成失败：' + (data.error || '未知错误'));
    }
  } catch (err) {
    showToast('网络错误：' + err.message);
  } finally {
    setLoading(false);
  }
}

async function sendChatMessage() {
  const msg = els.chatInput.value.trim();
  if (!msg) return;

  // Add user message
  addChatMessage(msg, 'user');
  els.chatInput.value = '';
  state.chatHistory.push({ role: 'user', content: msg });

  // Add typing indicator
  const typing = showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: state.chatHistory,
        current_lesson: state.currentLesson,
      }),
    });
    const data = await res.json();
    typing.remove();

    if (data.success) {
      state.chatHistory.push({ role: 'assistant', content: data.content });
      addChatMessage(data.content, 'assistant');

      // If the response looks like a full lesson update, update preview
      if (data.content.includes('# ') && data.content.length > 200) {
        state.currentLesson = data.content;
        renderPreview(data.content);
        showToast('课程已更新预览');
      }
    } else {
      addChatMessage('抱歉，出错了：' + (data.error || '未知错误'), 'assistant');
    }
  } catch (err) {
    typing.remove();
    addChatMessage('网络错误：' + err.message, 'assistant');
  }
}

async function searchVideos() {
  const keyword = els.videoKeyword.value.trim();
  if (!keyword) { showToast('请输入搜索关键词'); return; }

  els.videoResults.innerHTML = '<div style="padding:12px;color:#666;font-size:13px">搜索中...</div>';

  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, count: 5 }),
    });
    const data = await res.json();

    if (data.success && data.videos.length) {
      els.videoResults.innerHTML = data.videos.map((v, i) =>
        `<div class="video-item" data-url="${v.link}" data-title="${escapeHtml(v.title)}" data-dur="${v.duration}">
          <div class="v-title">${escapeHtml(v.title)}</div>
          <div class="v-meta">时长: ${v.duration}</div>
        </div>`
      ).join('');

      // Add click handlers
      els.videoResults.querySelectorAll('.video-item').forEach(item => {
        item.onclick = () => {
          selectVideo(item.dataset.title, item.dataset.dur, item.dataset.url);
        };
      });
    } else {
      els.videoResults.innerHTML = '<div style="padding:12px;color:#999;font-size:13px">未找到相关视频</div>';
    }
  } catch (err) {
    els.videoResults.innerHTML = '<div style="padding:12px;color:#c0392b;font-size:13px">搜索失败</div>';
  }
}

function selectVideo(title, duration, url) {
  els.videoTitle.textContent = title;
  els.videoDuration.textContent = duration;
  els.videoSelected.style.display = 'block';
  els.videoResults.innerHTML = '';
  els.videoKeyword.value = '';
  showToast('已选择视频');
}

async function loadTemplates() {
  try {
    const res = await fetch('/api/templates');
    const data = await res.json();
    if (data.success) {
      els.templateGrid.innerHTML = data.templates.map(t =>
        `<div class="template-card" data-id="${t.id}" title="${escapeHtml(t.description)}">
          <div class="t-icon">${t.icon}</div>
          <div class="t-name">${t.name}</div>
        </div>`
      ).join('');

      els.templateGrid.querySelectorAll('.template-card').forEach(card => {
        card.onclick = () => applyTemplate(card.dataset.id);
      });
    }
  } catch (err) {
    console.error('Load templates error:', err);
  }
}

async function applyTemplate(id) {
  try {
    const res = await fetch(`/api/templates/${id}`);
    const data = await res.json();
    if (data.success) {
      const t = data.template;
      // Fill form
      els.topicInput.value = t.defaults.theme || '';
      els.coreTruthInput.value = t.defaults.core_truth || '';

      // Highlight active template
      els.templateGrid.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      els.templateGrid.querySelector(`[data-id="${id}"]`)?.classList.add('active');

      showToast(`已应用模板：${t.name}`);
    }
  } catch (err) {
    showToast('应用模板失败');
  }
}

async function saveCourse() {
  if (!state.currentLesson) { showToast('没有可保存的内容'); return; }

  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: state.currentTheme || '未命名课程',
        grade: els.gradeSelect.value,
        content: state.currentLesson,
      }),
    });
    const data = await res.json();
    if (data.success) showToast('课程已保存！');
    else showToast('保存失败');
  } catch (err) {
    showToast('保存失败');
  }
}

async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    if (data.success && data.courses.length) {
      els.historyList.innerHTML = data.courses.map(c => `
        <div class="history-item" data-id="${c.id}">
          <button class="h-delete" data-id="${c.id}" title="删除">✕</button>
          <div class="h-theme">${escapeHtml(c.theme || '未命名')}</div>
          <div class="h-meta">${c.grade || ''} · ${new Date(c.createdAt).toLocaleString('zh-CN')}</div>
        </div>
      `).join('');

      // Click to load
      els.historyList.querySelectorAll('.history-item').forEach(item => {
        item.onclick = (e) => {
          if (e.target.classList.contains('h-delete')) return;
          loadCourseFromHistory(item.dataset.id);
        };
      });

      // Delete buttons
      els.historyList.querySelectorAll('.h-delete').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          await deleteCourse(btn.dataset.id);
        };
      });
    } else {
      els.historyList.innerHTML = '<div style="padding:40px;text-align:center;color:#999">暂无历史记录</div>';
    }
  } catch (err) {
    els.historyList.innerHTML = '<div style="padding:40px;text-align:center;color:#c0392b">加载失败</div>';
  }
}

async function loadCourseFromHistory(id) {
  try {
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    if (data.success) {
      state.currentLesson = data.course.content || '';
      state.currentTheme = data.course.theme || '';
      renderPreview(state.currentLesson);
      els.previewStatus.textContent = `已加载：${state.currentTheme}`;
      closeHistoryDrawer();
      showToast('已加载历史课程');
    }
  } catch (err) {
    showToast('加载失败');
  }
}

async function deleteCourse(id) {
  try {
    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('已删除');
      loadHistory();
    }
  } catch (err) {
    showToast('删除失败');
  }
}

async function exportDocx() {
  if (!state.currentLesson) { showToast('没有可导出的内容'); return; }

  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonToData()),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentTheme || '课程讲义'}_心性教育.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('导出成功！');
    } else {
      const data = await res.json();
      showToast('导出失败：' + (data.error || '未知错误'));
    }
  } catch (err) {
    showToast('导出失败');
  }
}

function lessonToData() {
  return {
    theme: state.currentTheme || '未命名课程',
    subtitle: '',
    core_truth: els.coreTruthInput.value || '',
    grade: els.gradeSelect.value,
    duration: '约 60 分钟',
    video_title: els.videoTitle.textContent || '',
    video_url: '',
    video_duration: els.videoDuration.textContent || '',
    video_desc: '',
    pre_questions: [],
    post_question: '',
    layers: [],
    questions: [],
    golden_sentence: '',
    actions: [],
    script_sections: [],
  };
}

// ---- UI Functions ----
function renderPreview(md) {
  els.emptyState.style.display = 'none';
  els.markdownBody.style.display = 'block';
  els.markdownBody.innerHTML = renderMarkdown(md);
}

function addChatMessage(content, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (role === 'assistant') {
    bubble.innerHTML = renderMarkdown(content);
  } else {
    bubble.textContent = content;
  }
  div.appendChild(bubble);
  els.chatMessages.appendChild(div);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg ai';
  div.innerHTML = '<div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  els.chatMessages.appendChild(div);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  return div;
}

function setLoading(loading) {
  state.isLoading = loading;
  if (loading) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    els.previewArea.style.position = 'relative';
    els.previewArea.appendChild(overlay);
    els.generateBtn.disabled = true;
    els.generateBtn.textContent = '生成中...';
  } else {
    const overlay = $('loadingOverlay');
    if (overlay) overlay.remove();
    els.generateBtn.disabled = false;
    els.generateBtn.textContent = '生成课程';
  }
}

function openHistoryDrawer() {
  loadHistory();
  els.historyDrawer.classList.add('open');
  els.drawerOverlay.classList.add('show');
}

function closeHistoryDrawer() {
  els.historyDrawer.classList.remove('open');
  els.drawerOverlay.classList.remove('show');
}

function newCourse() {
  state.currentLesson = '';
  state.currentTheme = '';
  state.chatHistory = [];
  els.topicInput.value = '';
  els.coreTruthInput.value = '';
  els.videoTitle.textContent = '';
  els.videoDuration.textContent = '';
  els.videoSelected.style.display = 'none';
  els.emptyState.style.display = 'flex';
  els.markdownBody.style.display = 'none';
  els.markdownBody.innerHTML = '';
  els.previewStatus.textContent = '等待生成...';
  els.chatMessages.innerHTML = '<div class="chat-msg ai"><div class="msg-bubble">你好！我是你的课程策划助手。你可以让我：<br/>• 调整某层讲解的例子<br/>• 增加互动环节<br/>• 修改语言深度<br/>• 更换引入视频描述<br/>试试说：「把第三层讲得更贴近学生生活」</div></div>';
  els.templateGrid.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  showToast('已新建课程');
}

// ---- Event Listeners ----
els.generateBtn.onclick = generateLesson;
els.topicInput.onkeydown = (e) => { if (e.key === 'Enter') generateLesson(); };
els.searchVideoBtn.onclick = searchVideos;
els.videoKeyword.onkeydown = (e) => { if (e.key === 'Enter') searchVideos(); };
els.sendChatBtn.onclick = sendChatMessage;
els.chatInput.onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
};
els.clearChatBtn.onclick = () => {
  state.chatHistory = [];
  els.chatMessages.innerHTML = '<div class="chat-msg ai"><div class="msg-bubble">对话已清空</div></div>';
};
els.newBtn.onclick = newCourse;
els.historyBtn.onclick = openHistoryDrawer;
els.closeHistoryBtn.onclick = closeHistoryDrawer;
els.drawerOverlay.onclick = closeHistoryDrawer;
els.saveBtn.onclick = saveCourse;
els.exportBtn.onclick = exportDocx;
els.copyBtn.onclick = () => {
  if (state.currentLesson) {
    navigator.clipboard.writeText(state.currentLesson);
    showToast('已复制到剪贴板');
  }
};
els.navToggle.onclick = () => {
  els.sidebar.classList.toggle('collapsed');
};

// ---- Init ----
loadTemplates();
showToast('欢迎使用心性教育课程策划系统！');
