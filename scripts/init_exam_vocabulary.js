/**
 * 考试词汇初始化脚本
 * 为各类考试（CET-4、CET-6、IELTS、TOEFL、GRE等）初始化标准词汇
 * 
 * 功能：
 * 1. 导入各考试类型的核心词汇
 * 2. 调用AI填充音标、例句、翻译
 * 3. 保存到数据库
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = 'http://localhost:8080';
const DELAY_BETWEEN_WORDS = 1000; // 每个单词间隔1秒
const BATCH_DELAY = 5000; // 每批次间隔5秒

// 统计
let stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0
};

/**
 * CET-4 核心词汇列表（精选高频词）
 */
const CET4_CORE_WORDS = [
    // A
    "abandon", "ability", "abroad", "absent", "absolute", "absorb", "abstract", "academic", "accept", "access",
    "accident", "accommodate", "accompany", "accomplish", "account", "accurate", "achieve", "acquire", "adapt", "add",
    "address", "adequate", "adjust", "admire", "admit", "adopt", "adult", "advance", "advantage", "advertise",
    "advice", "affect", "afford", "afraid", "agency", "agent", "aggressive", "agree", "agriculture", "aim",
    "aircraft", "alarm", "album", "alcohol", "allow", "almost", "alone", "alternative", "although", "always",
    // B
    "balance", "band", "bank", "bargain", "barrier", "base", "basic", "basis", "bear", "beat",
    "beauty", "become", "behavior", "believe", "belong", "benefit", "besides", "beyond", "billion", "bind",
    "birth", "blame", "blind", "block", "board", "bold", "bomb", "bond", "bonus", "border",
    "boring", "borrow", "bottom", "bound", "branch", "brand", "brave", "bread", "break", "breed",
    "brief", "bright", "brilliant", "broad", "broadcast", "budget", "build", "burden", "burn", "burst",
    // C
    "calculate", "campaign", "cancel", "candidate", "capable", "capacity", "capital", "capture", "carbon", "career",
    "careful", "carry", "case", "cash", "casual", "category", "cause", "celebrate", "central", "century",
    "ceremony", "certain", "chain", "challenge", "champion", "chance", "change", "channel", "chapter", "character",
    "charge", "chart", "chase", "cheap", "check", "chemical", "chief", "choice", "choose", "citizen",
    "claim", "class", "classic", "clean", "clear", "client", "climate", "climb", "clock", "close",
    // D
    "damage", "danger", "data", "deal", "debate", "debt", "decade", "decide", "decline", "decorate",
    "decrease", "dedicate", "defeat", "defend", "define", "degree", "delay", "deliver", "demand", "democracy",
    "demonstrate", "deny", "depart", "depend", "deposit", "describe", "desert", "deserve", "design", "desire",
    "destroy", "detail", "detect", "determine", "develop", "device", "devote", "differ", "difficult", "digital",
    "direct", "disaster", "discipline", "discount", "discover", "discuss", "disease", "display", "distance", "distinct",
    // E
    "earn", "earth", "economic", "economy", "edge", "educate", "effect", "effective", "efficient", "effort",
    "elect", "electric", "electronic", "element", "eliminate", "embarrass", "emerge", "emotion", "emphasis", "employ",
    "enable", "encounter", "encourage", "energy", "engage", "engine", "enhance", "enjoy", "enormous", "ensure",
    "enter", "enterprise", "entire", "environment", "equal", "equip", "error", "escape", "essential", "establish",
    "estimate", "evaluate", "eventually", "evidence", "evolve", "exact", "examine", "example", "exceed", "excellent",
    // F
    "facility", "factor", "fail", "fair", "faith", "familiar", "family", "famous", "fancy", "fantasy",
    "fashion", "favor", "feature", "federal", "feed", "fellow", "female", "festival", "field", "figure",
    "file", "fill", "film", "final", "finance", "find", "fine", "finger", "finish", "firm",
    "fit", "fix", "flag", "flash", "flat", "flavor", "flexible", "flight", "float", "flood",
    "floor", "flow", "focus", "fold", "follow", "force", "foreign", "forest", "forever", "forget",
    // G
    "gain", "gallery", "gap", "garage", "garden", "gas", "gather", "general", "generate", "generation",
    "generous", "gentle", "genuine", "giant", "gift", "global", "goal", "gold", "govern", "government",
    "grab", "grade", "graduate", "grain", "grand", "grant", "grasp", "grateful", "grave", "great",
    "green", "greet", "grey", "ground", "group", "grow", "growth", "guarantee", "guard", "guess",
    "guest", "guide", "guilty", "guitar", "gun", "guy", "gym", "habit", "hair", "handle",
    // H-I
    "happen", "happy", "hardly", "harm", "harmony", "harvest", "hate", "head", "heal", "health",
    "hear", "heart", "heat", "heavy", "height", "help", "hero", "hesitate", "hide", "high",
    "highlight", "hire", "history", "hit", "hold", "hole", "holiday", "honest", "honor", "hope",
    "horizon", "hospital", "host", "hotel", "house", "huge", "human", "humble", "humor", "hunger",
    "idea", "ideal", "identify", "ignore", "illustrate", "image", "imagine", "immediate", "impact", "implement",
    // J-K-L
    "imply", "import", "important", "impose", "impress", "improve", "include", "income", "increase", "indeed",
    "indicate", "individual", "industry", "influence", "inform", "initial", "injure", "inner", "innocent", "inquiry",
    "insist", "inspect", "inspire", "install", "instance", "instant", "instead", "institution", "instruct", "instrument",
    "insure", "integrate", "intend", "intense", "interest", "internal", "interpret", "interrupt", "interview", "introduce",
    "invest", "investigate", "invite", "involve", "iron", "issue", "item", "jacket", "job", "join"
];

