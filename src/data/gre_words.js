const greWords = [
    {
        "word": "abstruse",
        "meaning": "adj. 深奥的，难懂的",
        "phonetic": "/æbˈstruːs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "acrimonious",
        "meaning": "adj. 尖刻的，激烈的",
        "phonetic": "/ˌækrɪˈməʊniəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "ameliorate",
        "meaning": "v. 改善，改进",
        "phonetic": "/əˈmiːliəreɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "anachronism",
        "meaning": "n. 时代错误，过时的事物",
        "phonetic": "/əˈnækrənɪzəm/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "antipathy",
        "meaning": "n. 反感，厌恶",
        "phonetic": "/ænˈtɪpəθi/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "approbation",
        "meaning": "n. 赞许，认可",
        "phonetic": "/ˌæprəˈbeɪʃn/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "assuage",
        "meaning": "v. 缓解，减轻",
        "phonetic": "/əˈsweɪdʒ/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "austerity",
        "meaning": "n. 严峻，朴素",
        "phonetic": "/ɔːˈsterəti/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "avarice",
        "meaning": "n. 贪婪，贪心",
        "phonetic": "/ˈævərɪs/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "bombastic",
        "meaning": "adj. 夸大的，浮夸的",
        "phonetic": "/bɒmˈbæstɪk/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "capricious",
        "meaning": "adj. 反复无常的",
        "phonetic": "/kəˈprɪʃəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "chicanery",
        "meaning": "n. 欺骗，诡计",
        "phonetic": "/ʃɪˈkeɪnəri/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "circumlocution",
        "meaning": "n. 冗长的说法",
        "phonetic": "/ˌsɜːkəmləˈkjuːʃn/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "cogent",
        "meaning": "adj. 有说服力的",
        "phonetic": "/ˈkəʊdʒənt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "commensurate",
        "meaning": "adj. 相称的，相当的",
        "phonetic": "/kəˈmenʃərət/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "conundrum",
        "meaning": "n. 难题，谜语",
        "phonetic": "/kəˈnʌndrəm/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "corroborate",
        "meaning": "v. 证实，确证",
        "phonetic": "/kəˈrɒbəreɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "deleterious",
        "meaning": "adj. 有害的，有毒的",
        "phonetic": "/ˌdeləˈtɪəriəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "demagogue",
        "meaning": "n. 煽动者，政治家",
        "phonetic": "/ˈdeməɡɒɡ/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "desiccate",
        "meaning": "v. 使干燥，脱水",
        "phonetic": "/ˈdesɪkeɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "dichotomy",
        "meaning": "n. 二分法，对立",
        "phonetic": "/daɪˈkɒtəmi/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "dilatory",
        "meaning": "adj. 拖延的，缓慢的",
        "phonetic": "/ˈdɪlətəri/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "ebullient",
        "meaning": "adj. 热情洋溢的",
        "phonetic": "/ɪˈbʌliənt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "efficacious",
        "meaning": "adj. 有效的，灵验的",
        "phonetic": "/ˌefɪˈkeɪʃəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "ephemeral",
        "meaning": "adj. 短暂的，瞬息的",
        "phonetic": "/ɪˈfemərəl/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "equivocate",
        "meaning": "v. 模糊其辞，支吾",
        "phonetic": "/ɪˈkwɪvəkeɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "erudite",
        "meaning": "adj. 博学的，有学问的",
        "phonetic": "/ˈeruːdaɪt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "exacerbate",
        "meaning": "v. 恶化，加剧",
        "phonetic": "/ɪɡˈzæsəbeɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "fastidious",
        "meaning": "adj. 挑剔的，苛求的",
        "phonetic": "/fæˈstɪdiəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "garrulous",
        "meaning": "adj. 喋喋不休的",
        "phonetic": "/ˈɡærələs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "gregarious",
        "meaning": "adj. 群居的，爱社交的",
        "phonetic": "/ɡrɪˈɡeəriəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "hackneyed",
        "meaning": "adj. 陈腐的，老套的",
        "phonetic": "/ˈhæknid/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "iconoclast",
        "meaning": "n. 破坏传统者",
        "phonetic": "/aɪˈkɒnəklæst/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "impecunious",
        "meaning": "adj. 贫困的，身无分文的",
        "phonetic": "/ˌɪmpɪˈkjuːniəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "intransigent",
        "meaning": "adj. 顽固的，不妥协的",
        "phonetic": "/ɪnˈtrænsɪdʒənt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "juxtapose",
        "meaning": "v. 并列，对比",
        "phonetic": "/ˌdʒʌkstəˈpəʊz/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "laconic",
        "meaning": "adj. 简洁的，言简意赅的",
        "phonetic": "/ləˈkɒnɪk/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "languid",
        "meaning": "adj. 倦怠的，无精打采的",
        "phonetic": "/ˈlæŋɡwɪd/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "laud",
        "meaning": "v. 赞美，称赞",
        "phonetic": "/lɔːd/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "lethargic",
        "meaning": "adj. 昏睡的，迟钝的",
        "phonetic": "/ləˈθɑːdʒɪk/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "lucid",
        "meaning": "adj. 清晰的，明白的",
        "phonetic": "/ˈluːsɪd/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "magnanimous",
        "meaning": "adj. 宽宏大量的",
        "phonetic": "/mæɡˈnænɪməs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "malevolent",
        "meaning": "adj. 恶意的，恶毒的",
        "phonetic": "/məˈlevələnt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "malleable",
        "meaning": "adj. 可塑的，易改变的",
        "phonetic": "/ˈmæliəbl/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "maverick",
        "meaning": "n. 特立独行的人",
        "phonetic": "/ˈmævərɪk/",
        "difficulty": 6,
        "category": "n",
        "examType": "gre"
    },
    {
        "word": "mendacious",
        "meaning": "adj. 虚假的，说谎的",
        "phonetic": "/menˈdeɪʃəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "mercurial",
        "meaning": "adj. 善变的，活泼的",
        "phonetic": "/mɜːˈkjʊəriəl/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "meticulous",
        "meaning": "adj. 细致的，一丝不苟的",
        "phonetic": "/məˈtɪkjələs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "mitigate",
        "meaning": "v. 减轻，缓解",
        "phonetic": "/ˈmɪtɪɡeɪt/",
        "difficulty": 6,
        "category": "v",
        "examType": "gre"
    },
    {
        "word": "morose",
        "meaning": "adj. 闷闷不乐的",
        "phonetic": "/məˈrəʊs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "mundane",
        "meaning": "adj. 平凡的，世俗的",
        "phonetic": "/mʌnˈdeɪn/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "nefarious",
        "meaning": "adj. 邪恶的，极坏的",
        "phonetic": "/nɪˈfeəriəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "negligible",
        "meaning": "adj. 可忽略的，微不足道的",
        "phonetic": "/ˈneɡlɪdʒəbl/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "nonchalant",
        "meaning": "adj. 冷淡的，漠不关心的",
        "phonetic": "/ˈnɒnʃələnt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "nostalgic",
        "meaning": "adj. 怀旧的，思乡的",
        "phonetic": "/nɒˈstældʒɪk/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "obdurate",
        "meaning": "adj. 顽固的，执拗的",
        "phonetic": "/ˈɒbdjərət/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "obsequious",
        "meaning": "adj. 谄媚的，奉承的",
        "phonetic": "/əbˈsiːkwiəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "obstinate",
        "meaning": "adj. 固执的，顽固的",
        "phonetic": "/ˈɒbstɪnət/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "obtuse",
        "meaning": "adj. 迟钝的，愚笨的",
        "phonetic": "/əbˈtjuːs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "ominous",
        "meaning": "adj. 不祥的，预兆的",
        "phonetic": "/ˈɒmɪnəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "opulent",
        "meaning": "adj. 富裕的，奢华的",
        "phonetic": "/ˈɒpjələnt/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "ostentatious",
        "meaning": "adj. 炫耀的，卖弄的",
        "phonetic": "/ˌɒstenˈteɪʃəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "palpable",
        "meaning": "adj. 明显的，可触知的",
        "phonetic": "/ˈpælpəbl/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "parsimonious",
        "meaning": "adj. 吝啬的，节俭的",
        "phonetic": "/ˌpɑːsɪˈməʊniəs/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    },
    {
        "word": "pedantic",
        "meaning": "adj. 学究式的，迂腐的",
        "phonetic": "/pɪˈdæntɪk/",
        "difficulty": 6,
        "category": "adj",
        "examType": "gre"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = greWords;
}

// 在浏览器环境中设置全局变量
if (typeof window !== 'undefined') {
    window.greWords = greWords;
    console.log(`📚 GRE词汇数据已加载，共 ${greWords.length} 个词汇`);
}