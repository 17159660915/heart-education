// ============================================
//   心性教育课程策划系统 - 前端-only 版本
// ============================================

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';
const API_KEY_STORAGE = 'lp_api_key';
const HISTORY_STORAGE = 'lp_history';
const TEMPLATES = [
  { id:'character', name:'品德与修养', icon:'❤️', description:'以《礼物》视频引入，探讨善良、同理心、接纳不完美',
    defaults:{ theme:'品德与修养——真正的「礼物」', subtitle:'我们每个人都是礼物，只是有些礼物包装得不太一样', core_truth:'品德不是挂在嘴上的漂亮话，而是体现在我们如何对待那些「不一样」的人和生命', video_title:'《礼物》(The Present)', video_url:'https://www.bilibili.com/video/BV1gs411R7dE/', video_duration:'4分35秒', video_desc:'一个沉迷游戏的男孩，收到妈妈送的礼物——一只三条腿的小狗。他起初嫌弃，最终被小狗的热情打动，站起来走出门时，我们发现他自己也装着义肢。', pre_questions:['注意看男孩收到礼物后表情和态度发生了什么变化？','小狗有什么「不一样」的地方？'], post_question:'看完短片，你觉得标题「礼物」——到底什么才是真正的礼物？' } },
  { id:'honesty', name:'诚信的力量', icon:'⚖️', description:'探讨诚实与信任的价值',
    defaults:{ theme:'诚信的力量', subtitle:'诚实是立身之本，信任是人际之桥', core_truth:'诚信不是一种口号，而是每一次选择中，你选择说真话、做真事', video_title:'《狼来了》动画短片', video_url:'https://search.bilibili.com/all?keyword=狼来了动画', video_duration:'约5分钟', video_desc:'经典的寓言故事：一个牧童多次撒谎喊"狼来了"，当狼真的来了时，没人相信他。', pre_questions:['你遇到过需要说真话但很难开口的时刻吗？'], post_question:'如果我们选择诚信，可能会付出什么代价？这个代价值得吗？' } },
  { id:'perseverance', name:'逆境中的坚持', icon:'💪', description:'面对困难不放弃，坚持的力量',
    defaults:{ theme:'逆境中的坚持', subtitle:'真正的坚持不是硬扛，而是心中有光', core_truth:'坚持不是因为看到了希望才坚持，而是因为坚持了才看到希望', video_title:'《鹬》(Piper) 皮克斯动画', video_url:'https://search.bilibili.com/all?keyword=皮克斯短片鹬Piper', video_duration:'6分钟', video_desc:'一只小矶鹬鸟在母亲引导下，克服对海浪的恐惧，最终学会独立成长。', pre_questions:['你有过坚持做一件事最后成功的经历吗？'], post_question:'当坚持很难的时候，是什么让你继续下去的？' } },
  { id:'gratitude', name:'感恩之心', icon:'🙏', description:'学会感恩，珍惜身边的一切',
    defaults:{ theme:'感恩之心', subtitle:'滴水之恩，当涌泉相报', core_truth:'感恩是一种看见——看见别人对自己的好，并且珍惜', video_title:'《父亲》微电影（筷子兄弟）', video_url:'https://search.bilibili.com/all?keyword=父亲微电影筷子兄弟', video_duration:'约10分钟', video_desc:'一个父亲默默为子女付出的感人故事，诠释父爱的深沉与伟大。', pre_questions:['你能说出三个你最想感谢的人吗？'], post_question:'你有多久没有对帮助过你的人说一声「谢谢」了？' } },
  { id:'dream', name:'梦想与追求', icon:'⭐', description:'引导学生树立目标，追逐梦想',
    defaults:{ theme:'梦想与追求', subtitle:'心中有梦想，脚下有力量', core_truth:'梦想不是遥不可及的幻想，而是你愿意每天多做一点的事', pre_questions:['你的梦想是什么？为什么？'], post_question:'为了梦想，你愿意做出什么样的努力？' } },
  { id:'respect', name:'尊重与包容', icon:'🤝', description:'学会尊重差异，包容不同',
    defaults:{ theme:'尊重与包容', subtitle:'君子和而不同', core_truth:'尊重不是只对和自己一样的人友善，而是对和自己不一样的人也能包容', pre_questions:['你觉得班上有没有特别「不一样」的同学？'], post_question:'什么是真正的「尊重」？是礼貌地说「你好」，还是……？' } },
  { id:'responsibility', name:'责任与担当', icon:'🎯', description:'培养责任心，学会承担',
    defaults:{ theme:'责任与担当', subtitle:'能力越大，责任越大', core_truth:'责任不是被强加的负担，而是你对自己和他人的一种承诺', pre_questions:['你觉得什么是「负责任」？'], post_question:'$如果你答应了别人一件事，但中途不想做了，你会怎么办？' } },
  { id:'selfdiscipline', name:'自律与自由', icon:'🔑', description:'懂得自律，才能真正自由',
    defaults:{ theme:'自律与自由', subtitle:'真正的自由，不是随心所欲，而是自我主宰', core_truth:'自律不是束缚，而是让你拥有选择的能力和底气', pre_questions:['你觉得「自由」是什么？想做什么就做什么吗？'], post_question:'如果没人监督你，你还会坚持做正确的事吗？' } },
];