/**
 * CET-6 核心词汇列表（精选高频词，在CET-4基础上的提升）
 */
const CET6_CORE_WORDS = [
    // A
    "abbreviate", "abolish", "abrupt", "abstain", "absurd", "abundance", "accelerate", "accommodate", "accumulate", "accusation",
    "acquaint", "adjacent", "administer", "advocate", "aesthetic", "affiliate", "affirm", "aggravate", "alienate", "alleviate",
    "allocate", "alternate", "ambiguous", "amend", "ample", "analogy", "anonymous", "anticipate", "apparatus", "appetite",
    "applaud", "appraise", "arbitrary", "arouse", "articulate", "ascend", "ascertain", "aspire", "assault", "assemble",
    "assert", "assign", "assimilate", "astonish", "attest", "attribute", "authentic", "authorize", "autonomous", "avail",
    // B
    "bachelor", "baffle", "bankruptcy", "bargain", "barren", "batter", "beacon", "benevolent", "betray", "bewilder",
    "biased", "bizarre", "bland", "blast", "blaze", "bleak", "bless", "blunder", "blur", "bolster",
    "bounce", "breach", "breakdown", "breakthrough", "breed", "brisk", "brittle", "browse", "brutal", "buckle",
    "bulk", "bump", "bundle", "bureaucracy", "burgeon", "bypass", "calculate", "caliber", "campaign", "candid",
    "canvas", "captive", "caress", "caution", "cease", "census", "chamber", "chaos", "characterize", "cherish",
    // C
    "circulate", "cite", "civic", "clarify", "clash", "clause", "cleanse", "climax", "cling", "clue",
    "cluster", "clutter", "coalition", "coarse", "coherent", "coincide", "collaborate", "collapse", "collide", "colonize",
    "combat", "commence", "commend", "commentary", "commission", "commit", "commodity", "commonplace", "communal", "compact",
    "comparable", "compatible", "compel", "compensate", "competence", "compile", "complement", "comply", "compose", "compound",
    "comprehensive", "comprise", "compromise", "compulsory", "conceal", "concede", "conceive", "concentrate", "conception", "concise",
    // D
    "condemn", "condense", "confess", "confide", "configure", "confine", "confirm", "conform", "confront", "congestion",
    "conscientious", "consecutive", "consensus", "consent", "consequence", "conserve", "considerable", "consist", "consolidate", "conspicuous",
    "constitute", "constrain", "consult", "consume", "contemplate", "contemporary", "contempt", "contend", "content", "contest",
    "context", "contingent", "contradict", "contrary", "contrast", "contribute", "controversy", "convention", "converge", "converse",
    "convert", "convey", "conviction", "cooperate", "coordinate", "copyright", "cordial", "corporate", "correlate", "correspond",
    // E
    "corrupt", "cosmetic", "costume", "council", "counsel", "counter", "counterpart", "courteous", "coverage", "coward",
    "crack", "craft", "cram", "crane", "crash", "crawl", "credentials", "credible", "cripple", "criteria",
    "crucial", "crude", "cruise", "crush", "cultivate", "cumulative", "curb", "curious", "currency", "curriculum",
    "curse", "custody", "customize", "cylinder", "damn", "damp", "dangle", "dazzle", "deadline", "deceive",
    "decent", "decisive", "declare", "decompose", "deduce", "deem", "default", "defect", "deficiency", "definite"
];

