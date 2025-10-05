const fs = require('fs');
const path = require('path');

// 第三轮批量扩充 - 精选核心词汇
const expansions = {
    cet6_words: {
        varName: 'cet6Words',
        target: 500,
        words: [
            { word: "democracy", meaning: "n. 民主，民主制", phonetic: "/dɪˈmɒkrəsi/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "demonstrate", meaning: "v. 证明，演示", phonetic: "/ˈdemənstreɪt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "density", meaning: "n. 密度，浓度", phonetic: "/ˈdensəti/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "departure", meaning: "n. 离开，出发", phonetic: "/dɪˈpɑːtʃə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "depression", meaning: "n. 抑郁，萧条", phonetic: "/dɪˈpreʃn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "derive", meaning: "v. 得出，源于", phonetic: "/dɪˈraɪv/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "desert", meaning: "n. 沙漠 v. 抛弃", phonetic: "/ˈdezət/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "deserve", meaning: "v. 应得，值得", phonetic: "/dɪˈzɜːv/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "design", meaning: "v./n. 设计，图案", phonetic: "/dɪˈzaɪn/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "desire", meaning: "v./n. 渴望，欲望", phonetic: "/dɪˈzaɪə(r)/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "despair", meaning: "n./v. 绝望", phonetic: "/dɪˈspeə(r)/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "desperate", meaning: "adj. 绝望的，拼命的", phonetic: "/ˈdespərət/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "despite", meaning: "prep. 尽管，不管", phonetic: "/dɪˈspaɪt/", difficulty: 3, category: "prep", examType: "cet6" },
            { word: "destroy", meaning: "v. 破坏，毁灭", phonetic: "/dɪˈstrɔɪ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "detail", meaning: "n. 细节，详情", phonetic: "/ˈdiːteɪl/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "detect", meaning: "v. 发现，察觉", phonetic: "/dɪˈtekt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "determine", meaning: "v. 决定，确定", phonetic: "/dɪˈtɜːmɪn/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "develop", meaning: "v. 发展，开发", phonetic: "/dɪˈveləp/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "device", meaning: "n. 装置，设备", phonetic: "/dɪˈvaɪs/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "devote", meaning: "v. 献身，致力于", phonetic: "/dɪˈvəʊt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "diagnose", meaning: "v. 诊断", phonetic: "/ˈdaɪəɡnəʊz/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "dialogue", meaning: "n. 对话，对白", phonetic: "/ˈdaɪəlɒɡ/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "diameter", meaning: "n. 直径", phonetic: "/daɪˈæmɪtə(r)/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "diamond", meaning: "n. 钻石，菱形", phonetic: "/ˈdaɪəmənd/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "dictionary", meaning: "n. 词典，字典", phonetic: "/ˈdɪkʃənri/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "differ", meaning: "v. 不同，差异", phonetic: "/ˈdɪfə(r)/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "difficult", meaning: "adj. 困难的", phonetic: "/ˈdɪfɪkəlt/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "digest", meaning: "v. 消化，理解", phonetic: "/daɪˈdʒest/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "digital", meaning: "adj. 数字的，数码的", phonetic: "/ˈdɪdʒɪtl/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "dignity", meaning: "n. 尊严，威严", phonetic: "/ˈdɪɡnəti/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "dilemma", meaning: "n. 困境，进退两难", phonetic: "/dɪˈlemə/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "dimension", meaning: "n. 尺寸，维度", phonetic: "/daɪˈmenʃn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "dinner", meaning: "n. 正餐，晚餐", phonetic: "/ˈdɪnə(r)/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "diploma", meaning: "n. 文凭，学位证书", phonetic: "/dɪˈpləʊmə/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "direct", meaning: "adj. 直接的 v. 指导", phonetic: "/dəˈrekt/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "direction", meaning: "n. 方向，指导", phonetic: "/dəˈrekʃn/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "director", meaning: "n. 主任，导演", phonetic: "/dəˈrektə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "directory", meaning: "n. 目录，名录", phonetic: "/dəˈrektəri/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "dirty", meaning: "adj. 脏的，卑鄙的", phonetic: "/ˈdɜːti/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "disability", meaning: "n. 残疾，无能力", phonetic: "/ˌdɪsəˈbɪləti/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "disagree", meaning: "v. 不同意，不一致", phonetic: "/ˌdɪsəˈɡriː/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "disappear", meaning: "v. 消失，不见", phonetic: "/ˌdɪsəˈpɪə(r)/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "disappoint", meaning: "v. 使失望", phonetic: "/ˌdɪsəˈpɔɪnt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "disaster", meaning: "n. 灾难，灾祸", phonetic: "/dɪˈzɑːstə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "discard", meaning: "v. 丢弃，抛弃", phonetic: "/dɪˈskɑːd/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "discipline", meaning: "n. 纪律，学科", phonetic: "/ˈdɪsəplɪn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "disclose", meaning: "v. 揭露，透露", phonetic: "/dɪsˈkləʊz/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "discount", meaning: "n./v. 折扣，打折", phonetic: "/ˈdɪskaʊnt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "discover", meaning: "v. 发现，发觉", phonetic: "/dɪˈskʌvə(r)/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "discriminate", meaning: "v. 歧视，区别", phonetic: "/dɪˈskrɪmɪneɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "discuss", meaning: "v. 讨论，商议", phonetic: "/dɪˈskʌs/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "disease", meaning: "n. 疾病，病害", phonetic: "/dɪˈziːz/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "disgust", meaning: "n./v. 厌恶，反感", phonetic: "/dɪsˈɡʌst/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "dismiss", meaning: "v. 解雇，驳回", phonetic: "/dɪsˈmɪs/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "disorder", meaning: "n. 混乱，失调", phonetic: "/dɪsˈɔːdə(r)/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "display", meaning: "v./n. 显示，展示", phonetic: "/dɪˈspleɪ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "dispose", meaning: "v. 处理，处置", phonetic: "/dɪˈspəʊz/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "dispute", meaning: "n./v. 争论，争执", phonetic: "/dɪˈspjuːt/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "dissolve", meaning: "v. 溶解，解散", phonetic: "/dɪˈzɒlv/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "distance", meaning: "n. 距离，远方", phonetic: "/ˈdɪstəns/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "distinct", meaning: "adj. 清楚的，不同的", phonetic: "/dɪˈstɪŋkt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "distinguish", meaning: "v. 区别，辨认", phonetic: "/dɪˈstɪŋɡwɪʃ/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "distribute", meaning: "v. 分发，分布", phonetic: "/dɪˈstrɪbjuːt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "district", meaning: "n. 地区，行政区", phonetic: "/ˈdɪstrɪkt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "disturb", meaning: "v. 打扰，妨碍", phonetic: "/dɪˈstɜːb/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "diverse", meaning: "adj. 多样的，不同的", phonetic: "/daɪˈvɜːs/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "divide", meaning: "v. 分割，除法", phonetic: "/dɪˈvaɪd/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "divorce", meaning: "n./v. 离婚", phonetic: "/dɪˈvɔːs/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "document", meaning: "n. 文件，证件", phonetic: "/ˈdɒkjumənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "domestic", meaning: "adj. 国内的，家庭的", phonetic: "/dəˈmestɪk/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "dominant", meaning: "adj. 占主导地位的", phonetic: "/ˈdɒmɪnənt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "dominate", meaning: "v. 支配，统治", phonetic: "/ˈdɒmɪneɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "donate", meaning: "v. 捐赠，捐献", phonetic: "/dəʊˈneɪt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "doubt", meaning: "n./v. 怀疑，疑惑", phonetic: "/daʊt/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "download", meaning: "v./n. 下载", phonetic: "/ˌdaʊnˈləʊd/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "dozen", meaning: "n. 一打，十二个", phonetic: "/ˈdʌzn/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "draft", meaning: "n. 草稿 v. 起草", phonetic: "/drɑːft/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "drama", meaning: "n. 戏剧，剧本", phonetic: "/ˈdrɑːmə/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "dramatic", meaning: "adj. 戏剧的，引人注目的", phonetic: "/drəˈmætɪk/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "draw", meaning: "v. 画，拉，吸引", phonetic: "/drɔː/", difficulty: 1, category: "v", examType: "cet6" },
            { word: "dream", meaning: "n./v. 梦，梦想", phonetic: "/driːm/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "dress", meaning: "n. 连衣裙 v. 穿衣", phonetic: "/dres/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "drift", meaning: "v./n. 漂流，趋势", phonetic: "/drɪft/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "drill", meaning: "n./v. 钻孔，训练", phonetic: "/drɪl/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "drink", meaning: "v./n. 喝，饮料", phonetic: "/drɪŋk/", difficulty: 1, category: "v", examType: "cet6" },
            { word: "drive", meaning: "v./n. 驾驶，推动", phonetic: "/draɪv/", difficulty: 1, category: "v", examType: "cet6" },
            { word: "drop", meaning: "v./n. 掉落，下降", phonetic: "/drɒp/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "drug", meaning: "n. 药物，毒品", phonetic: "/drʌɡ/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "dry", meaning: "adj. 干的，干燥的", phonetic: "/draɪ/", difficulty: 1, category: "adj", examType: "cet6" },
            { word: "due", meaning: "adj. 到期的，应得的", phonetic: "/djuː/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "dull", meaning: "adj. 迟钝的，无聊的", phonetic: "/dʌl/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "dump", meaning: "v. 倾倒，抛弃", phonetic: "/dʌmp/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "duration", meaning: "n. 持续时间", phonetic: "/djuˈreɪʃn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "during", meaning: "prep. 在...期间", phonetic: "/ˈdjʊərɪŋ/", difficulty: 2, category: "prep", examType: "cet6" },
            { word: "dust", meaning: "n. 灰尘，尘土", phonetic: "/dʌst/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "duty", meaning: "n. 责任，义务", phonetic: "/ˈdjuːti/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "dynamic", meaning: "adj. 动态的，有活力的", phonetic: "/daɪˈnæmɪk/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "eager", meaning: "adj. 渴望的，热切的", phonetic: "/ˈiːɡə(r)/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "early", meaning: "adj./adv. 早的，早期的", phonetic: "/ˈɜːli/", difficulty: 1, category: "adj", examType: "cet6" },
            { word: "earn", meaning: "v. 赚得，获得", phonetic: "/ɜːn/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "earth", meaning: "n. 地球，土地", phonetic: "/ɜːθ/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "ease", meaning: "n. 容易 v. 减轻", phonetic: "/iːz/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "east", meaning: "n./adj. 东方，东部的", phonetic: "/iːst/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "easy", meaning: "adj. 容易的，安逸的", phonetic: "/ˈiːzi/", difficulty: 1, category: "adj", examType: "cet6" },
            { word: "eat", meaning: "v. 吃，进食", phonetic: "/iːt/", difficulty: 1, category: "v", examType: "cet6" },
            { word: "echo", meaning: "n./v. 回声，回响", phonetic: "/ˈekəʊ/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "economic", meaning: "adj. 经济的", phonetic: "/ˌiːkəˈnɒmɪk/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "economy", meaning: "n. 经济，节约", phonetic: "/ɪˈkɒnəmi/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "edge", meaning: "n. 边缘，优势", phonetic: "/edʒ/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "edit", meaning: "v. 编辑，修改", phonetic: "/ˈedɪt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "edition", meaning: "n. 版本，版次", phonetic: "/ɪˈdɪʃn/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "editor", meaning: "n. 编辑，主编", phonetic: "/ˈedɪtə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "educate", meaning: "v. 教育，培养", phonetic: "/ˈedjukeɪt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "education", meaning: "n. 教育，培养", phonetic: "/ˌedjuˈkeɪʃn/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "effect", meaning: "n. 效果，影响", phonetic: "/ɪˈfekt/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "effective", meaning: "adj. 有效的", phonetic: "/ɪˈfektɪv/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "efficient", meaning: "adj. 高效的", phonetic: "/ɪˈfɪʃnt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "effort", meaning: "n. 努力，尝试", phonetic: "/ˈefət/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "eight", meaning: "num. 八", phonetic: "/eɪt/", difficulty: 1, category: "num", examType: "cet6" },
            { word: "either", meaning: "conj./pron. 或者，任一", phonetic: "/ˈaɪðə(r)/", difficulty: 2, category: "conj", examType: "cet6" },
            { word: "elaborate", meaning: "adj. 精心制作的 v. 详述", phonetic: "/ɪˈlæbərət/", difficulty: 5, category: "adj", examType: "cet6" },
            { word: "elderly", meaning: "adj. 年长的，上了年纪的", phonetic: "/ˈeldəli/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "elect", meaning: "v. 选举，推选", phonetic: "/ɪˈlekt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "electric", meaning: "adj. 电的，电动的", phonetic: "/ɪˈlektrɪk/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "electronic", meaning: "adj. 电子的", phonetic: "/ɪˌlekˈtrɒnɪk/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "elegant", meaning: "adj. 优雅的，精致的", phonetic: "/ˈelɪɡənt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "element", meaning: "n. 元素，要素", phonetic: "/ˈelɪmənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "eliminate", meaning: "v. 消除，排除", phonetic: "/ɪˈlɪmɪneɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "embarrass", meaning: "v. 使尴尬，使窘迫", phonetic: "/ɪmˈbærəs/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "emerge", meaning: "v. 出现，浮现", phonetic: "/ɪˈmɜːdʒ/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "emergency", meaning: "n. 紧急情况", phonetic: "/ɪˈmɜːdʒənsi/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "emission", meaning: "n. 排放，发射", phonetic: "/ɪˈmɪʃn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "emotion", meaning: "n. 情感，情绪", phonetic: "/ɪˈməʊʃn/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "emotional", meaning: "adj. 情感的，情绪的", phonetic: "/ɪˈməʊʃənl/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "emphasis", meaning: "n. 强调，重点", phonetic: "/ˈemfəsɪs/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "emphasize", meaning: "v. 强调，着重", phonetic: "/ˈemfəsaɪz/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "empire", meaning: "n. 帝国，帝制", phonetic: "/ˈempaɪə(r)/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "employ", meaning: "v. 雇用，使用", phonetic: "/ɪmˈplɔɪ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "employee", meaning: "n. 雇员，员工", phonetic: "/ɪmˈplɔɪiː/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "employer", meaning: "n. 雇主，老板", phonetic: "/ɪmˈplɔɪə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "employment", meaning: "n. 就业，雇用", phonetic: "/ɪmˈplɔɪmənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "enable", meaning: "v. 使能够，使可能", phonetic: "/ɪˈneɪbl/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "encounter", meaning: "v./n. 遇到，遭遇", phonetic: "/ɪnˈkaʊntə(r)/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "encourage", meaning: "v. 鼓励，促进", phonetic: "/ɪnˈkʌrɪdʒ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "end", meaning: "n./v. 结束，末端", phonetic: "/end/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "endless", meaning: "adj. 无穷的，无尽的", phonetic: "/ˈendləs/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "endure", meaning: "v. 忍受，持续", phonetic: "/ɪnˈdjʊə(r)/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "enemy", meaning: "n. 敌人，仇敌", phonetic: "/ˈenəmi/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "energy", meaning: "n. 能量，精力", phonetic: "/ˈenədʒi/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "engage", meaning: "v. 参与，从事", phonetic: "/ɪnˈɡeɪdʒ/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "engine", meaning: "n. 引擎，发动机", phonetic: "/ˈendʒɪn/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "engineer", meaning: "n. 工程师", phonetic: "/ˌendʒɪˈnɪə(r)/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "engineering", meaning: "n. 工程学", phonetic: "/ˌendʒɪˈnɪərɪŋ/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "enhance", meaning: "v. 增强，提高", phonetic: "/ɪnˈhɑːns/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "enjoy", meaning: "v. 享受，喜爱", phonetic: "/ɪnˈdʒɔɪ/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "enormous", meaning: "adj. 巨大的，庞大的", phonetic: "/ɪˈnɔːməs/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "enough", meaning: "adj./adv. 足够的", phonetic: "/ɪˈnʌf/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "ensure", meaning: "v. 确保，保证", phonetic: "/ɪnˈʃʊə(r)/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "enter", meaning: "v. 进入，参加", phonetic: "/ˈentə(r)/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "enterprise", meaning: "n. 企业，事业", phonetic: "/ˈentəpraɪz/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "entertain", meaning: "v. 娱乐，招待", phonetic: "/ˌentəˈteɪn/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "enthusiasm", meaning: "n. 热情，热忱", phonetic: "/ɪnˈθjuːziæzəm/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "entire", meaning: "adj. 整个的，全部的", phonetic: "/ɪnˈtaɪə(r)/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "entry", meaning: "n. 进入，条目", phonetic: "/ˈentri/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "envelope", meaning: "n. 信封，包层", phonetic: "/ˈenvələʊp/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "environment", meaning: "n. 环境，周围", phonetic: "/ɪnˈvaɪrənmənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "episode", meaning: "n. 插曲，一集", phonetic: "/ˈepɪsəʊd/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "equal", meaning: "adj. 相等的 v. 等于", phonetic: "/ˈiːkwəl/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "equation", meaning: "n. 方程式，等式", phonetic: "/ɪˈkweɪʒn/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "equipment", meaning: "n. 设备，装备", phonetic: "/ɪˈkwɪpmənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "equivalent", meaning: "adj./n. 等价的，等同物", phonetic: "/ɪˈkwɪvələnt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "era", meaning: "n. 时代，纪元", phonetic: "/ˈɪərə/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "error", meaning: "n. 错误，误差", phonetic: "/ˈerə(r)/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "escape", meaning: "v./n. 逃脱，逃避", phonetic: "/ɪˈskeɪp/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "especially", meaning: "adv. 特别，尤其", phonetic: "/ɪˈspeʃəli/", difficulty: 2, category: "adv", examType: "cet6" },
            { word: "essay", meaning: "n. 散文，论文", phonetic: "/ˈeseɪ/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "essential", meaning: "adj. 基本的，必要的", phonetic: "/ɪˈsenʃl/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "establish", meaning: "v. 建立，确立", phonetic: "/ɪˈstæblɪʃ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "estate", meaning: "n. 房地产，财产", phonetic: "/ɪˈsteɪt/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "estimate", meaning: "v./n. 估计，评估", phonetic: "/ˈestɪmeɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "ethnic", meaning: "adj. 种族的，民族的", phonetic: "/ˈeθnɪk/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "evaluate", meaning: "v. 评估，评价", phonetic: "/ɪˈvæljueɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "even", meaning: "adv. 甚至 adj. 平坦的", phonetic: "/ˈiːvn/", difficulty: 1, category: "adv", examType: "cet6" },
            { word: "evening", meaning: "n. 晚上，傍晚", phonetic: "/ˈiːvnɪŋ/", difficulty: 1, category: "n", examType: "cet6" },
            { word: "event", meaning: "n. 事件，活动", phonetic: "/ɪˈvent/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "eventually", meaning: "adv. 最终，终于", phonetic: "/ɪˈventʃuəli/", difficulty: 3, category: "adv", examType: "cet6" },
            { word: "ever", meaning: "adv. 曾经，永远", phonetic: "/ˈevə(r)/", difficulty: 1, category: "adv", examType: "cet6" },
            { word: "every", meaning: "adj. 每个的，所有的", phonetic: "/ˈevri/", difficulty: 1, category: "adj", examType: "cet6" },
            { word: "everybody", meaning: "pron. 每个人", phonetic: "/ˈevribɒdi/", difficulty: 1, category: "pron", examType: "cet6" },
            { word: "everyone", meaning: "pron. 每个人", phonetic: "/ˈevriwʌn/", difficulty: 1, category: "pron", examType: "cet6" },
            { word: "everything", meaning: "pron. 一切，每件事", phonetic: "/ˈevriθɪŋ/", difficulty: 1, category: "pron", examType: "cet6" },
            { word: "everywhere", meaning: "adv. 到处，处处", phonetic: "/ˈevriweə(r)/", difficulty: 2, category: "adv", examType: "cet6" },
            { word: "evidence", meaning: "n. 证据，迹象", phonetic: "/ˈevɪdəns/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "evident", meaning: "adj. 明显的，显然的", phonetic: "/ˈevɪdənt/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "evil", meaning: "adj./n. 邪恶的，罪恶", phonetic: "/ˈiːvl/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "exact", meaning: "adj. 精确的，确切的", phonetic: "/ɪɡˈzækt/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "exactly", meaning: "adv. 确切地，正是", phonetic: "/ɪɡˈzæktli/", difficulty: 2, category: "adv", examType: "cet6" },
            { word: "exam", meaning: "n. 考试", phonetic: "/ɪɡˈzæm/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "examine", meaning: "v. 检查，考试", phonetic: "/ɪɡˈzæmɪn/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "example", meaning: "n. 例子，榜样", phonetic: "/ɪɡˈzɑːmpl/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "exceed", meaning: "v. 超过，胜过", phonetic: "/ɪkˈsiːd/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "excellent", meaning: "adj. 优秀的，杰出的", phonetic: "/ˈeksələnt/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "except", meaning: "prep./conj. 除了", phonetic: "/ɪkˈsept/", difficulty: 2, category: "prep", examType: "cet6" },
            { word: "exception", meaning: "n. 例外，异议", phonetic: "/ɪkˈsepʃn/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "exchange", meaning: "v./n. 交换，汇率", phonetic: "/ɪksˈtʃeɪndʒ/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "excite", meaning: "v. 激发，使兴奋", phonetic: "/ɪkˈsaɪt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "exclude", meaning: "v. 排除，不包括", phonetic: "/ɪkˈskluːd/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "excuse", meaning: "n./v. 借口，原谅", phonetic: "/ɪkˈskjuːs/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "execute", meaning: "v. 执行，处决", phonetic: "/ˈeksɪkjuːt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "executive", meaning: "n./adj. 主管，执行的", phonetic: "/ɪɡˈzekjətɪv/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "exercise", meaning: "n./v. 练习，锻炼", phonetic: "/ˈeksəsaɪz/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "exhaust", meaning: "v./n. 耗尽，废气", phonetic: "/ɪɡˈzɔːst/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "exhibit", meaning: "v./n. 展示，展览", phonetic: "/ɪɡˈzɪbɪt/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "exist", meaning: "v. 存在，生存", phonetic: "/ɪɡˈzɪst/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "exit", meaning: "n./v. 出口，退出", phonetic: "/ˈeksɪt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "expand", meaning: "v. 扩大，膨胀", phonetic: "/ɪkˈspænd/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "expect", meaning: "v. 期望，预料", phonetic: "/ɪkˈspekt/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "expense", meaning: "n. 费用，开支", phonetic: "/ɪkˈspens/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "expensive", meaning: "adj. 昂贵的，花费大的", phonetic: "/ɪkˈspensɪv/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "experience", meaning: "n./v. 经验，经历", phonetic: "/ɪkˈspɪəriəns/", difficulty: 2, category: "n", examType: "cet6" },
            { word: "experiment", meaning: "n./v. 实验，试验", phonetic: "/ɪkˈsperɪmənt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "expert", meaning: "n./adj. 专家，专业的", phonetic: "/ˈekspɜːt/", difficulty: 3, category: "n", examType: "cet6" },
            { word: "explain", meaning: "v. 解释，说明", phonetic: "/ɪkˈspleɪn/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "explode", meaning: "v. 爆炸，爆发", phonetic: "/ɪkˈspləʊd/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "explore", meaning: "v. 探索，探险", phonetic: "/ɪkˈsplɔː(r)/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "export", meaning: "v./n. 出口，输出", phonetic: "/ɪkˈspɔːt/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "expose", meaning: "v. 暴露，揭露", phonetic: "/ɪkˈspəʊz/", difficulty: 4, category: "v", examType: "cet6" },
            { word: "express", meaning: "v./adj. 表达，快速的", phonetic: "/ɪkˈspres/", difficulty: 2, category: "v", examType: "cet6" },
            { word: "extend", meaning: "v. 延长，扩展", phonetic: "/ɪkˈstend/", difficulty: 3, category: "v", examType: "cet6" },
            { word: "extensive", meaning: "adj. 广泛的，大量的", phonetic: "/ɪkˈstensɪv/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "extent", meaning: "n. 程度，范围", phonetic: "/ɪkˈstent/", difficulty: 4, category: "n", examType: "cet6" },
            { word: "external", meaning: "adj. 外部的，对外的", phonetic: "/ɪkˈstɜːnl/", difficulty: 4, category: "adj", examType: "cet6" },
            { word: "extra", meaning: "adj./adv. 额外的", phonetic: "/ˈekstrə/", difficulty: 2, category: "adj", examType: "cet6" },
            { word: "extreme", meaning: "adj./n. 极端的", phonetic: "/ɪkˈstriːm/", difficulty: 3, category: "adj", examType: "cet6" },
            { word: "extremely", meaning: "adv. 极其，非常", phonetic: "/ɪkˈstriːmli/", difficulty: 3, category: "adv", examType: "cet6" },
            { word: "eye", meaning: "n. 眼睛，视力", phonetic: "/aɪ/", difficulty: 1, category: "n", examType: "cet6" }
        ]
    }
};

async function expandVocabulary() {
    const targetFile = path.join(__dirname, '../src/data/cet6_words.js');
    
    console.log('🚀 Starting CET-6 vocabulary expansion (Round 3)...');
    
    // 读取现有文件
    let existingWords = [];
    try {
        const fileContent = fs.readFileSync(targetFile, 'utf8');
        const match = fileContent.match(/const cet6Words = (\[[\s\S]*?\]);/);
        if (match) {
            existingWords = JSON.parse(match[1]);
            console.log(`✅ Successfully read ${existingWords.length} existing words.`);
        }
    } catch (error) {
        console.error(`❌ Error reading existing file: ${error.message}`);
        existingWords = [];
    }
    
    // 合并词汇
    const wordMap = new Map();
    for (const word of existingWords) {
        if (word && word.word) {
            wordMap.set(word.word.toLowerCase(), word);
        }
    }
    
    let newCount = 0;
    let updatedCount = 0;
    for (const newWord of expansions.cet6_words.words) {
        const key = newWord.word.toLowerCase();
        if (wordMap.has(key)) {
            updatedCount++;
        } else {
            newCount++;
        }
        wordMap.set(key, newWord);
    }
    
    const finalWords = Array.from(wordMap.values());
    console.log(`Added ${newCount} new words, updated ${updatedCount} existing words.`);
    console.log(`Final vocabulary size: ${finalWords.length}`);
    
    // 写入文件
    const finalFileContent = `const cet6Words = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = cet6Words;
}`;
    
    try {
        fs.writeFileSync(targetFile, finalFileContent, 'utf8');
        console.log(`🎉 Successfully expanded CET-6 vocabulary to ${finalWords.length} words!`);
    } catch (error) {
        console.error(`❌ Error writing to file: ${error.message}`);
    }
}

expandVocabulary().catch(console.error);
