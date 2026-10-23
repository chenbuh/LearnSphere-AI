import fs from 'node:fs';
import { cocaWords } from './coca_words.js';
import { middleSchoolWords } from './middle_school_words.js';
import { cet4Words } from './cet4_words.js';
import { cet6Words } from './cet6_words.js';
import { tem4Words } from './tem4_words.js';
import { tem8Words } from './tem8_words.js';
import { ieltsWords } from './ielts_words.js';
import { toeflWords } from './toefl_words.js';
import { greWords } from './gre_words.js';
import { postgraduateWords } from './postgraduate_words.js';

// These are operational corpus sizes, not claims that an exam has an official
// fixed list. The source note is written to every generated supplement entry.
const targets = [
  { name: 'middle_school', file: 'middle_school_words.js', exportName: 'middleSchoolWords', words: middleSchoolWords, target: 1600, examType: 'middle_school', difficulty: 2 },
  { name: 'cet4', file: 'cet4_words.js', exportName: 'cet4Words', words: cet4Words, target: 4500, examType: 'cet4', difficulty: 2 },
  { name: 'cet6', file: 'cet6_words.js', exportName: 'cet6Words', words: cet6Words, target: 6000, examType: 'cet6', difficulty: 3 },
  { name: 'tem4', file: 'tem4_words.js', exportName: 'tem4Words', words: tem4Words, target: 5000, examType: 'tem4', difficulty: 4 },
  { name: 'tem8', file: 'tem8_words.js', exportName: 'tem8Words', words: tem8Words, target: 8000, examType: 'tem8', difficulty: 5 },
  { name: 'ielts', file: 'ielts_words.js', exportName: 'ieltsWords', words: ieltsWords, target: 6000, examType: 'ielts', difficulty: 4 },
  { name: 'toefl', file: 'toefl_words.js', exportName: 'toeflWords', words: toeflWords, target: 8000, examType: 'toefl', difficulty: 5 },
  { name: 'gre', file: 'gre_words.js', exportName: 'greWords', words: greWords, target: 4000, examType: 'gre', difficulty: 6 },
  { name: 'postgraduate', file: 'postgraduate_words.js', exportName: 'postgraduateWords', words: postgraduateWords, target: 5500, examType: 'postgraduate', difficulty: 4 }
];

const normalize = value => String(value || '').trim().toLowerCase();
const validWord = value => /^[a-z]+(?:[-'][a-z]+)?$/i.test(String(value || '').trim());
const category = value => {
  const text = String(value || '').toLowerCase();
  if (text.includes('adv')) return 'adv';
  if (text.includes('adj') || text.startsWith('a.')) return 'adj';
  if (text.includes('verb') || text.startsWith('v')) return 'v';
  return 'n';
};

const corpus = cocaWords.filter(item => validWord(item.word) && item.translation);
for (const spec of targets) {
  const seen = new Set(spec.words.map(item => normalize(item.word)));
  const missing = Math.max(0, spec.target - seen.size);
  const additions = [];
  for (const item of corpus) {
    const key = normalize(item.word);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (spec.name === 'middle_school') {
      additions.push({
        word: item.word,
        phonetic: item.phonetic || '',
        partOfSpeech: item.partOfSpeech || '',
        translation: item.translation,
        level: 'middle_school',
        source: 'COCA frequency supplement (2026 working list)'
      });
    } else {
      additions.push({
        word: item.word,
        meaning: item.translation,
        phonetic: item.phonetic || '',
        difficulty: spec.difficulty,
        category: category(item.partOfSpeech),
        examType: spec.examType,
        source: 'COCA frequency supplement (2026 working list)'
      });
    }
    if (additions.length >= missing) break;
  }
  if (additions.length < missing) {
    throw new Error(`${spec.name}: corpus exhausted, need ${missing}, got ${additions.length}`);
  }
  const updated = [...spec.words, ...additions];
  const path = new URL(`./${spec.file}`, import.meta.url);
  let text = fs.readFileSync(path, 'utf8');
  const marker = `export const ${spec.exportName} = [`;
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`missing export marker in ${spec.file}`);
  const end = text.lastIndexOf('];');
  if (end < start) throw new Error(`missing array terminator in ${spec.file}`);
  const header = text.slice(0, start);
  const body = JSON.stringify(updated, null, 4);
  fs.writeFileSync(path, `${header}${marker}\n${body.slice(1, -1)}\n];\n`);
  console.log(JSON.stringify({ stage: spec.name, before: spec.words.length, uniqueBefore: spec.words.length - (spec.words.length - seen.size + additions.length), added: additions.length, after: updated.length, uniqueAfter: seen.size }));
}