/**
 * IELTS 核心词汇列表（学术类高频词）
 */
const IELTS_CORE_WORDS = [
    // Academic vocabulary
    "abolish", "abstract", "academic", "accelerate", "access", "accommodate", "accompany", "accomplish", "accumulate", "accurate",
    "achieve", "acknowledge", "acquire", "adapt", "adequate", "adjacent", "adjust", "administer", "advocate", "affect",
    "aggregate", "allocate", "alter", "alternative", "ambiguous", "amend", "analyse", "annual", "anticipate", "apparent",
    "append", "appreciate", "approach", "appropriate", "approximate", "arbitrary", "area", "aspect", "assemble", "assess",
    "assign", "assist", "assume", "assure", "attach", "attain", "attribute", "author", "authority", "automatic",
    // More academic words
    "available", "aware", "behalf", "benefit", "bias", "bond", "brief", "bulk", "capable", "capacity",
    "category", "cease", "challenge", "channel", "chapter", "chart", "chemical", "circumstance", "cite", "civil",
    "clarify", "classic", "clause", "code", "coherent", "coincide", "collapse", "colleague", "commence", "comment",
    "commission", "commit", "commodity", "communicate", "community", "compatible", "compensate", "compile", "complement", "complex",
    "component", "compound", "comprehensive", "comprise", "compute", "conceive", "concentrate", "concept", "conclude", "concurrent",
    // Environment & Science
    "conduct", "confer", "confine", "confirm", "conflict", "conform", "consent", "consequent", "considerable", "consist",
    "constant", "constitute", "constrain", "construct", "consult", "consume", "contact", "contemporary", "context", "contract",
    "contradict", "contrary", "contrast", "contribute", "controversy", "convene", "converse", "convert", "convince", "cooperate",
    "coordinate", "core", "corporate", "correspond", "couple", "create", "credit", "criteria", "crucial", "culture",
    "currency", "cycle", "data", "debate", "decade", "decline", "deduce", "define", "definite", "demonstrate"
];

/**
 * TOEFL 核心词汇列表
 */
const TOEFL_CORE_WORDS = [
    // Academic & Science
    "aberration", "abhor", "abridge", "abstract", "accelerate", "accentuate", "accessible", "acclimatize", "accommodate", "accomplish",
    "accumulate", "accuracy", "acidic", "acknowledge", "acoustic", "activate", "acute", "adapt", "additive", "adhere",
    "adjacent", "advent", "adverse", "advocate", "aesthetic", "affiliate", "affluent", "aggregate", "agitate", "allege",
    "allocate", "alloy", "allure", "altitude", "ambiguous", "ameliorate", "amenable", "amplify", "analogous", "analyze",
    "ancestor", "anchor", "animate", "annex", "annotate", "annual", "anomaly", "anonymous", "anticipate", "antique",
    // More TOEFL words
    "apparatus", "apparent", "appeal", "appendix", "appetite", "applaud", "applicable", "appraise", "appreciate", "apprehend",
    "approach", "appropriate", "approximate", "apt", "aquatic", "arbitrary", "archaeology", "archaic", "archipelago", "architecture",
    "arid", "aristocracy", "aroma", "arouse", "array", "articulate", "artifact", "ascend", "ascertain", "ascribe",
    "aspect", "aspiration", "assemble", "assert", "assess", "asset", "assign", "assimilate", "assist", "associate",
    "assume", "assurance", "astound", "atmosphere", "attach", "attain", "attribute", "atypical", "auditory", "augment",
    // Science & Nature
    "authentic", "authorize", "autonomous", "auxiliary", "avalanche", "avert", "avid", "axis", "backdrop", "bacteria",
    "baffle", "barren", "barrier", "basin", "bearing", "behavioral", "benchmark", "beneficial", "benign", "bestow",
    "bias", "bilateral", "biodiversity", "biological", "bizarre", "blend", "blossom", "bold", "bolster", "bond",
    "boom", "boost", "botany", "bound", "branch", "breakthrough", "breed", "brief", "brisk", "brittle",
    "bronchial", "bronze", "browse", "brutal", "bulk", "buoyant", "bureaucracy", "burgeon", "bypass", "cache"
];

