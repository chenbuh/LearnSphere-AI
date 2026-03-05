import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 完整的小学词汇数据库 (441个)
const primaryVocab = {
    "a": "一个", "an": "一个", "about": "关于", "afraid": "害怕的", "after": "在...之后",
    "afternoon": "下午", "again": "再,又", "all": "所有的", "also": "也", "always": "总是",
    "am": "是", "and": "和", "angry": "生气的", "animal": "动物", "answer": "答案",
    "any": "任何", "apple": "苹果", "are": "是", "arm": "手臂", "art": "艺术",
    "ask": "问", "at": "在", "aunt": "阿姨", "autumn": "秋天", "baby": "婴儿",
    "back": "后面", "bad": "坏的", "bag": "书包", "ball": "球", "banana": "香蕉",
    "basketball": "篮球", "be": "是", "bear": "熊", "beautiful": "美丽的", "bed": "床",
    "before": "在...之前", "begin": "开始", "behind": "在...后面", "beside": "在...旁边", "between": "在...之间",
    "big": "大的", "bike": "自行车", "bicycle": "自行车", "bird": "鸟", "birthday": "生日",
    "black": "黑色", "blackboard": "黑板", "blue": "蓝色", "boat": "船", "body": "身体",
    "book": "书", "box": "盒子", "boy": "男孩", "bread": "面包", "breakfast": "早餐",
    "bring": "带来", "brother": "兄弟", "brown": "棕色", "bus": "公共汽车", "busy": "忙的",
    "but": "但是", "buy": "买", "by": "在...旁边", "cake": "蛋糕", "call": "叫,打电话",
    "can": "能", "candy": "糖果", "cap": "帽子", "car": "汽车", "card": "卡片",
    "cat": "猫", "chair": "椅子", "chicken": "鸡", "child": "孩子", "children": "孩子们",
    "china": "中国", "chinese": "中文,中国人", "cinema": "电影院", "city": "城市", "class": "班级",
    "clean": "打扫", "clever": "聪明的", "clock": "时钟", "close": "关闭", "clothes": "衣服",
    "cloudy": "多云的", "coat": "外套", "cold": "冷的", "colour": "颜色", "color": "颜色",
    "come": "来", "computer": "电脑", "cook": "做饭", "cool": "凉爽的", "cousin": "堂(表)兄弟姐妹",
    "cow": "奶牛", "crayon": "蜡笔", "cry": "哭", "dad": "爸爸", "dance": "跳舞",
    "day": "天", "dear": "亲爱的", "desk": "书桌", "difficult": "困难的", "dinner": "晚餐",
    "dirty": "脏的", "do": "做", "doctor": "医生", "dog": "狗", "door": "门",
    "down": "向下", "draw": "画", "dress": "连衣裙", "drink": "喝", "driver": "司机",
    "duck": "鸭子", "ear": "耳朵", "early": "早的", "easy": "容易的", "eat": "吃",
    "egg": "鸡蛋", "elephant": "大象", "email": "电子邮件", "english": "英语", "evening": "晚上",
    "every": "每一个", "exercise": "锻炼", "eye": "眼睛", "face": "脸", "family": "家庭",
    "fan": "风扇", "far": "远的", "farm": "农场", "farmer": "农民", "fast": "快的",
    "father": "父亲", "favourite": "最喜欢的", "favorite": "最喜欢的", "feel": "感觉", "film": "电影",
    "find": "找到", "fine": "好的", "fish": "鱼", "floor": "地板", "flower": "花",
    "fly": "飞", "food": "食物", "foot": "脚", "feet": "脚(复数)", "football": "足球",
    "for": "为了", "friend": "朋友", "from": "来自", "fruit": "水果", "game": "游戏",
    "get": "得到", "girl": "女孩", "give": "给", "go": "去", "good": "好的",
    "goodbye": "再见", "bye": "再见", "grandfather": "祖父", "grandpa": "爷爷", "grandmother": "祖母",
    "grandma": "奶奶", "grass": "草", "great": "伟大的", "green": "绿色", "hair": "头发",
    "half": "一半", "hand": "手", "happy": "快乐的", "have": "有", "has": "有",
    "he": "他", "head": "头", "healthy": "健康的", "hear": "听见", "heavy": "重的",
    "hello": "你好", "help": "帮助", "her": "她的", "here": "这里", "hi": "嗨",
    "high": "高的", "him": "他(宾格)", "his": "他的", "holiday": "假期", "home": "家",
    "horse": "马", "hospital": "医院", "hot": "热的", "hour": "小时", "house": "房子",
    "how": "如何", "hungry": "饿的", "i": "我", "ice cream": "冰淇淋", "idea": "主意",
    "ill": "生病的", "in": "在...里", "interesting": "有趣的", "is": "是", "it": "它",
    "its": "它的", "juice": "果汁", "jump": "跳", "kid": "小孩", "kind": "善良的",
    "kitchen": "厨房", "kite": "风筝", "know": "知道", "lake": "湖", "late": "迟的",
    "left": "左", "leg": "腿", "lesson": "课", "let": "让", "library": "图书馆",
    "light": "灯", "like": "喜欢", "listen": "听", "little": "小的", "live": "居住",
    "long": "长的", "look": "看", "love": "爱", "lunch": "午餐", "make": "制作",
    "man": "男人", "men": "男人们", "many": "许多", "map": "地图", "maths": "数学",
    "math": "数学", "me": "我(宾格)", "meet": "遇见", "milk": "牛奶", "minute": "分钟",
    "miss": "想念", "monkey": "猴子", "month": "月", "moon": "月亮", "morning": "早上",
    "mother": "母亲", "mouth": "嘴", "mr": "先生", "mrs": "夫人", "ms": "女士",
    "much": "许多", "mum": "妈妈", "mom": "妈妈", "music": "音乐", "my": "我的",
    "name": "名字", "near": "在...附近", "new": "新的", "next": "下一个", "nice": "好的",
    "night": "夜晚", "no": "不", "noodle": "面条", "nose": "鼻子", "not": "不",
    "now": "现在", "nurse": "护士", "of": "...的", "often": "经常", "old": "老的",
    "on": "在...上", "open": "打开", "or": "或者", "orange": "橙子", "our": "我们的",
    "panda": "熊猫", "parent": "父母", "park": "公园", "party": "聚会", "pe": "体育",
    "physical education": "体育", "pen": "钢笔", "pencil": "铅笔", "people": "人们", "photo": "照片",
    "picture": "图片", "pig": "猪", "place": "地方", "plane": "飞机", "plant": "植物",
    "play": "玩", "playground": "操场", "please": "请", "police": "警察", "potato": "土豆",
    "pupil": "小学生", "put": "放", "rain": "雨", "read": "读", "red": "红色",
    "rice": "米饭", "right": "对的", "river": "河流", "room": "房间", "ruler": "尺子",
    "run": "跑", "sad": "悲伤的", "say": "说", "school": "学校", "schoolbag": "书包",
    "science": "科学", "season": "季节", "see": "看见", "she": "她", "sheep": "绵羊",
    "ship": "轮船", "shirt": "衬衫", "shoe": "鞋子", "shop": "商店", "short": "短的",
    "shorts": "短裤", "sing": "唱歌", "sister": "姐妹", "sit": "坐", "skirt": "裙子",
    "sleep": "睡觉", "slow": "慢的", "small": "小的", "snow": "雪", "sock": "袜子",
    "some": "一些", "sometimes": "有时", "song": "歌曲", "sorry": "对不起", "soup": "汤",
    "speak": "说", "sport": "运动", "spring": "春天", "stand": "站立", "star": "星星",
    "stop": "停止", "story": "故事", "street": "街道", "strong": "强壮的", "study": "学习",
    "subject": "科目", "summer": "夏天", "sun": "太阳", "sunny": "晴朗的", "supermarket": "超市",
    "sweater": "毛衣", "swim": "游泳", "table": "桌子", "take": "拿", "talk": "谈话",
    "tall": "高的", "taxi": "出租车", "tea": "茶", "teacher": "老师", "tell": "告诉",
    "thank": "谢谢", "that": "那个", "the": "这个,那个", "their": "他们的", "them": "他们(宾格)",
    "then": "然后", "there": "那里", "these": "这些", "they": "他们", "thin": "瘦的",
    "think": "想", "this": "这个", "those": "那些", "tiger": "老虎", "time": "时间",
    "tired": "累的", "to": "到", "today": "今天", "toilet": "厕所", "tomato": "西红柿",
    "tomorrow": "明天", "too": "也", "toy": "玩具", "train": "火车", "travel": "旅行",
    "tree": "树", "trousers": "裤子", "try": "尝试", "turn": "转动", "tv": "电视",
    "umbrella": "雨伞", "uncle": "叔叔", "under": "在...下面", "up": "向上", "us": "我们(宾格)",
    "use": "使用", "vegetable": "蔬菜", "very": "非常", "visit": "参观", "wait": "等待",
    "walk": "走路", "want": "想要", "warm": "温暖的", "wash": "洗", "watch": "观看",
    "water": "水", "way": "方式", "we": "我们", "wear": "穿", "weather": "天气",
    "week": "周", "welcome": "欢迎", "well": "好", "what": "什么", "when": "什么时候",
    "where": "哪里", "white": "白色", "who": "谁", "whose": "谁的", "why": "为什么",
    "window": "窗户", "windy": "有风的", "winter": "冬天", "with": "和...一起", "woman": "女人",
    "women": "女人们", "wonderful": "精彩的", "word": "单词", "work": "工作", "worker": "工人",
    "worry": "担心", "write": "写", "wrong": "错的", "year": "年", "yellow": "黄色",
    "yes": "是的", "yesterday": "昨天", "you": "你", "young": "年轻的", "your": "你的",
    "zoo": "动物园"
};