const SYSTEM_PROMPT = `你是一位专注于心性教育的课程策划专家。你的任务是帮助老师设计给中小学生上的心性教育课程（约60分钟）。

课程必须严格按照以下结构生成，这是四层递进的教学模型：

一、课程概览
- 主题：简练有力，一句话命中核心
- 核心道理：这节课要传达的核心心性智慧（一句话）
- 适用年级：五至九年级
- 时长：约60分钟

二、引入视频
用户会提供引入视频素材（名称、链接、简介），基于此设计观看前引导问题（1-2个）和观看后破冰提问（1个）。
如果用户未提供视频，则根据主题自行推荐一个合适的短视频。

三、核心讲解（递进四层）
第一层 · 现象层「我们看到了什么」
  - 核心观点：一句话
  - 讲解要点：展开说明（2-3句）
  - 举例：生活化的、学生感兴趣的例子

第二层 · 道理层「这说明了什么」
  - 核心观点：从现象提炼出道理（一句话）
  - 讲解要点：通过生活实例或历史故事体现
  - 举例：可以是名人故事、社会现象、学生身边的例子

第三层 · 心性层「这跟我们的心性有什么关系」
  - 核心观点：承上启下，把道理回到心性修养（一句话）
  - 讲解要点：深度分析，学生可以自我反思的问题
  - 举例：学生场景化，让他们想到自己的经历

第四层 · 智慧层「这个道理还能用在什么地方」
  - 核心观点：升华到更普适的人生智慧，跨领域印证（一句话）
  - 讲解要点：可以引用名人、名言、经典故事
  - 举例：古今中外的印证，展示这个道理的普适性

四、引导提问（递进七问）
Q1-Q2 理解层：视频/故事内容简述
Q3-Q4 分析层：原因、动机、影响分析
Q5-Q6 联系层：联系自身、反思行为
Q7 升华层：行动承诺、智慧转化

五、总结升华
- 核心金句：一句话，好记好传播
- 课后实践：1-3个具体可做的行动

六、逐字讲稿
60分钟完整讲稿，分7个时间段：
[00:00-05:00] 开场白
[05:00-10:00] 视频播放+视频后互动
[10:00-25:00] 第一层+第二层讲解
[25:00-35:00] 互动提问+讨论
[35:00-50:00] 第三层+第四层讲解
[50:00-55:00] 总结升华+金句
[55:00-60:00] 课后实践布置+结束语

讲稿要求：语言口语化，像真的在讲课。标注【停顿】【提问】【板书】【展示视频】【互动环节】，提问后预留学生回答空间。
重要：所有讲解要深入浅出、带有情感，不能空洞说教。`;

// ---- State ----
let state = { currentLesson:'', currentTheme:'', chatHistory:[], isLoading:false };

