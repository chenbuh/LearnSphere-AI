#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const FIXED_EXAMPLE_TRANSLATIONS = [
  { example: "Access is restricted.", cn: "访问受限。" },
  { example: "Hit the brakes!", cn: "快踩刹车！" },
  { example: "Park your bicycle.", cn: "把自行车停好。" },
  { example: "And afterward?", cn: "然后呢？" },
  { example: "a biting remark", cn: "尖刻的话。" },
  { example: "military hardware", cn: "军事装备。" },
  { example: "April fools!", cn: "愚人节快乐！" },
  { example: "naval architect", cn: "造船工程师。" },
  { example: "the equatorial regions", cn: "赤道地区。" },
  { example: "comparative anatomy", cn: "比较解剖学。" },
  { example: "no contest", cn: "毫无悬念。" },
  { example: "Scientific inquiry", cn: "科学探究。" },
  { example: "Undoubtedly.", cn: "毫无疑问。" },
  { example: "the double blank", cn: "双空题。" },
  { example: "I'm injured.", cn: "我受伤了。" },
  { example: "Use proper language.", cn: "使用恰当的语言。" },
  { example: "wide boy", cn: "骗子。" },
  { example: "Working Man", cn: "劳动者。" },
  { example: "Is that Japanese?", cn: "那是日语吗？" },
  { example: "the queer community", cn: "酷儿群体。" },
  { example: "tropical fruit", cn: "热带水果。" },
  { example: "outstanding contracts", cn: "未履行合同。" },
  { example: "a vigorous shrub", cn: "一株长势旺盛的灌木。" },
  { example: "Hi everyone!", cn: "大家好！" },
  { example: "classical dance.", cn: "古典舞。" },
  { example: "She was promoted.", cn: "她升职了。" },
  { example: "a sacred day", cn: "神圣的一天。" },
  { example: "It tastes good.", cn: "味道很好。" },
  { example: "accurate knowledge", cn: "准确的认识。" },
  { example: "Write a sentence.", cn: "写一个句子。" },
  { example: "Press the button.", cn: "按下按钮。" },
  { example: "Do it yourself.", cn: "自己动手做。" },
  { example: "arithmetic geometry", cn: "算术几何。" },
  { example: "individual agency", cn: "个体能动性。" },
  { example: "an adequate definition", cn: "恰当的定义。" },
  { example: "geography bee", cn: "地理知识竞赛。" },
  { example: "a duck blind", cn: "猎鸭掩体。" },
  { example: "Plant the seed.", cn: "把种子种下。" },
  { example: "space travel", cn: "太空旅行。" },
  { example: "aircraft carrier", cn: "航空母舰。" },
  { example: "a hopeless cause", cn: "无望的事业。" },
  { example: "cheese and biscuits", cn: "奶酪和饼干。" },
  { example: "book launch", cn: "新书发布会。" },
  { example: "appetite for reading", cn: "阅读兴趣。" },
  { example: "a bare majority", cn: "勉强过半数。" },
  { example: "to spur boots", cn: "带马刺的靴子。" },
  { example: "sovereign nation", cn: "主权国家。" },
  { example: "a shrewd guess", cn: "精明的猜测。" },
  { example: "a right line", cn: "直线。" },
  { example: "gold leaf", cn: "金箔。" },
  { example: "a naval expedition", cn: "一次海军远征。" },
  { example: "Nile Delta", cn: "尼罗河三角洲。" },
  { example: "Stiff upper lip!", cn: "挺住，别露怯！" },
  { example: "a literary history", cn: "文学史。" },
  { example: "Call security.", cn: "叫保安。" },
  { example: "the western approaches", cn: "西部通道。" },
  { example: "bookshop", cn: "书店。" },
  { example: "Be punctual.", cn: "要准时。" },
  { example: "edible fruit", cn: "可食用的水果。" },
  { example: "An electromagnetic phenomenon.", cn: "一种电磁现象。" },
  { example: "imitation leather", cn: "人造皮革。" },
  { example: "an insane asylum", cn: "精神病院。" },
  { example: "a nuclear reactor", cn: "核反应堆。" },
  { example: "heat radiation", cn: "热辐射。" },
  { example: "What happened yesterday?", cn: "昨天发生了什么？" },
  { example: "bodily organs", cn: "身体器官。" },
  { example: "an economic stimulus", cn: "一项经济刺激措施。" },
  { example: "a transient pleasure", cn: "短暂的快乐。" },
  { example: "a lofty goal", cn: "崇高的目标。" },
  { example: "a rapid stream", cn: "湍急的溪流。" },
  { example: "a mild man", cn: "性情温和的人。" },
  { example: "I visited Tom.", cn: "我去看望了汤姆。" },
  { example: "Department of Defence", cn: "国防部。" },
  { example: "a follow shot", cn: "补射。" },
  { example: "an anonymous pamphlet", cn: "一本匿名小册子。" },
  { example: "Simplify.", cn: "简化一下。" },
  { example: "a peach stone", cn: "桃核。" },
  { example: "an explosive device", cn: "爆炸装置。" },
  { example: "antenna farm", cn: "天线阵列。" },
  { example: "extremes of temperature", cn: "极端温度。" },
  { example: "earnest prayers", cn: "虔诚的祈祷。" },
  { example: "Our eyes met.", cn: "我们四目相对。" },
  { example: "Onwards and upwards.", cn: "继续前进，蒸蒸日上。" },
  { example: "a stony path", cn: "石子路。" },
  { example: "Crush the enemy!", cn: "击溃敌人！" },
  { example: "German text", cn: "德文文本。" },
  { example: "an apt metaphor", cn: "一个贴切的比喻。" },
  { example: "city desk", cn: "城市新闻编辑部。" },
  { example: "mustard flour", cn: "芥末粉。" },
  { example: "a vacant stare", cn: "茫然的眼神。" },
  { example: "A historic opportunity", cn: "历史性机遇。" },
  { example: "Tsunami hit Japan.", cn: "日本遭遇了海啸。" },
  { example: "cubic foot", cn: "立方英尺。" },
  { example: "a fond farewell", cn: "深情的告别。" },
  { example: "The plane crashed.", cn: "飞机坠毁了。" },
  { example: "genetic drift", cn: "遗传漂变。" },
  { example: "solar flare", cn: "太阳耀斑。" },
  { example: "Stop thief!", cn: "抓贼啊！" },
  { example: "an elegant solution", cn: "一个优雅的解决方案。" },
  { example: "heroic deeds", cn: "英勇事迹。" },
  { example: "muffin tin", cn: "松饼烤盘。" },
  { example: "Unfortunately, it rained.", cn: "可惜下雨了。" },
  { example: "An agricultural tool", cn: "一种农业工具。" },
  { example: "The house is for sale.", cn: "这套房子正在出售。" },
  { example: "I didn't think he'd stoop to cheating.", cn: "我没想到他会沦落到作弊这一步。" },
  { example: "The musician bowed his violin expertly.", cn: "那位音乐家熟练地拉起了小提琴。" },
  { example: "coarse language", cn: "粗俗的语言。" },
  { example: "Let's rest under yonder tree.", cn: "咱们在那边那棵树下歇一会儿吧。" },
  { example: "Let's meet on neutral territory.", cn: "我们在中立地带见面吧。" },
  { example: "I'm sure we'll manage without.", cn: "我相信就算没有它我们也能应付。" },
  { example: "Come on Doreen, let's dance.", cn: "来吧，多琳，我们跳舞去。" },
  { example: "Let's move the meeting to Wednesday.", cn: "我们把会议改到星期三吧。" },
  { example: "Union gives strength.", cn: "团结就是力量。" },
  { example: "Let's go out on Saturday night.", cn: "我们周六晚上出去玩吧。" },
  { example: "the indefinite article", cn: "不定冠词。" },
  { example: "The team reviewed the agenda before starting the meeting.", cn: "团队在开会前审阅了议程。" },
  { example: "Let's add that topic to the agenda for tomorrow's meeting.", cn: "我们把那个话题加入明天会议的议程吧。" },
  { example: "Let's get busy with the clearing up.", cn: "我们赶紧动手收拾吧。" },
  { example: "So let's debunk some of the most common falsehoods.", cn: "那么，我们来揭穿一些最常见的谬误。" },
  { example: "How the word made the leap from \"someone who makes you want to cuddle\" to \"someone who makes you cringe\" isn't really known but there are a few enticing clues.", cn: "这个词如何从“让你想拥抱的人”演变为“让你感到尴尬的人”，确切原因并不清楚，但有几条颇有意思的线索。" },
  { example: "To take just one example that comes immediately to mind, if your family coverage is through a local HMO, what happens when your  son graduates from college and moves halfway across the country, thousands of miles away from your in-network doctors and hospitals?", cn: "举一个立刻想到的例子：如果你家的医保是本地 HMO，当你儿子大学毕业后搬到全国另一端、远离网络内医生和医院时，会发生什么？" },
  { example: "We need to go to the grocery store.", cn: "我们得去杂货店。" },
  { example: "This is a masterpiece.", cn: "这是一件杰作。" },
  { example: "Put it in your pocket.", cn: "把它放进口袋里。" },
  { example: "Send me an email.", cn: "给我发封邮件。" },
  { example: "She fell asleep again.", cn: "她又睡着了。" },
  { example: "The punishment was too harsh.", cn: "这个惩罚太严厉了。" },
  { example: "Put the letter in an envelope.", cn: "把信装进信封里。" },
  { example: "The frog jumped into the pond.", cn: "青蛙跳进了池塘。" },
  { example: "Let us move forward.", cn: "让我们继续前进。" },
  { example: "She expressed her gratitude.", cn: "她表达了感激之情。" },
  { example: "The rain descended, and the floods came.", cn: "雨下起来了，洪水也来了。" },
  { example: "She is in the third grade.", cn: "她上三年级。" },
  { example: "The wind is strong.", cn: "风很大。" },
  { example: "Smoking is a health hazard.", cn: "吸烟危害健康。" },
  { example: "The word 'apple' has a simple meaning, but it can carry deep cultural significance.", cn: "“apple”这个词意思很简单，但它也可能承载着深厚的文化意义。" },
  { example: "The service is excellent.", cn: "服务非常好。" },
  { example: "The project is complete.", cn: "项目已经完成。" },
  { example: "We will meet again next week.", cn: "我们下周再见。" },
  { example: "Wild animals are dangerous.", cn: "野生动物很危险。" },
  { example: "Look at the screen.", cn: "看屏幕。" },
  { example: "Smokeless gunpowder is hard to ignite, and it burns very hot and very quickly once you get it going.", cn: "无烟火药很难点燃，但一旦点着就会高温快速燃烧。" },
  { example: "I am in trouble.", cn: "我有麻烦了。" },
  { example: "She walked into the house.", cn: "她走进了房子。" },
  { example: "You can't have any more - you'll have to content yourself with what you already have.", cn: "你不能再要了，你只能满足于你已经拥有的。" },
  { example: "He is very rich.", cn: "他非常富有。" },
  { example: "I have a math exam tomorrow.", cn: "我明天有一场数学考试。" },
  { example: "She wore a pink dress.", cn: "她穿了一条粉色连衣裙。" },
  { example: "She lives in New York.", cn: "她住在纽约。" },
  { example: "The pacific nature of the island made it a peaceful place to live.", cn: "这个岛屿平和的特性使它成为一个宜居之地。" },
  { example: "a difficult affair to manage", cn: "一件难以处理的事情。" },
  { example: "The game is over.", cn: "比赛结束了。" },
  { example: "Two plus two equals four.", cn: "二加二等于四。" },
  { example: "I see a pattern here.", cn: "我在这里看出了一个规律。" },
  { example: "We need more storage space.", cn: "我们需要更多存储空间。" },
  { example: "What is the reason?", cn: "原因是什么？" },
  { example: "I think you misunderstood what I said.", cn: "我想你误解了我的意思。" },
  { example: "She went to the store to buy some groceries.", cn: "她去商店买些杂货。" },
  { example: "Paris is the capital of France.", cn: "巴黎是法国的首都。" },
  { example: "Time will heal the wound.", cn: "时间会治愈伤口。" },
  { example: "What type of music do you like?", cn: "你喜欢什么类型的音乐？" },
  { example: "The motivational speaker not only instructed but also entertained the audience.", cn: "那位励志演讲者不仅进行了指导，也娱乐了观众。" },
  { example: "Christmas is in December.", cn: "圣诞节在十二月。" },
  { example: "The traffic was moving very slow on the highway this morning.", cn: "今天早上高速公路上的车流很慢。" },
  { example: "The sudden drop in temperature left everyone cold and confused.", cn: "气温骤降让每个人都感到寒冷又困惑。" },
  { example: "So let's see. There are two evens here and three odds.", cn: "我们来看，这里有两个偶数和三个奇数。" },
  { example: "Travel expenses will be reimbursed.", cn: "差旅费用将予以报销。" },
  { example: "What does this term mean?", cn: "这个术语是什么意思？" },
  { example: "She gave a vivid description of the accident.", cn: "她对这次事故作了生动的描述。" },
  { example: "Seek and you shall find.", cn: "寻找就会找到。" },
  { example: "Neither candidate won outright.", cn: "两位候选人都未能直接胜出。" },
  { example: "the League of Nations", cn: "国际联盟。" },
  { example: "Beautiful is an adjective.", cn: "“Beautiful”是一个形容词。" },
  { example: "a public nuisance", cn: "公害。" },
  { example: "These organisms reproduce parthenogenetically.", cn: "这些生物通过孤雌生殖繁殖。" },
  { example: "Annual boarding fees are $10,350.", cn: "每年的住校费是10,350美元。" },
  { example: "Her heart raced uncontrollably.", cn: "她的心脏不受控制地狂跳起来。" },
  { example: "Follow the procedure.", cn: "按流程操作。" },
  { example: "Was that a yes?", cn: "你这是答应了吗？" },
  { example: "It was a joke!", cn: "那只是个玩笑！" },
  { example: "the wheel of life", cn: "生命之轮。" },
  { example: "They're eating sandwiches.", cn: "他们正在吃三明治。" },
  { example: "to toe the mark", cn: "循规蹈矩。" },
  { example: "Finders keepers; losers weepers].", cn: "捡到归己，丢者自认倒霉。" },
  { example: "Happy 4th of July!", cn: "独立日快乐！" },
  { example: "the Russian empire", cn: "俄罗斯帝国。" },
  { example: "The wound is healing.", cn: "伤口正在愈合。" },
  { example: "Please fasten your seatbelt.", cn: "请系好安全带。" },
  { example: "The aeroplane landed safely.", cn: "飞机安全着陆了。" },
  { example: "It was ever thus.", cn: "向来如此。" },
  { example: "We made good progress.", cn: "我们取得了很大进展。" },
  { example: "Remember to call me.", cn: "记得给我打电话。" },
  { example: "Do not rush.", cn: "别着急。" },
  { example: "The plan is feasible.", cn: "这个计划可行。" },
  { example: "You look pale.", cn: "你看起来脸色苍白。" },
  { example: "I appreciate your efforts", cn: "我很感谢你的努力。" },
  { example: "intense study; intense thought", cn: "深入研究；深思熟虑。" },
  { example: "intense study;\u00a0 intense thought", cn: "深入研究；深思熟虑。" },
  { example: "moral absolutes", cn: "道德绝对原则。" },
  { example: "Boil the water.", cn: "把水烧开。" },
  { example: "What is your role?", cn: "你的角色是什么？" },
  { example: "Honey, I'm home.", cn: "亲爱的，我回来了。" },
  { example: "There are no restrictions.", cn: "没有任何限制。" },
  { example: "Pardon?", cn: "你说什么？" },
  { example: "Hello, how are you?", cn: "你好，你最近怎么样？" },
  { example: "I'll remind you.", cn: "我会提醒你。" },
  { example: "the march of time", cn: "时光流逝。" },
  { example: "I opened the lid.", cn: "我打开了盖子。" },
  { example: "in the same vein", cn: "同理。" },
  { example: "Children learn through play.", cn: "孩子们在游戏中学习。" },
  { example: "Corporate speak; IT speak.", cn: "企业行话；IT行话。" },
  { example: "Can Tebboune rebuild Algeria?", cn: "特本能重建阿尔及利亚吗？" },
  { example: "a magic moment", cn: "神奇的一刻。" },
  { example: "Call the police!", cn: "报警！" },
  { example: "a memorial building", cn: "纪念性建筑。" },
  { example: "Communicate.", cn: "沟通。" },
  { example: "White House press corps", cn: "白宫记者团。" },
  { example: "a sense of security", cn: "安全感。" },
  { example: "I speak Chinese.", cn: "我会说中文。" },
  { example: "cosmic speed", cn: "宇宙速度。" },
  { example: "Sleep on the couch.", cn: "在沙发上睡。" },
  { example: "Ignorance is bliss.", cn: "无知即幸福。" },
  { example: "He was imprisoned.", cn: "他被监禁了。" },
  { example: "creatures of the deep", cn: "深海生物。" },
  { example: "He married an actress.", cn: "他娶了一位女演员。" },
  { example: "I was truly astonished.", cn: "我真的很震惊。" },
  { example: "the heat of summer", cn: "盛夏的炎热。" },
  { example: "He aggravated the story.", cn: "他把事情说得更严重了。" },
  { example: "a flood of complaints", cn: "大量投诉。" },
  { example: "a herd of cattle", cn: "一群牛。" },
  { example: "A small group.", cn: "一个小群体。" },
  { example: "For real?", cn: "真的？" },
  { example: "This is our house.", cn: "这是我们的房子。" },
  { example: "The sun is shining.", cn: "阳光正好。" },
  { example: "Install the software.", cn: "安装这个软件。" },
  { example: "Whatever you say.", cn: "随你怎么说。" },
  { example: "It is worth it.", cn: "这值得。" },
  { example: "Keep up the pace.", cn: "保持节奏。" },
  { example: "The castle was huge.", cn: "那座城堡很大。" },
  { example: "Ants appeared.", cn: "蚂蚁出现了。" },
  { example: "agreeable manners", cn: "讨人喜欢的举止。" },
  { example: "Phillips ordered a cognac.", cn: "菲利普斯点了一杯干邑白兰地。" },
  { example: "Is infidelity ever forgivable?", cn: "不忠真的能被原谅吗？" },
  { example: "Price: $0.99, Lite version available", cn: "价格：0.99美元，提供精简版。" },
  { example: "We have 2 000 members worldwide.", cn: "我们在全球有2000名成员。" },
  { example: "He convinced me he was right.", cn: "他让我相信他是对的。" }
];

