const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber,
} = require('docx');

const C = {
  primary: '1a1a2e', accent: 'c0392b', accent2: 'e94560', gold: 'd4a017',
  lightBg: 'f8f4f0', lightBg2: 'f0ebe3', body: '2d3436', muted: '636e72',
  lightGray: 'dfe6e9', white: 'ffffff', green: '27ae60', blue: '2980b9', purple: '6c5ce7',
};

function getLayerColor(n) {
  const colors = { 1: C.blue, 2: C.green, 3: C.purple, 4: C.accent2 };
  return colors[n] || C.primary;
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.accent2, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 26, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 22, font: { eastAsia: 'Microsoft YaHei' }, color: C.accent })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 336 },
    indent: opts.noIndent ? undefined : { firstLine: 420 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 21, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body, ...opts })],
  });
}

function infoTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: C.primary },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: C.primary },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: C.lightGray },
    },
    rows: rows.map(([label, value], i) => new TableRow({
      cantSplit: true, tableHeader: i === 0,
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 200, right: 200 },
          shading: { type: ShadingType.CLEAR, fill: C.lightBg },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 21, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary })] })],
        }),
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 200, right: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 21, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body })] })],
        }),
      ],
    })),
  });
}

function layerBox(layerNum, layerName, badge, point, desc, example) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: C.lightGray },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: C.lightGray },
      left: { style: BorderStyle.SINGLE, size: 8, color: getLayerColor(layerNum) },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: C.lightGray },
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        margins: { top: 120, bottom: 120, left: 240, right: 240 },
        shading: { type: ShadingType.CLEAR, fill: C.lightBg },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: `  ${badge}`, bold: true, size: 20, font: { eastAsia: 'Microsoft YaHei' }, color: getLayerColor(layerNum) }),
              new TextRun({ text: `  ${layerName}`, bold: true, size: 22, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: '\u25B6 ', bold: true, size: 21, color: getLayerColor(layerNum) }),
              new TextRun({ text: point, bold: true, size: 21, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40, line: 336 },
            children: [new TextRun({ text: desc, size: 21, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body })],
          }),
          example ? new Paragraph({
            spacing: { before: 80, after: 40, line: 312 }, indent: { left: 240 },
            children: [
              new TextRun({ text: '\uD83D\uDCCC \u4E3E\u4F8B\uFF1A', bold: true, size: 20, font: { eastAsia: 'Microsoft YaHei' }, color: C.blue }),
              new TextRun({ text: example, size: 20, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body }),
            ],
          }) : null,
        ].filter(Boolean),
      })],
    })],
  });
}

function questionItem(qNum, qType, text) {
  return new Paragraph({
    spacing: { before: 80, after: 40, line: 312 }, indent: { left: 240 },
    children: [
      new TextRun({ text: ` ${qNum} `, bold: true, size: 18, font: { eastAsia: 'Microsoft YaHei' }, color: C.white, shading: { type: ShadingType.CLEAR, fill: C.accent2 } }),
      new TextRun({ text: ` ${qType} `, bold: true, size: 18, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary }),
      new TextRun({ text: `  ${text}`, size: 21, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body }),
    ],
  });
}

function goldenBox(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: C.gold }, bottom: { style: BorderStyle.SINGLE, size: 2, color: C.gold }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        margins: { top: 200, bottom: 200, left: 400, right: 400 },
        shading: { type: ShadingType.CLEAR, fill: 'fff8e7' },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: '\u201C', bold: true, size: 48, font: { eastAsia: 'SimSun' }, color: C.gold }),
            new TextRun({ text, bold: true, size: 26, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary }),
            new TextRun({ text: '\u201D', bold: true, size: 48, font: { eastAsia: 'SimSun' }, color: C.gold }),
          ],
        })],
      })],
    })],
  });
}

function scriptTimeTag(min, sec) {
  const time = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: ` [${time}] `, bold: true, size: 18, font: { ascii: 'Consolas' }, color: C.white, shading: { type: ShadingType.CLEAR, fill: C.primary } })],
  });
}

function scriptPara(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 336 }, indent: { firstLine: 420 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 21, font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, color: C.body })],
  });
}

