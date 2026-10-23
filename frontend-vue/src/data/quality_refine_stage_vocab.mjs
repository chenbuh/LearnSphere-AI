import fs from 'node:fs';

// Replace only generated COCA supplements. The original/base entries stay byte-for-byte
// semantically intact; stage ranges keep common words out of advanced exam lists.
const specs = [
  { stage: 'middle_school', file: 'middle_school_words.js', exportName: 'middleSchoolWords', low: 100, high: 3500, difficulty: 2 },
  { stage: 'cet4', file: 'cet4_words.js', exportName: 'cet4Words', low: 300, high: 5000, difficulty: 2 },
  { stage: 'cet6', file: 'cet6_words.js', exportName: 'cet6Words', low: 700, high: 7000, difficulty: 3 },
  { stage: 'tem4', file: 'tem4_words.js', exportName: 'tem4Words', low: 1000, high: 9000, difficulty: 4 },
  { stage: 'tem8', file: 'tem8_words.js', exportName: 'tem8Words', low: 2500, high: 13000, difficulty: 5 },
  { stage: 'ielts', file: 'ielts_words.js', exportName: 'ieltsWords', low: 1500, high: 11000, difficulty: 4 },
  { stage: 'toefl', file: 'toefl_words.js', exportName: 'toeflWords', low: 2500, high: 14000, difficulty: 5 },
  { stage: 'gre', file: 'gre_words.js', exportName: 'greWords', low: 4500, high: 17000, difficulty: 6 },
  { stage: 'postgraduate', file: 'postgraduate_words.js', exportName: 'postgraduateWords', low: 1500, high: 10500, difficulty: 4 }
];

const stopWords = new Set(`a an the be been being am is are was were do does did have has had
can could may might must shall should will would i me my mine myself we us our ours
you your yours he him his she her hers it its they them their theirs this that these those
and or but if then than so because as of to in on at by for from with about into over under
after before between through during up down out off not no nor only very more most less least
too also just still already now here there who whom whose which what when where why how yes
all any each every either neither both few many much some such other another same own enough
again once yeah hey uh ah oh okay ok lots guy`.split(/\s+/));

const parseArray = (text, exportName) => {
  const marker = `export const ${exportName} = [`;
  const start = text.indexOf(marker);
  const end = text.lastIndexOf('];');
  if (start < 0 || end < start) throw new Error(`missing ${exportName} array`);
  return { marker, start, end, words: JSON.parse(text.slice(start + marker.length - 1, end + 1)) };
};

const cocaText = fs.readFileSync(new URL('./coca_words.js', import.meta.url), 'utf8');
const coca = parseArray(cocaText, 'cocaWords').words;
const isContentEntry = item => {
  const word = String(item.word || '').trim();
  const pos = String(item.partOfSpeech || '').toLowerCase();
  return /^[a-z]+(?:[-'][a-z]+)?$/i.test(word)
    && word.length >= 3
    && !stopWords.has(word.toLowerCase())
    && Boolean(item.translation)
    && /(?:^|[.\s])(?:n|v|vt|vi|adj|adv|a|num)(?:\.|\s|$)/.test(pos);
};
const category = value => {
  const text = String(value || '').toLowerCase();
  if (text.includes('adv')) return 'adv';
  if (text.includes('adj') || text.startsWith('a.')) return 'adj';
  if (text.includes('verb') || text.startsWith('v')) return 'v';
  return 'n';
};

for (const spec of specs) {
  const path = new URL(`./${spec.file}`, import.meta.url);
  const text = fs.readFileSync(path, 'utf8');
  const parsed = parseArray(text, spec.exportName);
  const base = parsed.words.filter(item => !String(item.source || '').startsWith('COCA frequency supplement'));
  const previousSupplement = parsed.words.length - base.length;
  const seen = new Set(base.map(item => String(item.word).toLowerCase()));
  const additions = [];
  for (const item of coca.slice(spec.low, spec.high)) {
    const key = String(item.word).toLowerCase();
    if (!isContentEntry(item) || seen.has(key)) continue;
    seen.add(key);
    if (spec.stage === 'middle_school') {
      additions.push({
        word: item.word,
        phonetic: item.phonetic || '',
        partOfSpeech: item.partOfSpeech || '',
        translation: item.translation,
        level: spec.stage,
        source: 'COCA frequency supplement (2026 working list; content-filtered)'
      });
    } else {
      additions.push({
        word: item.word,
        meaning: item.translation,
        phonetic: item.phonetic || '',
        difficulty: spec.difficulty,
        category: category(item.partOfSpeech),
        examType: spec.stage,
        source: 'COCA frequency supplement (2026 working list; content-filtered)'
      });
    }
    if (additions.length >= previousSupplement) break;
  }
  if (additions.length !== previousSupplement) {
    throw new Error(`${spec.stage}: needed ${previousSupplement} replacements, found ${additions.length}`);
  }
  const updated = [...base, ...additions];
  let output = text.slice(0, parsed.start) + parsed.marker + '\n' + JSON.stringify(updated, null, 4).slice(1, -1) + '\n];\n';
  output = output.replace(/总词汇量: \d+ 个/, `总词汇量: ${updated.length} 个`);
  fs.writeFileSync(path, output);
  console.log(JSON.stringify({ stage: spec.stage, preserved: base.length, replaced: additions.length, total: updated.length, first: additions[0]?.word, last: additions.at(-1)?.word }));
}