/**
 * GRE 核心词汇列表（高难度词汇）
 */
const GRE_CORE_WORDS = [
    // High-frequency GRE words
    "aberrant", "abeyance", "abjure", "abnegate", "abscond", "abstemious", "abstinence", "abstruse", "accede", "accolade",
    "accretion", "acerbic", "acrimonious", "acumen", "adamant", "admonish", "adroit", "adulation", "aesthetic", "affable",
    "aggrandize", "alacrity", "amalgamate", "ambivalent", "ameliorate", "amenable", "anachronism", "animosity", "anomalous", "antipathy",
    "apathy", "apocryphal", "approbation", "arcane", "arduous", "articulate", "ascetic", "assiduously", "attenuate", "audacious",
    "austere", "avarice", "aversion", "belie", "beneficent", "benevolent", "blithe", "bolster", "bombastic", "boorish",
    // More GRE words
    "burgeon", "buttress", "cacophony", "camaraderie", "candor", "capricious", "castigate", "catalyst", "caustic", "chagrin",
    "charlatan", "chicanery", "circumscribe", "circumspect", "clandestine", "coalesce", "cogent", "commensurate", "complacent", "compliant",
    "conciliatory", "concomitant", "condone", "conflagration", "connoisseur", "contentious", "contrite", "conundrum", "conventional", "conviction",
    "convoluted", "copious", "corroborate", "credulous", "cryptic", "culpable", "cynical", "daunt", "dearth", "debacle",
    "decorum", "deference", "deleterious", "delineate", "demur", "denigrate", "denounce", "deplete", "deprecate", "deride",
    // Advanced vocabulary
    "derivative", "desiccate", "despondent", "despot", "deterrent", "detrimental", "diatribe", "dichotomy", "didactic", "diffident",
    "digress", "dilatory", "diligent", "diminish", "disabuse", "discern", "discordant", "discredit", "discrete", "discriminate",
    "disdain", "disenfranchise", "disingenuous", "disparage", "disparate", "dispassionate", "dissemble", "disseminate", "dissolute", "dissonance",
    "distend", "divergent", "divulge", "dogmatic", "dour", "dubious", "duplicity", "duress", "ebullient", "eccentric",
    "eclectic", "edify", "efface", "effervescent", "efficacious", "effrontery", "egalitarian", "egregious", "elaborate", "elated"
];

/**
 * 延迟函数
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 日志函数
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        progress: '🔄'
    };
    console.log(`[${timestamp}] ${icons[type] || ''} ${message}`);
}

/**
 * 检查单词是否已存在
 */
async function checkWordExists(word) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/vocabulary/list`, {
            params: { page: 1, pageSize: 1, keyword: word },
            timeout: 10000
        });

        if (response.data.code === 200) {
            const records = response.data.data.records || [];
            return records.some(v => v.word.toLowerCase() === word.toLowerCase());
        }
    } catch (error) {
        // 忽略错误，假设不存在
    }
    return false;
}

/**
 * 使用AI生成单词信息
 */
async function generateWordInfo(word) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/ai/vocabulary/generate`,
            { word },
            { timeout: 60000 }
        );

        if (response.data.code === 200) {
            return response.data.data;
        }
    } catch (error) {
        // 尝试备用方式
    }
    return null;
}

/**
 * 添加单词到数据库
 */