// 音标数据库 (IPA)
const ipaData = {
    "a": "/ə/", "an": "/æn/", "about": "/əˈbaʊt/", "afraid": "/əˈfreɪd/", "after": "/ˈɑːftər/",
    "afternoon": "/ˌɑːftərˈnuːn/", "again": "/əˈɡen/", "all": "/ɔːl/", "also": "/ˈɔːlsəʊ/", "always": "/ˈɔːlweɪz/",
    "am": "/æm/", "and": "/ænd/", "angry": "/ˈæŋɡri/", "animal": "/ˈænɪml/", "answer": "/ˈɑːnsər/",
    "any": "/ˈeni/", "apple": "/ˈæpl/", "are": "/ɑːr/", "arm": "/ɑːrm/", "art": "/ɑːrt/",
    "ask": "/æsk/", "at": "/æt/", "aunt": "/ænt/", "autumn": "/ˈɔːtəm/", "baby": "/ˈbeɪbi/",
    "back": "/bæk/", "bad": "/bæd/", "bag": "/bæɡ/", "ball": "/bɔːl/", "banana": "/bəˈnɑːnə/",
    "basketball": "/ˈbæskɪtbɔːl/", "be": "/biː/", "bear": "/ber/", "beautiful": "/ˈbjuːtɪfl/", "bed": "/bed/",
    "before": "/bɪˈfɔːr/", "begin": "/bɪˈɡɪn/", "behind": "/bɪˈhaɪnd/", "beside": "/bɪˈsaɪd/", "between": "/bɪˈtwiːn/",
    "big": "/bɪɡ/", "bike": "/baɪk/", "bicycle": "/ˈbaɪsɪkl/", "bird": "/bɜːrd/", "birthday": "/ˈbɜːrθdeɪ/",
    "black": "/blæk/", "blackboard": "/ˈblækbɔːrd/", "blue": "/bluː/", "boat": "/boʊt/", "body": "/ˈbɑːdi/",
    "book": "/bʊk/", "box": "/bɑːks/", "boy": "/bɔɪ/", "bread": "/bred/", "breakfast": "/ˈbrekfəst/",
    "bring": "/brɪŋ/", "brother": "/ˈbrʌðər/", "brown": "/braʊn/", "bus": "/bʌs/", "busy": "/ˈbɪzi/",
    "but": "/bət/", "buy": "/baɪ/", "by": "/baɪ/", "cake": "/keɪk/", "call": "/kɔːl/",
    "can": "/kæn/", "candy": "/ˈkændi/", "cap": "/kæp/", "car": "/kɑːr/", "card": "/kɑːrd/",
    "cat": "/kæt/", "chair": "/tʃer/", "chicken": "/ˈtʃɪkɪn/", "child": "/tʃaɪld/", "children": "/ˈtʃɪldrən/",
    "china": "/ˈtʃaɪnə/", "chinese": "/ˌtʃaɪˈniːz/", "cinema": "/ˈsɪnəmə/", "city": "/ˈsɪti/", "class": "/klæs/",
    "clean": "/kliːn/", "clever": "/ˈklevər/", "clock": "/klɑːk/", "close": "/kloʊz/", "clothes": "/kloʊðz/",
    "cloudy": "/ˈklaʊdi/", "coat": "/koʊt/", "cold": "/koʊld/", "colour": "/ˈkʌlər/", "color": "/ˈkʌlər/",
    "come": "/kʌm/", "computer": "/kəmˈpjuːtər/", "cook": "/kʊk/", "cool": "/kuːl/", "cousin": "/ˈkʌzn/",
    "cow": "/kaʊ/", "crayon": "/ˈkreɪən/", "cry": "/kraɪ/", "dad": "/dæd/", "dance": "/dæns/",
    "day": "/deɪ/", "dear": "/dɪr/", "desk": "/desk/", "difficult": "/ˈdɪfɪkəlt/", "dinner": "/ˈdɪnər/",
    "dirty": "/ˈdɜːrti/", "do": "/duː/", "doctor": "/ˈdɑːktər/", "dog": "/dɔːɡ/", "door": "/dɔːr/",
    "down": "/daʊn/", "draw": "/drɔː/", "dress": "/dres/", "drink": "/drɪŋk/", "driver": "/ˈdraɪvər/",
    "duck": "/dʌk/", "ear": "/ɪr/", "early": "/ˈɜːrli/", "easy": "/ˈiːzi/", "eat": "/iːt/",
    "egg": "/eɡ/", "elephant": "/ˈelɪfənt/", "email": "/ˈiːmeɪl/", "english": "/ˈɪŋɡlɪʃ/", "evening": "/ˈiːvnɪŋ/",
    "every": "/ˈevri/", "exercise": "/ˈeksərsaɪz/", "eye": "/aɪ/", "face": "/feɪs/", "family": "/ˈfæməli/",
    "fan": "/fæn/", "far": "/fɑːr/", "farm": "/fɑːrm/", "farmer": "/ˈfɑːrmər/", "fast": "/fæst/",
    "father": "/ˈfɑːðər/", "favourite": "/ˈfeɪvərɪt/", "favorite": "/ˈfeɪvərɪt/", "feel": "/fiːl/", "film": "/fɪlm/",
    "find": "/faɪnd/", "fine": "/faɪn/", "fish": "/fɪʃ/", "floor": "/flɔːr/", "flower": "/ˈflaʊər/",
    "fly": "/flaɪ/", "food": "/fuːd/", "foot": "/fʊt/", "feet": "/fiːt/", "football": "/ˈfʊtbɔːl/",
    "for": "/fɔːr/", "friend": "/frend/", "from": "/frɑːm/", "fruit": "/fruːt/", "game": "/ɡeɪm/",
    "get": "/ɡet/", "girl": "/ɡɜːrl/", "give": "/ɡɪv/", "go": "/ɡoʊ/", "good": "/ɡʊd/",
    "goodbye": "/ˌɡʊdˈbaɪ/", "bye": "/baɪ/", "grandfather": "/ˈɡrænfɑːðər/", "grandpa": "/ˈɡrænpɑː/", "grandmother": "/ˈɡrænmʌðər/",
    "grandma": "/ˈɡrænmɑː/", "grass": "/ɡræs/", "great": "/ɡreɪt/", "green": "/ɡriːn/", "hair": "/her/",
    "half": "/hæf/", "hand": "/hænd/", "happy": "/ˈhæpi/", "have": "/hæv/", "has": "/hæz/",
    "he": "/hiː/", "head": "/hed/", "healthy": "/ˈhelθi/", "hear": "/hɪr/", "heavy": "/ˈhevi/",
    "hello": "/həˈloʊ/", "help": "/help/", "her": "/hɜːr/", "here": "/hɪr/", "hi": "/haɪ/",
    "high": "/haɪ/", "him": "/hɪm/", "his": "/hɪz/", "holiday": "/ˈhɑːlədeɪ/", "home": "/hoʊm/",
    "horse": "/hɔːrs/", "hospital": "/ˈhɑːspɪtl/", "hot": "/hɑːt/", "hour": "/ˈaʊər/", "house": "/haʊs/",
    "how": "/haʊ/", "hungry": "/ˈhʌŋɡri/", "i": "/aɪ/", "ice cream": "/ˈaɪs kriːm/", "idea": "/aɪˈdiːə/",
    "ill": "/ɪl/", "in": "/ɪn/", "interesting": "/ˈɪntrəstɪŋ/", "is": "/ɪz/", "it": "/ɪt/",
    "its": "/ɪts/", "juice": "/dʒuːs/", "jump": "/dʒʌmp/", "kid": "/kɪd/", "kind": "/kaɪnd/",
    "kitchen": "/ˈkɪtʃən/", "kite": "/kaɪt/", "know": "/noʊ/", "lake": "/leɪk/", "late": "/leɪt/",
    "left": "/left/", "leg": "/leɡ/", "lesson": "/ˈlesn/", "let": "/let/", "library": "/ˈlaɪbreri/",
    "light": "/laɪt/", "like": "/laɪk/", "listen": "/ˈlɪsn/", "little": "/ˈlɪtl/", "live": "/lɪv/",
    "long": "/lɔːŋ/", "look": "/lʊk/", "love": "/lʌv/", "lunch": "/lʌntʃ/", "make": "/meɪk/",
    "man": "/mæn/", "men": "/men/", "many": "/ˈmeni/", "map": "/mæp/", "maths": "/mæθs/",
    "math": "/mæθ/", "me": "/miː/", "meet": "/miːt/", "milk": "/mɪlk/", "minute": "/ˈmɪnɪt/",
    "miss": "/mɪs/", "monkey": "/ˈmʌŋki/", "month": "/mʌnθ/", "moon": "/muːn/", "morning": "/ˈmɔːrnɪŋ/",
    "mother": "/ˈmʌðər/", "mouth": "/maʊθ/", "mr": "/ˈmɪstər/", "mrs": "/ˈmɪsɪz/", "ms": "/mɪz/",
    "much": "/mʌtʃ/", "mum": "/mʌm/", "mom": "/mɑːm/", "music": "/ˈmjuːzɪk/", "my": "/maɪ/",
    "name": "/neɪm/", "near": "/nɪr/", "new": "/nuː/", "next": "/nekst/", "nice": "/naɪs/",
    "night": "/naɪt/", "no": "/noʊ/", "noodle": "/ˈnuːdl/", "nose": "/noʊz/", "not": "/nɑːt/",
    "now": "/naʊ/", "nurse": "/nɜːrs/", "of": "/ʌv/", "often": "/ˈɔːfn/", "old": "/oʊld/",
    "on": "/ɑːn/", "open": "/ˈoʊpən/", "or": "/ɔːr/", "orange": "/ˈɔːrɪndʒ/", "our": "/aʊər/",
    "panda": "/ˈpændə/", "parent": "/ˈperənt/", "park": "/pɑːrk/", "party": "/ˈpɑːrti/", "pe": "/piː iː/",
    "physical education": "/ˈfɪzɪkl ˌedʒuˈkeɪʃn/", "pen": "/pen/", "pencil": "/ˈpensl/", "people": "/ˈpiːpl/", "photo": "/ˈfoʊtoʊ/",
    "picture": "/ˈpɪktʃər/", "pig": "/pɪɡ/", "place": "/pleɪs/", "plane": "/pleɪn/", "plant": "/plænt/",
    "play": "/pleɪ/", "playground": "/ˈpleɪɡraʊnd/", "please": "/pliːz/", "police": "/pəˈliːs/", "potato": "/pəˈteɪtoʊ/",
    "pupil": "/ˈpjuːpl/", "put": "/pʊt/", "rain": "/reɪn/", "read": "/riːd/", "red": "/red/",
    "rice": "/raɪs/", "right": "/raɪt/", "river": "/ˈrɪvər/", "room": "/ruːm/", "ruler": "/ˈruːlər/",
    "run": "/rʌn/", "sad": "/sæd/", "say": "/seɪ/", "school": "/skuːl/", "schoolbag": "/ˈskuːlbæɡ/",
    "science": "/ˈsaɪəns/", "season": "/ˈsiːzn/", "see": "/siː/", "she": "/ʃiː/", "sheep": "/ʃiːp/",
    "ship": "/ʃɪp/", "shirt": "/ʃɜːrt/", "shoe": "/ʃuː/", "shop": "/ʃɑːp/", "short": "/ʃɔːrt/",
    "shorts": "/ʃɔːrts/", "sing": "/sɪŋ/", "sister": "/ˈsɪstər/", "sit": "/sɪt/", "skirt": "/skɜːrt/",
    "sleep": "/sliːp/", "slow": "/sloʊ/", "small": "/smɔːl/", "snow": "/snoʊ/", "sock": "/sɑːk/",
    "some": "/sʌm/", "sometimes": "/ˈsʌmtaɪmz/", "song": "/sɔːŋ/", "sorry": "/ˈsɑːri/", "soup": "/suːp/",
    "speak": "/spiːk/", "sport": "/spɔːrt/", "spring": "/sprɪŋ/", "stand": "/stænd/", "star": "/stɑːr/",
    "stop": "/stɑːp/", "story": "/ˈstɔːri/", "street": "/striːt/", "strong": "/strɔːŋ/", "study": "/ˈstʌdi/",
    "subject": "/ˈsʌbdʒɪkt/", "summer": "/ˈsʌmər/", "sun": "/sʌn/", "sunny": "/ˈsʌni/", "supermarket": "/ˈsuːpərmɑːrkɪt/",
    "sweater": "/ˈswetər/", "swim": "/swɪm/", "table": "/ˈteɪbl/", "take": "/teɪk/", "talk": "/tɔːk/",
    "tall": "/tɔːl/", "taxi": "/ˈtæksi/", "tea": "/tiː/", "teacher": "/ˈtiːtʃər/", "tell": "/tel/",
    "thank": "/θæŋk/", "that": "/ðæt/", "the": "/ðə/", "their": "/ðer/", "them": "/ðem/",
    "then": "/ðen/", "there": "/ðer/", "these": "/ðiːz/", "they": "/ðeɪ/", "thin": "/θɪn/",
    "think": "/θɪŋk/", "this": "/ðɪs/", "those": "/ðoʊz/", "tiger": "/ˈtaɪɡər/", "time": "/taɪm/",
    "tired": "/ˈtaɪərd/", "to": "/tuː/", "today": "/təˈdeɪ/", "toilet": "/ˈtɔɪlət/", "tomato": "/təˈmɑːtoʊ/",
    "tomorrow": "/təˈmɑːroʊ/", "too": "/tuː/", "toy": "/tɔɪ/", "train": "/treɪn/", "travel": "/ˈtrævl/",
    "tree": "/triː/", "trousers": "/ˈtraʊzərz/", "try": "/traɪ/", "turn": "/tɜːrn/", "tv": "/ˌtiː ˈviː/",
    "umbrella": "/ʌmˈbrelə/", "uncle": "/ˈʌŋkl/", "under": "/ˈʌndər/", "up": "/ʌp/", "us": "/ʌs/",
    "use": "/juːz/", "vegetable": "/ˈvedʒtəbl/", "very": "/ˈveri/", "visit": "/ˈvɪzɪt/", "wait": "/weɪt/",
    "walk": "/wɔːk/", "want": "/wɑːnt/", "warm": "/wɔːrm/", "wash": "/wɑːʃ/", "watch": "/wɑːtʃ/",
    "water": "/ˈwɔːtər/", "way": "/weɪ/", "we": "/wiː/", "wear": "/wer/", "weather": "/ˈweðər/",
    "week": "/wiːk/", "welcome": "/ˈwelkəm/", "well": "/wel/", "what": "/wʌt/", "when": "/wen/",
    "where": "/wer/", "white": "/waɪt/", "who": "/huː/", "whose": "/huːz/", "why": "/waɪ/",
    "window": "/ˈwɪndoʊ/", "windy": "/ˈwɪndi/", "winter": "/ˈwɪntər/", "with": "/wɪð/", "woman": "/ˈwʊmən/",
    "women": "/ˈwɪmɪn/", "wonderful": "/ˈwʌndərfl/", "word": "/wɜːrd/", "work": "/wɜːrk/", "worker": "/ˈwɜːrkər/",
    "worry": "/ˈwɜːri/", "write": "/raɪt/", "wrong": "/rɔːŋ/", "year": "/jɪr/", "yellow": "/ˈjeloʊ/",
    "yes": "/jes/", "yesterday": "/ˈjestərdeɪ/", "you": "/juː/", "young": "/jʌŋ/", "your": "/jɔːr/",
    "zoo": "/zuː/"
};