function generateDocxContent(lesson) {
  const children = [];

  // Cover
  children.push(new Paragraph({ spacing: { before: 0, after: 2000 }, children: [] }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: '\u5FC3\u6027\u6559\u80B2', bold: true, size: 52, font: { eastAsia: 'Microsoft YaHei' }, color: C.accent2 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: '\u8BFE\u7A0B\u8BB2\u4E49', bold: true, size: 44, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary })],
  }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.accent2, space: 1 } }, children: [new TextRun({ text: '  ', size: 1 })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: lesson.theme || '', bold: true, size: 40, font: { eastAsia: 'Microsoft YaHei' }, color: C.gold })], }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: '\u2014\u2014 ' + (lesson.subtitle || ''), bold: true, size: 28, font: { eastAsia: 'Microsoft YaHei' }, color: C.primary })], }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1000, after: 80 }, children: [new TextRun({ text: `\u9002\u7528\u5E74\u7EA7\uFF1A${lesson.grade || '\u4E94\u81F3\u4E5D\u5E74\u7EA7'}  |  \u65F6\u957F\uFF1A${lesson.duration || '\u7EA660\u5206\u949F'}`, size: 22, font: { eastAsia: 'Microsoft YaHei' }, color: C.muted })], }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.accent2, space: 8 } }, spacing: { before: 400, after: 100 }, children: [new TextRun({ text: '\u5FC3\u6027\u4FEE\u517B  \u00B7  \u77E5\u884C\u5408\u4E00', size: 20, font: { eastAsia: 'Microsoft YaHei' }, color: C.muted })], }));

  // Content starts on new page
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));

  // 1. Overview
  children.push(h1('\u4E00\u3001\u8BFE\u7A0B\u6982\u89C8'));
  children.push(infoTable([
    ['\u8BFE\u7A0B\u4E3B\u9898', lesson.theme || '-'],
    ['\u6838\u5FC3\u9053\u7406', lesson.core_truth || '-'],
    ['\u5F15\u5165\u89C6\u9891', lesson.video_title || '-'],
    ['\u9002\u7528\u5E74\u7EA7', lesson.grade || '\u4E94\u81F3\u4E5D\u5E74\u7EA7'],
    ['\u65F6\u957F', lesson.duration || '\u7EA6 60 \u5206\u949F'],
  ]));

  // 2. Video
  children.push(h1('\u4E8C\u3001\u5F15\u5165\u89C6\u9891'));
  children.push(h3('\u89C6\u9891\u4FE1\u606F'));
  children.push(para(`\u89C6\u9891\u540D\u79F0\uFF1A${lesson.video_title || '-'}`));
  children.push(para(`\u94FE\u63A5\uFF1A${lesson.video_url || '-'}`));
  children.push(para(`\u65F6\u957F\uFF1A${lesson.video_duration || '-'}`));
  children.push(para(`\u5185\u5BB9\uFF1A${lesson.video_desc || '-'}`, { noIndent: true }));

  if (lesson.pre_questions && lesson.pre_questions.length) {
    children.push(h3('\u89C2\u770B\u524D\u5F15\u5BFC\u95EE\u9898'));
    lesson.pre_questions.forEach(q => {
      children.push(new Paragraph({ spacing: { before: 60, after: 60, line: 312 }, indent: { left: 720, hanging: 360 }, children: [new TextRun({ text: `\u2022 ${q}`, size: 21, font: { eastAsia: 'Microsoft YaHei' }, color: C.body })] }));
    });
  }

  // 3. Core layers
  children.push(h1('\u4E09\u3001\u6838\u5FC3\u8BB2\u89E3\uFF08\u9012\u8FDB\u56DB\u5C42\uFF09'));
  for (let i = 1; i <= 4; i++) {
    const layer = lesson.layers?.[i - 1];
    if (layer) {
      children.push(layerBox(i, layer.name, layer.badge, layer.point, layer.desc, layer.example));
    }
  }

  // 4. Questions
  children.push(h1('\u56DB\u3001\u5F15\u5BFC\u63D0\u95EE\uFF08\u9012\u8FDB\u4E03\u95EE\uFF09'));
  if (lesson.questions) {
    lesson.questions.forEach((q, i) => {
      children.push(questionItem(`Q${i + 1}`, q.type, q.text));
    });
  }

  // 5. Summary
  children.push(h1('\u4E94\u3001\u603B\u7ED3\u5347\u534E'));
  children.push(goldenBox(lesson.golden_sentence || ''));
  children.push(h3('\u8BFE\u540E\u5B9E\u8DF5'));
  if (lesson.actions) {
    lesson.actions.forEach(a => {
      children.push(new Paragraph({ spacing: { before: 60, after: 60, line: 312 }, indent: { left: 720, hanging: 360 }, children: [new TextRun({ text: `\u2022 ${a}`, size: 21, font: { eastAsia: 'Microsoft YaHei' }, color: C.body })] }));
    });
  }

  // 6. Script
  children.push(h1('\u516D\u3001\u9010\u5B57\u8BB2\u7A3F'));
  if (lesson.script_sections) {
    lesson.script_sections.forEach(section => {
      children.push(scriptTimeTag(section.min || 0, section.sec || 0));
      children.push(scriptPara(section.content || ''));
    });
  }

  return children;
}

async function generateDocx(lesson, outputPath) {
  const children = generateDocxContent(lesson);

  const doc = new Document({
    styles: { default: { document: { run: { font: { ascii: 'Calibri', eastAsia: 'Microsoft YaHei' }, size: 21, color: C.body }, paragraph: { spacing: { line: 312 } } } } },
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1417, bottom: 1417, left: 1701, right: 1417 } },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '\u5FC3\u6027\u6559\u80B2 \u00B7 \u8BFE\u7A0B\u8BB2\u4E49', size: 16, font: { eastAsia: 'Microsoft YaHei' }, color: C.muted, italics: true })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u2014 ', size: 16, color: C.muted }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.muted }), new TextRun({ text: ' \u2014', size: 16, color: C.muted })] })] }) },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = { generateDocx };
