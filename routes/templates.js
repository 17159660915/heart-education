const express = require('express');

const router = express.Router();

const TEMPLATES = [
  {
    id: 'character',
    name: '品德与修养',
    icon: '❤️',
    description: '以《礼物》视频引入，探讨善良、同理心、接纳不完美',
    defaults: {
      theme: '品德与修养——真正的「礼物」',
      subtitle: '我们每个人都是礼物，只是有些礼物包装得不太一样',
      core_truth: '品德不是挂在嘴上的漂亮话，而是体现在我们如何对待那些「不一样」的人和生命',
      video_title: '《礼物》(The Present)',
      video_url: 'https://www.bilibili.com/video/BV1gs411R7dE/',
      video_duration: '4分35秒',
      video_desc: '一个沉迷游戏的男孩，收到妈妈送的礼物——一只三条腿的小狗。他起初嫌弃，最终被小狗的热情打动，站起来走出门时，我们发现他自己也装着义肢。',
      pre_questions: ['注意看男孩收到礼物后表情和态度发生了什么变化？', '小狗有什么「不一样」的地方？'],
      post_question: '看完短片，你觉得标题「礼物」——到底什么才是真正的礼物？',
    },
  },
  {
    id: 'honesty',
    name: '诚信的力量',
    icon: '⚖️',
    description: '探讨诚实与信任的价值，适合从小事讲起',
    defaults: {
      theme: '诚信的力量',
      subtitle: '诚实是立身之本，信任是人际之桥',
      core_truth: '诚信不是一种口号，而是每一次选择中，你选择说真话、做真事',
      pre_questions: ['你遇到过需要说真话但很难开口的时刻吗？'],
      post_question: '如果我们选择诚信，可能会付出什么代价？这个代价值得吗？',
    },
  },
  {
    id: 'perseverance',
    name: '逆境中的坚持',
    icon: '💪',
    description: '面对困难不放弃，坚持的力量',
    defaults: {
      theme: '逆境中的坚持',
      subtitle: '真正的坚持不是硬扛，而是心中有光',
      core_truth: '坚持不是因为看到了希望才坚持，而是因为坚持了才看到希望',
      pre_questions: ['你有过坚持做一件事最后成功的经历吗？'],
      post_question: '当坚持很难的时候，是什么让你继续下去的？',
    },
  },
  {
    id: 'gratitude',
    name: '感恩之心',
    icon: '🙏',
    description: '学会感恩，珍惜身边的一切',
    defaults: {
      theme: '感恩之心',
      subtitle: '滴水之恩，当涌泉相报',
      core_truth: '感恩是一种看见——看见别人对自己的好，并且珍惜',
      pre_questions: ['你能说出三个你最想感谢的人吗？'],
      post_question: '你有多久没有对帮助过你的人说一声「谢谢」了？',
    },
  },
  {
    id: 'dream',
    name: '梦想与追求',
    icon: '⭐',
    description: '引导学生树立目标，追逐梦想',
    defaults: {
      theme: '梦想与追求',
      subtitle: '心中有梦想，脚下有力量',
      core_truth: '梦想不是遥不可及的幻想，而是你愿意每天多做一点的事',
      pre_questions: ['你的梦想是什么？为什么？'],
      post_question: '为了梦想，你愿意做出什么样的努力？',
    },
  },
  {
    id: 'respect',
    name: '尊重与包容',
    icon: '🤝',
    description: '学会尊重差异，包容不同',
    defaults: {
      theme: '尊重与包容',
      subtitle: '君子和而不同',
      core_truth: '尊重不是只对和自己一样的人友善，而是对和自己不一样的人也能包容',
      pre_questions: ['你觉得班上有没有特别「不一样」的同学？'],
      post_question: '什么是真正的「尊重」？是礼貌地说「你好」，还是……？',
    },
  },
];

router.get('/', (req, res) => {
  res.json({ success: true, templates: TEMPLATES });
});

router.get('/:id', (req, res) => {
  const template = TEMPLATES.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: '模板不存在' });
  res.json({ success: true, template });
});

module.exports = router;