function uniqueByExample(items) {
  const map = new Map();
  for (const item of items) {
    const key = String(item?.example || "").trim();
    const cn = String(item?.cn || "").trim();
    if (!key || !cn) continue;
    map.set(key, { example: key, cn });
  }
  return Array.from(map.values());
}

async function main() {
  const updates = uniqueByExample(FIXED_EXAMPLE_TRANSLATIONS);
  const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 4,
  });

  let affectedRows = 0;
  let touchedExamples = 0;
  for (const item of updates) {
    const [res] = await pool.query(
      "UPDATE vocabulary SET example_translation=?, update_time=NOW() WHERE deleted=0 AND example=?",
      [item.cn, item.example]
    );
    const n = Number(res?.affectedRows || 0);
    affectedRows += n;
    if (n > 0) touchedExamples += 1;
  }

  const examples = updates.map((u) => u.example);
  const placeholders = examples.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT example, example_translation AS exampleTranslation, COUNT(*) AS c
     FROM vocabulary
     WHERE deleted=0 AND example IN (${placeholders})
     GROUP BY example, example_translation
     ORDER BY c DESC, example ASC`,
    examples
  );

  console.log("=== Polish Example Translation (No Qwen) ===");
  console.log(`planned_examples=${updates.length}`);
  console.log(`touched_examples=${touchedExamples}`);
  console.log(`affected_rows=${affectedRows}`);
  console.log("sample_after=");
  for (const r of rows.slice(0, 30)) {
    console.log(JSON.stringify(r));
  }

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});