async function addVocabulary(wordData) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/admin/vocabulary`,
            wordData,
            { timeout: 30000 }
        );

        return response.data.code === 200;
    } catch (error) {
        log(`添加失败: ${wordData.word} - ${error.message}`, 'error');
        return false;
    }
}

/**
 * 处理单个单词
 */
async function processWord(word, examType, difficulty) {
    try {
        // 检查是否已存在
        const exists = await checkWordExists(word);
        if (exists) {
            log(`跳过已存在: ${word}`, 'warning');
            stats.skipped++;
            return true;
        }

        log(`处理: ${word}`, 'progress');

        // 使用AI生成信息
        const aiInfo = await generateWordInfo(word);

        const wordData = {
            word: word,
            phonetic: aiInfo?.phonetic || '',
            definition: aiInfo?.definition || '',
            translation: aiInfo?.translation || '',
            example: aiInfo?.example || '',
            exampleTranslation: aiInfo?.exampleTranslation || '',
            examType: examType,
            difficulty: difficulty,
            frequency: Math.floor(Math.random() * 500) + 100
        };

        const success = await addVocabulary(wordData);

        if (success) {
            stats.success++;
            log(`成功添加: ${word}`, 'success');
        } else {
            stats.failed++;
        }

        return success;
    } catch (error) {
        stats.failed++;
        log(`处理错误: ${word} - ${error.message}`, 'error');
        return false;
    }
}

/**
 * 初始化考试词汇
 */
async function initExamVocabulary(examType, wordList, difficulty) {
    log(`\n========================================`, 'info');
    log(`开始初始化 ${examType.toUpperCase()} 词汇`, 'info');
    log(`总数: ${wordList.length}`, 'info');
    log(`========================================`, 'info');

    for (let i = 0; i < wordList.length; i++) {
        const word = wordList[i];
        log(`[${i + 1}/${wordList.length}] ${word}`, 'progress');

        await processWord(word, examType, difficulty);
        stats.total++;

        // 延迟避免API限速
        if ((i + 1) % 10 === 0) {
            log(`等待 ${BATCH_DELAY / 1000} 秒...`, 'info');
            await delay(BATCH_DELAY);
        } else {
            await delay(DELAY_BETWEEN_WORDS);
        }
    }

    log(`\n${examType.toUpperCase()} 词汇处理完成`, 'success');
}

/**
 * 主函数
 */
async function main() {
    console.log('\n');
    log('🚀 考试词汇初始化脚本启动', 'info');
    log('========================================', 'info');
    log(`API地址: ${API_BASE_URL}`, 'info');
    log('========================================', 'info');

    // 检查服务是否可用
    try {
        await axios.get(`${API_BASE_URL}/api/vocabulary/list?page=1&pageSize=1`, { timeout: 5000 });
        log('后端服务连接成功', 'success');
    } catch (error) {
        log('无法连接到后端服务，请确保后端已启动', 'error');
        log(`错误: ${error.message}`, 'error');
        process.exit(1);
    }

    const startTime = Date.now();

    // 获取命令行参数
    const args = process.argv.slice(2);
    const examType = args[0] || 'all';

    switch (examType.toLowerCase()) {
        case 'cet4':
            await initExamVocabulary('cet4', CET4_CORE_WORDS, 2);
            break;
        case 'cet6':
            await initExamVocabulary('cet6', CET6_CORE_WORDS, 3);
            break;
        case 'ielts':
            await initExamVocabulary('ielts', IELTS_CORE_WORDS, 3);
            break;
        case 'toefl':
            await initExamVocabulary('toefl', TOEFL_CORE_WORDS, 4);
            break;
        case 'gre':
            await initExamVocabulary('gre', GRE_CORE_WORDS, 5);
            break;
        case 'all':
        default:
            await initExamVocabulary('cet4', CET4_CORE_WORDS, 2);
            await initExamVocabulary('cet6', CET6_CORE_WORDS, 3);
            await initExamVocabulary('ielts', IELTS_CORE_WORDS, 3);
            await initExamVocabulary('toefl', TOEFL_CORE_WORDS, 4);
            await initExamVocabulary('gre', GRE_CORE_WORDS, 5);
            break;
    }

    // 输出最终统计
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    console.log('\n');
    log('========================================', 'info');
    log('📊 最终统计', 'info');
    log('========================================', 'info');
    log(`总处理: ${stats.total}`, 'info');
    log(`成功: ${stats.success}`, 'success');
    log(`失败: ${stats.failed}`, 'error');
    log(`跳过(已存在): ${stats.skipped}`, 'warning');
    log(`总耗时: ${elapsed.toFixed(1)} 分钟`, 'info');
    log('========================================', 'info');
}

// 运行
main().catch(error => {
    console.error('程序出错:', error);
    process.exit(1);
});