// ---- DOM ----
const $ = id => document.getElementById(id);
const els = {
  apiKeyModal:$('apiKeyModal'), apiKeyInput:$('apiKeyInput'), saveApiKeyBtn:$('saveApiKeyBtn'),
  settingsBtn:$('settingsBtn'), topicInput:$('topicInput'), gradeSelect:$('gradeSelect'),
  coreTruthInput:$('coreTruthInput'), generateBtn:$('generateBtn'),
  videoTitle:$('videoTitle'), videoUrl:$('videoUrl'), videoDesc:$('videoDesc'),
  clearVideoBtn:$('clearVideoBtn'),
  templateGrid:$('templateGrid'),
  previewStatus:$('previewStatus'), previewArea:$('previewArea'),
  emptyState:$('emptyState'), markdownBody:$('markdownBody'),
  chatMessages:$('chatMessages'), chatInput:$('chatInput'), sendChatBtn:$('sendChatBtn'),
  clearChatBtn:$('clearChatBtn'), newBtn:$('newBtn'), saveBtn:$('saveBtn'),
  exportBtn:$('exportBtn'), copyBtn:$('copyBtn'), toast:$('toast'),
  sidebar:$('sidebar'), chatPane:$('chatPane'), navToggle:$('navToggle'),
};

// ---- API Key ----
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }
function setApiKey(key) { localStorage.setItem(API_KEY_STORAGE, key); }
function showApiKeyModal() { els.apiKeyModal.classList.remove('hidden'); }
function hideApiKeyModal() { els.apiKeyModal.classList.add('hidden'); }

// ---- Toast ----
function showToast(msg, dur = 2500) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), dur);
}