// 读取并更新文件
function updatePrimarySchoolFile() {
    const filePath = path.join(__dirname, 'primary_school_words.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // 提取现有的单词数组
    const match = content.match(/export const primarySchoolWords = (\[.*?\]);/s);
    if (!match) {
        console.log('无法找到单词数组');
        return;
    }

    let words = JSON.parse(match[1]);
    let updatedCount = 0;

    // 更新每个单词的翻译和音标
    words = words.map(item => {
        const wordKey = item.word.toLowerCase().trim();
        if (primaryVocab[wordKey] || ipaData[wordKey]) {
            updatedCount++;
            return {
                word: item.word,
                translation: primaryVocab[wordKey] || '',
                phonetic: ipaData[wordKey] || '',
                level: 'primary'
            };
        }
        return item;
    });

    // 生成新的文件内容
    const newContent = `/**
 * 小学英语词汇数据
 * 包含小学英语大纲核心词汇
 * 总词汇量: ${words.length} 个
 */

export const primarySchoolWords = ${JSON.stringify(words, null, 4)};
`;

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 小学词汇文件已更新: ${updatedCount}/${words.length} 个单词已补充翻译和音标`);
}

// 主函数
function main() {
    console.log('开始更新词汇文件...\n');
    updatePrimarySchoolFile();
    console.log('\n完成！');
}

main();
