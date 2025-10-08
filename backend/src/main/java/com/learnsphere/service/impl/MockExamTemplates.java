package com.learnsphere.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class MockExamTemplates {
    private static final Random random = new Random();

    public static Map<String, Object> getRandomTemplate() {
        int index = random.nextInt(3);
        return switch (index) {
            case 0 -> getTechnologyTemplate();
            case 1 -> getCultureTemplate();
            default -> getEnvironmentTemplate();
        };
    }

    // Template 1: Technology & AI (The original Environment one is
    // replaced/renamed)
    private static Map<String, Object> getTechnologyTemplate() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();
        result.put("templateName", "科技与未来");
        int idCounter = 1;

        // Writing
        Map<String, Object> writing = new HashMap<>();
        writing.put("id", idCounter++);
        writing.put("section", "Part I Writing");
        writing.put("type", "essay");
        writing.put("text",
                "Directions: For this part, you are allowed 30 minutes to write an essay on 'Artificial Intelligence'. You should write at least 120 words.\n\n1. The development of AI\n2. The pros and cons of AI\n3. Your attitude towards AI");
        writing.put("options", new ArrayList<>());
        questions.add(writing);

        // Listening 1
        String audio1 = "M: Have you seen the latest smartphone release?\nW: Yes, the camera features are incredible.\nM: I agree, but the price is too high.\nW: Technology is getting expensive.";
        String[][] q1 = {
                { "Q1: What are they discussing?", "Smartphones,Cameras,Computers,Cars", "0",
                        "Discussing smartphone release" },
                { "Q2: What does the woman like?", "The price,The screen,The camera,The battery", "2",
                        "Camera features are incredible" },
                { "Q3: What is the man's concern?", "Availability,Size,Price,Color", "2", "Price is too high" },
                { "Q4: What is getting expensive?", "Food,Technology,Housing,Travel", "1",
                        "Technology is getting expensive" },
                { "Q5: What will they likely do?", "Buy it,Wait for discount,Ignore it,Complaint", "1",
                        "Implied waiting due to price" }
        };
        addListeningGroup(questions, idCounter, audio1, q1);
        idCounter += 5;

        // Listening 2
        String audio2 = "W: Professor, can robots replace teachers?\nM: They can assist, but not replace human empathy.\nW: I worry about job security.\nM: We must adapt and learn new skills.";
        String[][] q2 = {
                { "Q6: What is the topic?", "Robots in education,Robots in factories,Medical robots,Space robots", "0",
                        "Robots replace teachers" },
                { "Q7: What can robots not replace?", "Knowledge,Speed,Empathy,Calculation", "2", "Human empathy" },
                { "Q8: What does the woman worry about?", "Grades,Job security,Homework,Tuition", "1", "Job security" },
                { "Q9: What is the solution?", "Stop technology,Learn new skills,Protest,Give up", "1",
                        "Adapt and learn new skills" },
                { "Q10: Who is the man?", "Student,Engineer,Professor,Doctor", "2", "Addressed as Professor" }
        };
        addListeningGroup(questions, idCounter, audio2, q2);
        idCounter += 5;

        // Reading 1
        String pass1 = "Artificial Intelligence (AI) is transforming industries. From healthcare to finance, AI algorithms are analyzing data faster than humans. However, ethical concerns regarding privacy and bias remain significant challenges.";
        String[][] r1 = {
                { "Q11: What is AI checking?", "Industries,Data,Humans,Robots", "1", "Analyzing data" },
                { "Q12: Which industry is mentioned?", "Agriculture,Healthcare,Mining,Construction", "1",
                        "Healthcare" },
                { "Q13: What is faster than humans?", "AI algorithms,Computers,Internet,Data", "0", "AI algorithms" },
                { "Q14: What is a concern?", "Speed,Cost,Privacy,Power", "2", "Privacy and bias" },
                { "Q15: What is the main idea?", "AI is bad,AI is slow,AI is transforming,AI is expensive", "2",
                        "AI is transforming industries" }
        };
        addReadingGroup(questions, idCounter, pass1, r1);
        idCounter += 5;

        // Reading 2
        String pass2 = "Virtual Reality (VR) offers immersive experiences. It is widely used in gaming, but its potential in education and training is vast. Medical students use VR to practice surgeries without risk.";
        String[][] r2 = {
                { "Q16: What does VR offer?", "Cheap games,Immersive experiences,Fast internet,Better screens", "1",
                        "Immersive experiences" },
                { "Q17: Where is it widely used?", "Cooking,Gaming,Driving,Sleeping", "1", "Gaming" },
                { "Q18: What is a potential field?", "Education,Farming,Fishing,Cooking", "0",
                        "Education and training" },
                { "Q19: Who uses VR for practice?", "Drivers,Pilots,Medical students,Chefs", "2", "Medical students" },
                { "Q20: What is the benefit in medicine?", "Lower cost,No risk,Faster recovery,Better tools", "1",
                        "Practice without risk" }
        };
        addReadingGroup(questions, idCounter, pass2, r2);
        idCounter += 5;

        // Reading 3
        String pass3 = "5G technology promises faster connectivity. It supports the Internet of Things (IoT), allowing devices to communicate seamlessly. This will revolutionize smart cities and autonomous driving.";
        String[][] r3 = {
                { "Q21: What does 5G promise?", "Cheaper phones,Faster connectivity,Better cameras,Longer battery", "1",
                        "Faster connectivity" },
                { "Q22: What does it support?", "IoT,AI,VR,AR", "0", "Internet of Things" },
                { "Q23: What allows seamless communication?", "Cables,Devices,Satellites,Humans", "1", "Devices" },
                { "Q24: What will be revolutionized?", "Smart cities,Schools,Hospitals,Parks", "0", "Smart cities" },
                { "Q25: What else is mentioned?", "Flying cars,Autonomous driving,Space travel,Time travel", "1",
                        "Autonomous driving" }
        };
        addReadingGroup(questions, idCounter, pass3, r3);
        idCounter += 5;

        // Translation
        Map<String, Object> trans = new HashMap<>();
        trans.put("id", idCounter++);
        trans.put("section", "Part IV Translation");
        trans.put("type", "translation");
        trans.put("text",
                "Directions: Translate.\n\n随着科技的发展，我们的生活发生了巨大的变化。智能手机和互联网让我们随时随地都能获取信息。然而，我们也应该注意保护个人隐私，避免过度依赖技术。");
        trans.put("options", new ArrayList<>());
        trans.put("explanation", "With the development of technology, our lives have changed specifically...");
        questions.add(trans);

        result.put("questions", questions);
        return result;
    }

    // Template 2: Culture & History
    private static Map<String, Object> getCultureTemplate() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();
        result.put("templateName", "文化与历史");
        int idCounter = 1;

        // Writing
        Map<String, Object> writing = new HashMap<>();
        writing.put("id", idCounter++);
        writing.put("section", "Part I Writing");
        writing.put("type", "essay");
        writing.put("text",
                "Directions: Write an essay on 'Traditional Culture'.\n\n1. The value of traditional culture\n2. How to protect it\n3. Conclusion");
        writing.put("options", new ArrayList<>());
        questions.add(writing);

        // Listening 1
        String audio1 = "M: I visited the museum yesterday. The ancient pottery was fascinating.\nW: I love history. Did you see the jade exhibition?\nM: Yes, it was crowded but worth it.\nW: I plan to go this weekend.";
        String[][] q1 = {
                { "Q1: Where did the man go?", "Park,Library,Museum,Cinema", "2", "Visited the museum" },
                { "Q2: What was fascinating?", "Paintings,Pottery,Statues,Jewelry", "1", "Ancient pottery" },
                { "Q3: What does the woman love?", "Art,History,Music,Science", "1", "I love history" },
                { "Q4: How was the exhibition?", "Empty,Quiet,Crowded,Closed", "2", "It was crowded" },
                { "Q5: When will the woman go?", "Today,Tomorrow,This weekend,Next week", "2", "Go this weekend" }
        };
        addListeningGroup(questions, idCounter, audio1, q1);
        idCounter += 5;

        // Listening 2
        String audio2 = "W: The Spring Festival is coming. Are you going home?\nM: Yes, I booked my train ticket. I miss my mother's dumplings.\nW: Traditional festivals are important for family reunion.\nM: Absolutely.";
        String[][] q2 = {
                { "Q6: What festival is coming?", "Christmas,Spring Festival,Mid-Autumn Day,National Day", "1",
                        "Spring Festival" },
                { "Q7: How is the man traveling?", "Plane,Bus,Train,Car", "2", "Train ticket" },
                { "Q8: What does he miss?", "Fireworks,Dumplings,Red packets,Friends", "1", "Mother's dumplings" },
                { "Q9: What are festivals important for?", "Shopping,Travel,Family reunion,Rest", "2",
                        "Family reunion" },
                { "Q10: Does the man agree?", "Yes,No,Maybe,Not sure", "0", "Absolutely" }
        };
        addListeningGroup(questions, idCounter, audio2, q2);
        idCounter += 5;

        // Reading 1 (Tea Culture)
        String pass1 = "Tea has a long history in China. It is not just a drink but a cultural symbol. The art of tea making involves selecting water, controlling temperature, and using the right tea set. It represents harmony and tranquility.";
        String[][] r1 = {
                { "Q11: What is tea in China?", "Just a drink,Cultural symbol,Medicine,Food", "1", "Cultural symbol" },
                { "Q12: What is involved in tea making?", "Adding sugar,Selecting water,Growing leaves,Selling tea",
                        "1", "Selecting water" },
                { "Q13: What else is important?", "Temperature,Time,Location,Weather", "0", "Controlling temperature" },
                { "Q14: What does it represent?", "Wealth,Power,Harmony,Speed", "2", "Harmony and tranquility" },
                { "Q15: Does tea have a history?", "Short,Long,No,Unknown", "1", "Long history" }
        };
        addReadingGroup(questions, idCounter, pass1, r1);
        idCounter += 5;

        // Reading 2 (Great Wall)
        String pass2 = "The Great Wall is one of the wonders of the world. It was built to protect the empire from invasions. Today, it is a symbol of Chinese strength and perseverance, attracting millions of tourists.";
        String[][] r2 = {
                { "Q16: What is the Great Wall?", "A house,A road,A wonder,A bridge", "2", "Wonder of the world" },
                { "Q17: Why was it built?", "Trade,Protection,Tourism,Housing", "1", "Protect from invasions" },
                { "Q18: What does it symbolize?", "Wealth,Strength,Peace,Art", "1", "Strength and perseverance" },
                { "Q19: Who visits it?", "Soldiers,Tourists,Farmers,Students", "1", "Millions of tourists" },
                { "Q20: Is it famous?", "Yes,No,Maybe,Only in China", "0", "Implied by wonders and millions" }
        };
        addReadingGroup(questions, idCounter, pass2, r2);
        idCounter += 5;

        // Reading 3 (Classical Music)
        String pass3 = "Classical music uses acoustic instruments like the violin and piano. It follows strict structural forms. Listening to classical music can relax the mind and improve concentration.";
        String[][] r3 = {
                { "Q21: What instruments are used?", "Electric guitar,Drums,Violin and piano,Synthesizer", "2",
                        "Violin and piano" },
                { "Q22: What forms does it follow?", "Free,Strict,Random,Simple", "1", "Strict structural forms" },
                { "Q23: What can it do to the mind?", "Excite,Relax,Confuse,Sleep", "1", "Relax the mind" },
                { "Q24: What can it improve?", "Speed,Concentration,Hunger,Strength", "1", "Improve concentration" },
                { "Q25: Is it modern?", "Yes,No,Partly,Unknown", "1",
                        "Classical implies traditional/old style usually" }
        };
        addReadingGroup(questions, idCounter, pass3, r3);
        idCounter += 5;

        // Translation
        Map<String, Object> trans = new HashMap<>();
        trans.put("id", idCounter++);
        trans.put("section", "Part IV Translation");
        trans.put("type", "translation");
        trans.put("text",
                "Directions: Translate.\n\n京剧（Peking Opera）是中国最著名的戏曲形式之一。它结合了音乐、歌唱、哑剧、舞蹈和杂技。演员脸上的彩绘代表了角色的性格和命运。");
        trans.put("options", new ArrayList<>());
        trans.put("explanation", "Peking Opera is one of the most famous...");
        questions.add(trans);

        result.put("questions", questions);
        return result;
    }

    // Template 3: Environment & Society (The original one, slightly modified)
    private static Map<String, Object> getEnvironmentTemplate() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();
        result.put("templateName", "环境与社会");
        int idCounter = 1;

        // Writing
        Map<String, Object> writing = new HashMap<>();
        writing.put("id", idCounter++);
        writing.put("section", "Part I Writing");
        writing.put("type", "essay");
        writing.put("text",
                "Directions: Write an essay on 'Environmental Protection'.\n\n1. Current environmental problems\n2. Importance of protection\n3. Actions we can take");
        writing.put("options", new ArrayList<>());
        questions.add(writing);

        // Listening 1
        String audio1 = "M: The smog is terrible today.\nW: Yes, I had to wear a mask.\nM: Pollution is a serious issue in big cities.\nW: We need more green energy.";
        String[][] q1 = {
                { "Q1: What is the weather like?", "Sunny,Rainy,Smoggy,Snowy", "2", "Smog is terrible" },
                { "Q2: What did the woman wear?", "Hat,Mask,Scarf,Glasses", "1", "Wear a mask" },
                { "Q3: What is the issue?", "Traffic,Crime,Pollution,Noise", "2", "Pollution" },
                { "Q4: Where is it serious?", "Villages,Big cities,Islands,Mountains", "1", "Big cities" },
                { "Q5: What is needed?", "More cars,More factories,Green energy,More people", "2", "Green energy" }
        };
        addListeningGroup(questions, idCounter, audio1, q1);
        idCounter += 5;

        // Listening 2
        String audio2 = "W: Did you join the volunteer work yesterday?\nM: Yes, we cleaned up the beach. It was tiring but rewarding.\nW: How much trash did you collect?\nM: Over 50 bags. Mostly plastic bottles.";
        String[][] q2 = {
                { "Q6: What did the man do?", "Worked,Studied,Volunteered,Played", "2", "Volunteer work" },
                { "Q7: Where was it?", "Park,Street,Beach,School", "2", "Cleaned up the beach" },
                { "Q8: How did he feel?", "Bored,Tired but rewarded,Sad,Angry", "1", "Tiring but rewarding" },
                { "Q9: What did they collect?", "Money,Clothes,Trash,Food", "2", "Trash (plastic bottles)" },
                { "Q10: How much?", "10 bags,20 bags,50 bags,100 bags", "2", "Over 50 bags" }
        };
        addListeningGroup(questions, idCounter, audio2, q2);
        idCounter += 5;

        // Reading 1 (Renewable Energy)
        String pass1 = "Renewable energy comes from sources that replace themselves naturally, such as sunlight, wind, and rain. Unlike fossil fuels, they do not produce harmful greenhouse gases. Switching to renewables is key to fighting climate change.";
        String[][] r1 = {
                { "Q11: What is a source?", "Coal,Oil,Sunlight,Gas", "2", "Sunlight, wind, rain" },
                { "Q12: Is it natural?", "Yes,No,Partly,Unknown", "0", "Replace themselves naturally" },
                { "Q13: What produces harmful gases?", "Sun,Wind,Fossil fuels,Rain", "2", "Unlike fossil fuels..." },
                { "Q14: What is the goal?", "Make money,Fight climate change,Build factories,Use oil", "1",
                        "Fighting climate change" },
                { "Q15: What is the key?", "Switching to renewables,Using coal,Driving cars,Cutting trees", "0",
                        "Switching to renewables" }
        };
        addReadingGroup(questions, idCounter, pass1, r1);
        idCounter += 5;

        // Reading 2 (Plastic Pollution)
        String pass2 = "Plastic pollution harms marine life. Turtles and fish often mistake plastic for food. Microplastics have been found in the deepest parts of the ocean. Reducing single-use plastic is the most effective solution.";
        String[][] r2 = {
                { "Q16: What does plastic harm?", "Birds,Marine life,Insects,Plants", "1", "Harms marine life" },
                { "Q17: What do animals mistake it for?", "Toys,Food,Water,Shelter", "1", "Mistake plastic for food" },
                { "Q18: Where are microplastics found?", "Air,Land,Deep ocean,Space", "2",
                        "Deepest parts of the ocean" },
                { "Q19: What is the solution?", "Recycling,Burning,Reducing single-use,Burying", "2",
                        "Reducing single-use plastic" },
                { "Q20: Is it a problem?", "Yes,No,Maybe,Only for fish", "0", "Implied harm" }
        };
        addReadingGroup(questions, idCounter, pass2, r2);
        idCounter += 5;

        // Reading 3 (Sustainable Agriculture)
        String pass3 = "Sustainable agriculture aims to produce food without damaging the environment. It involves using organic fertilizers and conserving water. This ensures that future generations can also farm the land.";
        String[][] r3 = {
                { "Q21: What is the aim?", "Make money,Produce food safely,Use chemicals,Expand land", "1",
                        "Without damaging environment" },
                { "Q22: What fertilizer is used?", "Chemical,Organic,Synthetic,None", "1", "Organic fertilizers" },
                { "Q23: What is conserved?", "Money,Time,Water,Seeds", "2", "Conserving water" },
                { "Q24: Who benefits?", "Farmers,Future generations,Animals,Machines", "1", "Future generations" },
                { "Q25: What is farmed?", "The ocean,The sky,The land,Factory", "2", "Farm the land" }
        };
        addReadingGroup(questions, idCounter, pass3, r3);
        idCounter += 5;

        // Translation
        Map<String, Object> trans = new HashMap<>();
        trans.put("id", idCounter++);
        trans.put("section", "Part IV Translation");
        trans.put("type", "translation");
        trans.put("text",
                "Directions: Translate.\n\n环境保护（Environmental Protection）是每个人的责任。我们应该采取行动减少污染，保护我们的地球。小的改变，如垃圾分类和节约用水，也能带来巨大的不同。");
        trans.put("options", new ArrayList<>());
        trans.put("explanation", "Environmental protection is everyone's responsibility...");
        questions.add(trans);

        result.put("questions", questions);
        return result;
    }

    private static void addListeningGroup(List<Map<String, Object>> questions, int startId, String script,
            String[][] qs) {
        for (int i = 0; i < qs.length; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", startId + i);
            q.put("section", "Part II Listening");
            q.put("type", "listening");
            q.put("audioScript", script);
            q.put("text", qs[i][0]);
            q.put("options", Arrays.asList(qs[i][1].split(",")));
            q.put("correct", Integer.parseInt(qs[i][2]));
            q.put("explanation", qs[i][3]);
            questions.add(q);
        }
    }

    private static void addReadingGroup(List<Map<String, Object>> questions, int startId, String content,
            String[][] qs) {
        for (int i = 0; i < qs.length; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("id", startId + i);
            q.put("section", "Part III Reading");
            q.put("type", "reading");
            q.put("passage", content);
            q.put("text", qs[i][0]);
            q.put("options", Arrays.asList(qs[i][1].split(",")));
            q.put("correct", Integer.parseInt(qs[i][2]));
            q.put("explanation", qs[i][3]);
            questions.add(q);
        }
    }
}