// ---- DeepSeek API ----
async function callDeepSeek(messages, options = {}) {
  const key = getApiKey();
  if (!key) { showApiKeyModal(); return null; }
  const resp = await fetch(DEEPSEEK_BASE + '/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens || 4000,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `API错误: ${resp.status}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

// ---- 生成历史追踪 ----
const ANGLES_STORAGE = 'lp_angles';

function getUsedAngles() {
  try { return JSON.parse(localStorage.getItem(ANGLES_STORAGE) || '{}'); }
  catch { return {}; }
}

function saveAngles(topic, content) {
  const angles = getUsedAngles();
  if (!angles[topic]) angles[topic] = [];
  const goldMatch = content.match(/核心金句[：:](.+)/);
  const examples = content.match(/举例[：:](.+)/g) || [];
  const entry = {
    gold: goldMatch ? goldMatch[1].trim() : '',
    examples: examples.slice(0, 3).map(e => e.replace(/举例[：:]/, '').trim()),
    time: Date.now(),
  };
  angles[topic].push(entry);
  if (angles[topic].length > 5) angles[topic] = angles[topic].slice(-5);
  localStorage.setItem(ANGLES_STORAGE, JSON.stringify(angles));
}

function buildAvoidContext(topic) {
  const angles = getUsedAngles();
  const history = angles[topic];
  if (!history || history.length === 0) return '';
  let ctx = '\n\n⚠️ 你之前为这个主题生成过以下版本，请用完全不同的切入角度和例子，避免重复：\n';
  history.forEach((h, i) => {
    ctx += `\n版本${i + 1}：`;
    if (h.gold) ctx += `\n  金句：「${h.gold}」`;
    if (h.examples.length) ctx += `\n  曾用例子：${h.examples.join('、')}`;
  });
  ctx += `\n\n请换一个全新的视角，用不同的人、不同的故事、不同的道理来讲解同一个主题。`;
  return ctx;
}

// ---- Generate ----
async function generateLesson() {
  const topic = els.topicInput.value.trim();
  if (!topic) { showToast('请输入课程主题'); return; }
  if (!getApiKey()) { showApiKeyModal(); return; }

  setLoading(true);
  els.previewStatus.textContent = '正在生成课程...';

  try {
    const body = { topic, grade: els.gradeSelect.value, core_truth: els.coreTruthInput.value.trim() };
    // 视频素材
    const vTitle = els.videoTitle.value.trim();
    const vUrl = els.videoUrl.value.trim();
    const vDesc = els.videoDesc.value.trim();
    if (vTitle) {
      body.video_info = vTitle;
      if (vUrl) body.video_info += ` ${vUrl}`;
      if (vDesc) body.video_info += ` - ${vDesc}`;
    }

    const avoidCtx = buildAvoidContext(topic);

    const userPrompt = `请为我设计一节心性教育课程：\n主题：${body.topic}\n${body.grade ? `目标学生：${body.grade}` : ''}\n${body.core_truth ? `核心道理：${body.core_truth}` : ''}\n${body.video_info ? `引入视频：${body.video_info}` : ''}${avoidCtx}\n\n请用 Markdown 格式输出，严格按照结构，每个大段落用二级标题。`;

    const content = await callDeepSeek([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    if (content) {
      state.currentLesson = content;
      state.currentTheme = topic;
      renderPreview(content);
      saveAngles(topic, content);
      const angles = getUsedAngles();
      const count = angles[topic]?.length || 1;
      els.previewStatus.textContent = `已生成：${topic}（第${count}版）`;
      showToast(`生成成功！已自动避免前${count > 1 ? count - 1 : 0}版的重复`);
    }
  } catch (err) {
    showToast('生成失败：' + err.message);
  } finally {
    setLoading(false);
  }
}

// ---- 提取调整摘要 ----
function extractChangeHint(msg) {
  if (msg.includes('例子') || msg.includes('举例')) return '，已更换新例子';
  if (msg.includes('金句')) return '，已更新金句';
  if (msg.includes('深度') || msg.includes('语言')) return '，已调整语言深度';
  if (msg.includes('互动')) return '，已增加互动环节';
  if (msg.includes('视频')) return '，已更新视频素材';
  if (msg.includes('更') || msg.includes('换')) return '，已按你的要求修改';
  return '';
}

// ---- Chat ----
async function sendChatMessage() {
  const msg = els.chatInput.value.trim();
  if (!msg) return;
  if (!getApiKey()) { showApiKeyModal(); return; }

  addChatMessage(msg, 'user');
  els.chatInput.value = '';
  state.chatHistory.push({ role: 'user', content: msg });
  const typing = showTyping();

  try {
    const systemP = `你是心性教育课程策划助手。用户正在编辑一节课程，根据要求调整内容。当前课程：\n${state.currentLesson || '无'}\n\n调整规则：理解用户意图，给出调整后的完整Markdown格式内容。`;
    const messages = [
      { role: 'system', content: systemP },
      ...state.chatHistory.map(m => ({ role: m.role, content: m.content })),
    ];
    const content = await callDeepSeek(messages);
    typing.remove();
    if (content) {
      state.chatHistory.push({ role: 'assistant', content });
      if (content.includes('# ') && content.length > 200) {
        // 完整课程内容 → 显示在中间预览区
        state.currentLesson = content;
        renderPreview(content);
        // 聊天框只回一句简洁确认
        const changeHint = extractChangeHint(msg);
        addChatMessage(`✅ 调整完毕${changeHint}，已更新到预览区`, 'assistant');
      } else {
        // 简短回复 → 正常显示在聊天框
        addChatMessage(content, 'assistant');
      }
    }
  } catch (err) {
    typing.remove();
    addChatMessage('抱歉，出错了：' + err.message, 'assistant');
  }
}

// ---- Video Search ----
// 已移除：改为手动输入视频素材

// ---- Templates ----
function loadTemplates() {
  els.templateGrid.innerHTML = TEMPLATES.map(t =>
    `<div class="template-card" data-id="${t.id}" title="${escapeHtml(t.description)}">
      <div class="t-icon">${t.icon}</div><div class="t-name">${t.name}</div>
    </div>`).join('');
  els.templateGrid.querySelectorAll('.template-card').forEach(card => {
    card.onclick = () => applyTemplate(card.dataset.id);
  });
}

function applyTemplate(id) {
  const t = TEMPLATES.find(x => x.id === id);
  if (!t) return;
  els.topicInput.value = t.defaults.theme || '';
  els.coreTruthInput.value = t.defaults.core_truth || '';
  els.videoTitle.value = t.defaults.video_title || '';
  els.videoUrl.value = t.defaults.video_url || '';
  els.videoDesc.value = t.defaults.video_desc || '';
  els.templateGrid.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  els.templateGrid.querySelector(`[data-id="${id}"]`)?.classList.add('active');
  showToast(`已应用模板：${t.name}`);
}

// ---- History (localStorage) ----
function getHistory() { return JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]'); }
function saveHistory(list) { localStorage.setItem(HISTORY_STORAGE, JSON.stringify(list)); }

function saveCourse() {
  if (!state.currentLesson) { showToast('没有可保存的内容'); return; }
  const list = getHistory();
  list.unshift({ id: Date.now().toString(), theme: state.currentTheme || '未命名', grade: els.gradeSelect.value, content: state.currentLesson, createdAt: new Date().toISOString() });
  if (list.length > 30) list.pop();
  saveHistory(list);
  showToast('课程已保存！');
}

// ---- Export DOCX ----
async function exportDocx() {
  if (!state.currentLesson) { showToast('没有可导出的内容'); return; }
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
    const lines = state.currentLesson.split('\n');
    const children = [];
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: line.slice(2), bold: true, size: 32, font: { name: 'Microsoft YaHei' } })] }));
      } else if (line.startsWith('## ')) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: line.slice(3), bold: true, size: 26, font: { name: 'Microsoft YaHei' } })] }));
      } else if (line.startsWith('### ')) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: line.slice(4), bold: true, size: 22, font: { name: 'Microsoft YaHei' } })] }));
      } else if (line.trim()) {
        children.push(new Paragraph({ children: [new TextRun({ text: line, size: 21, font: { name: 'Microsoft YaHei' } })] }));
      }
    });
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${state.currentTheme || '课程讲义'}_心性教育.docx`);
    showToast('导出成功！');
  } catch (err) {
    showToast('导出失败：' + err.message);
  }
}

// ---- UI Helpers ----
function renderPreview(md) {
  els.emptyState.style.display = 'none';
  els.markdownBody.style.display = 'block';
  els.markdownBody.innerHTML = marked.parse(md);
}

function addChatMessage(content, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = role === 'assistant' ? marked.parse(content) : escapeHtml(content);
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
    const o = document.createElement('div');
    o.className = 'loading-overlay'; o.id = 'loadingOverlay';
    o.innerHTML = '<div class="loading-spinner"></div>';
    els.previewArea.style.position = 'relative';
    els.previewArea.appendChild(o);
    els.generateBtn.disabled = true;
    els.generateBtn.textContent = '生成中...';
  } else {
    const o = $('loadingOverlay');
    if (o) o.remove();
    els.generateBtn.disabled = false;
    els.generateBtn.textContent = '生成课程';
  }
}

function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function newCourse() {
  state.currentLesson = ''; state.currentTheme = ''; state.chatHistory = [];
  els.topicInput.value = ''; els.coreTruthInput.value = '';
  els.videoTitle.value = ''; els.videoUrl.value = ''; els.videoDesc.value = '';
  els.emptyState.style.display = 'flex'; els.markdownBody.style.display = 'none'; els.markdownBody.innerHTML = '';
  els.previewStatus.textContent = '等待生成...';
  els.chatMessages.innerHTML = '<div class="chat-msg ai"><div class="msg-bubble">你好！我是你的课程策划助手。</div></div>';
  els.templateGrid.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  showToast('已新建课程');
}

// ---- Events ----
els.saveApiKeyBtn.onclick = () => {
  const key = els.apiKeyInput.value.trim();
  if (!key) { showToast('请输入 API Key'); return; }
  setApiKey(key);
  hideApiKeyModal();
  showToast('API Key 已保存');
};
els.apiKeyInput.onkeydown = e => { if (e.key === 'Enter') els.saveApiKeyBtn.click(); };
els.settingsBtn.onclick = () => {
  els.apiKeyInput.value = getApiKey();
  showApiKeyModal();
};
els.generateBtn.onclick = generateLesson;
els.topicInput.onkeydown = e => { if (e.key === 'Enter') generateLesson(); };
els.sendChatBtn.onclick = sendChatMessage;
els.chatInput.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } };
els.clearChatBtn.onclick = () => { state.chatHistory = []; els.chatMessages.innerHTML = '<div class="chat-msg ai"><div class="msg-bubble">对话已清空</div></div>'; };
els.newBtn.onclick = newCourse;
els.saveBtn.onclick = saveCourse;
els.exportBtn.onclick = exportDocx;
els.copyBtn.onclick = () => { if (state.currentLesson) { navigator.clipboard.writeText(state.currentLesson); showToast('已复制'); } };
els.navToggle.onclick = () => els.sidebar.classList.toggle('collapsed');
els.clearVideoBtn.onclick = () => {
  els.videoTitle.value = '';
  els.videoUrl.value = '';
  els.videoDesc.value = '';
  showToast('已清除视频素材');
};

// ---- Init ----
loadTemplates();
if (!getApiKey()) {
  setTimeout(showApiKeyModal, 500);
} else {
  hideApiKeyModal();
}
showToast('欢迎使用心性教育课程策划系统！');
