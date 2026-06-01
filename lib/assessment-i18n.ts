/**
 * OneGrasp Career Assessment — exam language layer.
 *
 * The student picks an exam language (English / Hindi / Telugu) before the test.
 * Only the QUESTION PROMPTS and ANSWER OPTIONS are translated — scoring is done
 * purely by option *index* in lib/assessment-engine.ts, so translating the
 * visible text never affects the result. Everything else (section intros, the
 * report, UI chrome) stays in English by product decision.
 *
 * Translation lookups are keyed so we avoid per-question duplication:
 *   - PROMPT_<lang>[questionId]      → translated prompt
 *   - OPTION_<lang>[englishLabel]    → translated option label
 * Shared option labels (Yes/No, the motivator frequency scale, …) appear once
 * in the OPTION map and are reused across every question that uses them.
 *
 * Missing keys fall back to the original English text, so a partially-translated
 * language (currently Telugu) still renders a complete, usable exam.
 */

import type { Question } from './assessment-questions';

export type ExamLang = 'en' | 'hi' | 'te';

export interface ExamLangMeta {
  id: ExamLang;
  /** English name of the language. */
  label: string;
  /** Endonym shown on the picker button. */
  native: string;
  /** Whether prompts + options are fully translated for this language. */
  ready: boolean;
}

export const EXAM_LANGS: ExamLangMeta[] = [
  { id: 'en', label: 'English', native: 'English', ready: true },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', ready: true },
  { id: 'te', label: 'Telugu', native: 'తెలుగు', ready: true },
];

/* ================================================================== */
/* HINDI                                                              */
/* ================================================================== */

const PROMPT_HI: Record<string, string> = {
  // --- Personality (forced-choice) ---
  p_ei1: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_ei2: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_ei3: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_ei4: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_sn1: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_sn2: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_sn3: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_sn4: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_tf1: 'आप निर्णय कैसे लेते हैं?',
  p_tf2: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_tf3: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_tf4: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_jp1: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_jp2: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_jp3: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',
  p_jp4: 'इनमें से कौन-सा आपका सबसे अच्छा वर्णन करता है?',

  // --- Interests (RIASEC) ---
  i_r1: 'क्या आपको गैजेट, उपकरण या मशीनों की मरम्मत करना अच्छा लगता है?',
  i_r2: 'क्या आपको चीज़ें बनाना या जोड़ना और औज़ारों के साथ काम करना पसंद है?',
  i_r3: 'क्या आप अक्सर बाहरी खेलों, गतिविधियों या रोमांच में भाग लेते हैं?',
  i_i1: 'क्या आपको विज्ञान परियोजनाओं और प्रयोगों में भाग लेना अच्छा लगता है?',
  i_i2: 'क्या आपको यह सीखना पसंद है कि नई तकनीकें और प्रणालियाँ वास्तव में कैसे काम करती हैं?',
  i_i3: 'क्या आपको जटिल समस्याओं को हल करने के लिए तर्क लगाना अच्छा लगता है?',
  i_a1: 'क्या आपको विभिन्न रंगों, आकृतियों और डिज़ाइनों के साथ काम करना पसंद है?',
  i_a2: 'क्या आपको कहानियाँ लिखना, प्रदर्शन करना या रचनात्मक गतिविधियाँ अच्छी लगती हैं?',
  i_a3: 'क्या आपको अपनी कल्पना से रचनात्मकता दिखाना पसंद है?',
  i_s1: 'क्या आपको दूसरों से बातचीत करना, सुनना और उनकी समस्याएँ सुलझाने में मदद करना पसंद है?',
  i_s2: 'क्या आपको समाज कल्याण, सामुदायिक सेवा या स्वयंसेवा में भाग लेना पसंद है?',
  i_s3: 'क्या आपको दूसरों को पढ़ाना, मार्गदर्शन देना या प्रशिक्षित करना अच्छा लगता है?',
  i_e1: 'क्या आपको किसी स्थिति की कमान संभालना और दूसरों का नेतृत्व करना पसंद है?',
  i_e2: 'क्या आप लोगों को प्रभावित करने और मनाने में अच्छे हैं?',
  i_e3: 'क्या आपको मार्केटिंग, बिक्री या लोगों को अपनी बात के लिए राज़ी करना पसंद है?',
  i_c1: 'क्या आपको डेटा, लिखित रिकॉर्ड और बारीकियों के साथ काम करना अच्छा लगता है?',
  i_c2: 'क्या आपको गतिविधियों की योजना बनाना, व्यवस्थित करना और प्राथमिकता तय करना पसंद है?',
  i_c3: 'क्या आपको संख्याओं, व्यापार और अर्थव्यवस्था में रुचि है?',

  // --- Motivators ---
  m_adv: 'अपने सपनों की नौकरी में मैं रोमांच और उत्साह चाहता/चाहती हूँ, भले ही उसमें शारीरिक जोखिम हो।',
  m_ind: 'मैं अकेले काम करने, अपने निर्णय खुद लेने और अपना काम खुद तय करने की आज़ादी चाहता/चाहती हूँ।',
  m_learn: 'मैं निरंतर सीखते हुए ज्ञान की नई सीमाओं पर काम करना चाहता/चाहती हूँ।',
  m_pace: 'मैं उच्च स्तर की प्रतिस्पर्धा, चुनौती, गति और उत्साह चाहता/चाहती हूँ।',
  m_struct: 'मैं उच्च सटीकता, विश्वसनीयता और तय प्रक्रियाओं वाला व्यवस्थित माहौल चाहता/चाहती हूँ।',
  m_create: 'मैं किसी न किसी कला के रूप में रचनात्मक काम करना चाहता/चाहती हूँ।',
  m_social: 'मैं ऐसा काम चाहता/चाहती हूँ जिसमें समाज सेवा, ज़िम्मेदारी और लोगों का कल्याण शामिल हो।',

  // --- Learning styles (VARK) ---
  l1: 'जब आप पढ़ाई करते हैं, तो आपको सबसे अच्छा सीखने में क्या मदद करता है?',
  l2: 'कंप्यूटर कैसे काम करता है यह सीखने के लिए, आप क्या करना पसंद करेंगे…',
  l3: 'कक्षा या सेमिनार में, आप आमतौर पर…',
  l4: 'आपको अपनी कक्षा के सामने कोई विचार प्रस्तुत करना है। आप क्या पसंद करेंगे…',
  l5: 'आप ऐसे शिक्षक या प्रस्तुतकर्ता को पसंद करते हैं जो इस्तेमाल करे…',
  l6: 'नया फ़ोन खरीदते समय (कीमत के अलावा), आपको सबसे ज़्यादा क्या प्रभावित करता है?',
  l7: 'किसी शब्द की वर्तनी को लेकर अनिश्चित हों, तो आप…',
  l8: 'जब आपने पिछली बार कुछ नया सीखा था, तो आपने सबसे अच्छा कैसे सीखा…',

  // --- Multiple intelligences ---
  mi_lin1: 'मुझे पढ़ना, लिखना, शब्द-खेल और शब्दों में खुद को व्यक्त करना अच्छा लगता है।',
  mi_lin2: 'मुझे चीज़ें समझाना और जो पढ़ता/सुनता हूँ उसे याद रखना आसान लगता है।',
  mi_log1: 'मुझे पहेलियाँ, पैटर्न और तार्किक या संख्यात्मक समस्याएँ हल करना पसंद है।',
  mi_log2: 'मैं समस्याओं का चरण-दर-चरण विश्लेषण करके तर्क से हल निकाल सकता/सकती हूँ।',
  mi_spa1: 'मैं वस्तुओं, नक्शों और डिज़ाइनों की कल्पना आसानी से अपने मन में कर सकता/सकती हूँ।',
  mi_spa2: 'मुझे चित्र बनाना, डिज़ाइन करना या आकृतियों और दृश्यों के साथ काम करना अच्छा लगता है।',
  mi_kin1: 'मैं स्थिर बैठने के बजाय करके, बनाकर या चलते-फिरते सबसे अच्छा सीखता/सीखती हूँ।',
  mi_kin2: 'मैं अपने हाथों से और शारीरिक या खेल गतिविधियों में अच्छा/अच्छी हूँ।',
  mi_mus1: 'मैं लय, धुनों और ध्वनियों को पहचानता/पहचानती हूँ और संगीत का आनंद लेता/लेती हूँ।',
  mi_mus2: 'मैं धुनें आसानी से याद रख सकता/सकती हूँ या गाने की ताल पकड़ सकता/सकती हूँ।',
  mi_inter1: 'मैं समझता/समझती हूँ कि दूसरे कैसा महसूस करते हैं और बहुत से लोगों के साथ अच्छे से घुल-मिल जाता/जाती हूँ।',
  mi_inter2: 'लोग अक्सर सलाह लेने या मतभेद सुलझाने के लिए मेरे पास आते हैं।',
  mi_intra1: 'मैं अपनी भावनाओं, खूबियों और लक्ष्यों को अच्छी तरह समझता/समझती हूँ।',
  mi_intra2: 'मुझे आत्ममंथन करना, व्यक्तिगत लक्ष्य तय करना और स्वतंत्र रूप से काम करना पसंद है।',
  mi_nat1: 'मुझे प्रकृति में रहना अच्छा लगता है और पौधों, जानवरों या पर्यावरण की परवाह है।',
  mi_nat2: 'मैं प्राकृतिक दुनिया की चीज़ों को पहचानने और वर्गीकृत करने में अच्छा/अच्छी हूँ।',

  // --- Analytical & logical (aptitude) ---
  a_n1: 'पानी की धारा की गति 5 किमी/घंटा है और एक व्यक्ति इस पानी में 15 किमी/घंटा की गति से तैरता है। शांत पानी में उसकी गति क्या होगी?',
  a_n2: 'मैथ्यू का वेतन 10% बढ़ाया जाता है और फिर 10% घटाया जाता है। शुद्ध प्रतिशत परिवर्तन क्या है?',
  a_n3: 'एक व्यक्ति ₹1000 में एक साइकिल खरीदता है और 15% हानि पर बेचता है। विक्रय मूल्य क्या है?',
  a_n4: 'राम एक घर को 3 घंटे में और श्याम 2 घंटे में साफ़ करता है। दोनों मिलकर लगभग कितने समय में करेंगे?',
  a_l1: 'श्रृंखला पूरी करें: ELFA, GLHA, ____, MLNA',
  a_l2: 'सू और जेनिफर गोरे हैं। ब्रायन और रॉबिन साँवले हैं। सू और रॉबिन लंबे हैं। कौन गोरा और लंबा दोनों है?',
  a_l3: 'सेब : फल :: उपन्यास : ?',
  a_l4: 'यदि सभी गुलाब फूल हैं और कुछ फूल जल्दी मुरझा जाते हैं, तो…',
  a_v1: 'सही वर्तनी वाला शब्द चुनें।',
  a_v2: 'रिक्त स्थान भरें: "I have ____ the presentation for you. I ____ it during my lunch break."',
  a_v3: 'रेखांकित शब्दों को बदलें: "The population of Tokyo is GREATER THEN THAT OF ANY OTHER town in the world."',
  a_s1: 'एक घन की सभी सतहों पर रंग किया जाता है और उसे 27 बराबर छोटे घनों में काटा जाता है। कितने घनों की ठीक एक सतह रंगी होगी?',
  a_s2: 'एक वर्ग के अंदर दोनों विकर्ण खींचने पर कितने त्रिभुज बनते हैं?',
};

const OPTION_HI: Record<string, string> = {
  // Shared scales
  Yes: 'हाँ',
  No: 'नहीं',
  Always: 'हमेशा',
  'Most of the time': 'ज़्यादातर समय',
  'Not really': 'ज़्यादा नहीं',
  'Definitely No': 'बिल्कुल नहीं',

  // Personality options
  'I usually like to have many people around me.': 'मुझे आमतौर पर अपने आसपास बहुत से लोग पसंद हैं।',
  'I enjoy spending time by myself.': 'मुझे अकेले समय बिताना अच्छा लगता है।',
  'I talk more than I listen.': 'मैं सुनने से ज़्यादा बोलता/बोलती हूँ।',
  'I listen more than I talk.': 'मैं बोलने से ज़्यादा सुनता/सुनती हूँ।',
  'It is easy for me to approach others and make new friends.': 'मेरे लिए दूसरों से बात करना और नए दोस्त बनाना आसान है।',
  'I am more reserved and approach new relationships carefully.': 'मैं ज़्यादा संकोची हूँ और नए रिश्तों में सावधानी से आगे बढ़ता/बढ़ती हूँ।',
  'I develop new ideas through discussion with others.': 'मैं दूसरों के साथ चर्चा करके नए विचार विकसित करता/करती हूँ।',
  'I develop new ideas when I focus within myself.': 'मैं खुद पर ध्यान केंद्रित करके नए विचार विकसित करता/करती हूँ।',
  'I like to do things in proven, established ways.': 'मुझे काम आज़माए हुए, स्थापित तरीकों से करना पसंद है।',
  'I like to do things in new, original ways.': 'मुझे काम नए और मौलिक तरीकों से करना पसंद है।',
  'I usually begin with facts and then build a bigger idea.': 'मैं आमतौर पर तथ्यों से शुरू करके फिर कोई बड़ा विचार बनाता/बनाती हूँ।',
  'I usually build a bigger idea first and then find the facts.': 'मैं आमतौर पर पहले कोई बड़ा विचार बनाता/बनाती हूँ और फिर तथ्य ढूँढता/ढूँढती हूँ।',
  'I prefer to trust my actual, concrete experience.': 'मैं अपने वास्तविक, ठोस अनुभव पर भरोसा करना पसंद करता/करती हूँ।',
  'I prefer to trust my gut instincts and hunches.': 'मैं अपनी अंतरात्मा और अंदरूनी अनुमान पर भरोसा करना पसंद करता/करती हूँ।',
  'I learn best through observation and practical activities.': 'मैं अवलोकन और व्यावहारिक गतिविधियों से सबसे अच्छा सीखता/सीखती हूँ।',
  'I learn best through intensive thinking and imagination.': 'मैं गहन सोच और कल्पना से सबसे अच्छा सीखता/सीखती हूँ।',
  'With my head — I focus on facts and logic.': 'अपने दिमाग से — मैं तथ्यों और तर्क पर ध्यान देता/देती हूँ।',
  'With my heart — I consider other people’s feelings.': 'अपने दिल से — मैं दूसरों की भावनाओं का ध्यान रखता/रखती हूँ।',
  'I usually give direct and honest opinions.': 'मैं आमतौर पर सीधी और ईमानदार राय देता/देती हूँ।',
  'I am careful not to hurt others with my comments.': 'मैं ध्यान रखता/रखती हूँ कि मेरी बातों से दूसरों को ठेस न पहुँचे।',
  'I am usually tough-minded.': 'मैं आमतौर पर कठोर सोच वाला/वाली हूँ।',
  'I am usually soft-hearted.': 'मैं आमतौर पर नरम दिल वाला/वाली हूँ।',
  'I give more importance to facts, tasks and logic.': 'मैं तथ्यों, कार्यों और तर्क को अधिक महत्व देता/देती हूँ।',
  'I give more importance to values and social considerations.': 'मैं मूल्यों और सामाजिक बातों को अधिक महत्व देता/देती हूँ।',
  'I make plans and schedules and try to stick with them.': 'मैं योजनाएँ और समय-सारणी बनाता/बनाती हूँ और उन पर टिके रहने की कोशिश करता/करती हूँ।',
  'I like to be flexible and keep plans to a minimum.': 'मुझे लचीला रहना और योजनाएँ कम से कम रखना पसंद है।',
  'I plan everything in advance before moving into action.': 'मैं काम शुरू करने से पहले सब कुछ पहले से योजना बना लेता/लेती हूँ।',
  'I usually take tasks on without making a plan.': 'मैं आमतौर पर बिना योजना बनाए काम शुरू कर देता/देती हूँ।',
  'I prefer to narrow down options and conclude.': 'मैं विकल्पों को सीमित करके निष्कर्ष पर पहुँचना पसंद करता/करती हूँ।',
  'I prefer to keep options open and explore.': 'मैं विकल्पों को खुला रखकर खोजबीन करना पसंद करता/करती हूँ।',
  'I am usually punctual and finish work on time.': 'मैं आमतौर पर समय का पाबंद हूँ और काम समय पर पूरा करता/करती हूँ।',
  'I am less time-conscious and often run late.': 'मैं समय को लेकर कम सजग हूँ और अक्सर देर हो जाती है।',

  // Learning-style options
  'Reading and re-writing notes and headings.': 'नोट्स और शीर्षक पढ़ना और दोबारा लिखना।',
  'Listening to a lecture, discussing it or repeating it aloud.': 'व्याख्यान सुनना, उस पर चर्चा करना या ज़ोर से दोहराना।',
  'Moving around and learning through practicals and demos.': 'इधर-उधर घूमते हुए प्रयोग और प्रदर्शन के ज़रिए सीखना।',
  'Turning text into diagrams, flowcharts and images.': 'पाठ को आरेख, फ्लोचार्ट और चित्रों में बदलना।',
  'Watch a demo video about it.': 'इसके बारे में एक डेमो वीडियो देखना।',
  'Listen to someone explain it.': 'किसी से इसका समझाना सुनना।',
  'Take it apart and figure it out yourself.': 'इसे खोलकर खुद समझना।',
  'Read the instructions and manual.': 'निर्देश और मैनुअल पढ़ना।',
  'Make plenty of written notes.': 'बहुत सारे लिखित नोट्स बनाते हैं।',
  'Listen carefully and make a few notes.': 'ध्यान से सुनते हैं और कुछ नोट्स बनाते हैं।',
  'Draw pictures and illustrations while listening.': 'सुनते समय चित्र और रेखाचित्र बनाते हैं।',
  'Prefer examples, demos and real-time applications.': 'उदाहरण, प्रदर्शन और वास्तविक उपयोग पसंद करते हैं।',
  'Create a working model and demonstrate it.': 'एक कार्यशील मॉडल बनाकर उसका प्रदर्शन करना।',
  'Create diagrams, flowcharts and graphs.': 'आरेख, फ्लोचार्ट और ग्राफ़ बनाना।',
  'Practise a few key words by saying them aloud.': 'कुछ मुख्य शब्दों को ज़ोर से बोलकर अभ्यास करना।',
  'Write out your speech and read it over and over.': 'अपना भाषण लिखकर उसे बार-बार पढ़ना।',
  'Diagrams, charts or graphs.': 'आरेख, चार्ट या ग्राफ़।',
  'Discussion, Q&A or guest speakers.': 'चर्चा, प्रश्नोत्तर या अतिथि वक्ता।',
  'Handouts, books or readings.': 'हैंडआउट, किताबें या पठन सामग्री।',
  'Demonstrations, models or practical sessions.': 'प्रदर्शन, मॉडल या व्यावहारिक सत्र।',
  'Trying or testing it myself.': 'खुद इसे आज़माना या परखना।',
  'Reading the details and features online.': 'ऑनलाइन इसकी जानकारी और विशेषताएँ पढ़ना।',
  'Its modern design and sleek looks.': 'इसका आधुनिक डिज़ाइन और आकर्षक रूप।',
  'The salesperson telling me about it.': 'विक्रेता द्वारा इसके बारे में बताना।',
  'Look it up in the dictionary.': 'शब्दकोश में देखेंगे।',
  'Picture the word and choose how it looks.': 'शब्द की कल्पना करेंगे और देखेंगे कि कौन-सा सही दिखता है।',
  'Say it aloud to hear if it sounds right.': 'ज़ोर से बोलकर सुनेंगे कि सही लगता है या नहीं।',
  'Write both versions down and choose one.': 'दोनों रूप लिखकर एक चुनेंगे।',
  'Watching a demonstration.': 'किसी प्रदर्शन को देखकर।',
  'Listening to someone explain and asking questions.': 'किसी का समझाना सुनकर और प्रश्न पूछकर।',
  'Trying it out and doing it hands-on.': 'खुद आज़माकर और करके।',
  'Following written instructions, a manual or book.': 'लिखित निर्देश, मैनुअल या किताब का पालन करके।',

  // Analytical word options (numeric/spelling options stay as-is via fallback)
  bookstore: 'किताबों की दुकान',
  magazine: 'पत्रिका',
  book: 'किताब',
  shopping: 'खरीदारी',
  'All roses fade quickly': 'सभी गुलाब जल्दी मुरझा जाते हैं',
  'Some roses may fade quickly': 'कुछ गुलाब जल्दी मुरझा सकते हैं',
  'No rose fades': 'कोई गुलाब नहीं मुरझाता',
  'Roses are not flowers': 'गुलाब फूल नहीं हैं',
  Sue: 'सू',
  Jennifer: 'जेनिफर',
  Brian: 'ब्रायन',
  Robyn: 'रॉबिन',
  'No change': 'कोई बदलाव नहीं',
  '2% decrease': '2% की कमी',
  '1% decrease': '1% की कमी',
  '20% decrease': '20% की कमी',
};

/* ================================================================== */
/* TELUGU                                                            */
/* ================================================================== */

const PROMPT_TE: Record<string, string> = {
  // --- Personality (forced-choice) ---
  p_ei1: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_ei2: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_ei3: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_ei4: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_sn1: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_sn2: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_sn3: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_sn4: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_tf1: 'మీరు నిర్ణయాలను ఎలా తీసుకుంటారు?',
  p_tf2: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_tf3: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_tf4: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_jp1: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_jp2: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_jp3: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',
  p_jp4: 'మిమ్మల్ని ఏది బాగా వర్ణిస్తుంది?',

  // --- Interests (RIASEC) ---
  i_r1: 'గ్యాడ్జెట్‌లు, ఉపకరణాలు లేదా యంత్రాలను మరమ్మతు చేయడం మీకు ఇష్టమా?',
  i_r2: 'వస్తువులను తయారు చేయడం లేదా అమర్చడం, పనిముట్లతో పని చేయడం మీకు ఇష్టమా?',
  i_r3: 'బయటి ఆటలు, కార్యకలాపాలు లేదా సాహసాల్లో మీరు తరచుగా పాల్గొంటారా?',
  i_i1: 'సైన్స్ ప్రాజెక్టులు, ప్రయోగాల్లో పాల్గొనడం మీకు ఇష్టమా?',
  i_i2: 'కొత్త సాంకేతికతలు, వ్యవస్థలు నిజంగా ఎలా పనిచేస్తాయో నేర్చుకోవడం మీకు ఇష్టమా?',
  i_i3: 'సంక్లిష్టమైన సమస్యలను పరిష్కరించడానికి తర్కాన్ని ఉపయోగించడం మీకు ఇష్టమా?',
  i_a1: 'వివిధ రంగులు, ఆకారాలు, డిజైన్‌లతో పని చేయడం మీకు ఇష్టమా?',
  i_a2: 'కథలు రాయడం, ప్రదర్శన ఇవ్వడం లేదా సృజనాత్మక కార్యకలాపాలు మీకు ఇష్టమా?',
  i_a3: 'మీ ఊహను ఉపయోగించి సృజనాత్మకతను చూపడం మీకు ఇష్టమా?',
  i_s1: 'ఇతరులతో మాట్లాడటం, వినడం, వారి సమస్యలను పరిష్కరించడంలో సహాయం చేయడం మీకు ఇష్టమా?',
  i_s2: 'సమాజ సేవ, సామాజిక సేవ లేదా స్వచ్ఛంద కార్యక్రమాల్లో పాల్గొనడం మీకు ఇష్టమా?',
  i_s3: 'ఇతరులకు బోధించడం, మార్గనిర్దేశం చేయడం లేదా శిక్షణ ఇవ్వడం మీకు ఇష్టమా?',
  i_e1: 'ఒక పరిస్థితిని నడిపించడం, ఇతరులకు నాయకత్వం వహించడం మీకు ఇష్టమా?',
  i_e2: 'ప్రజలను ప్రభావితం చేయడం, ఒప్పించడంలో మీరు మంచివారా?',
  i_e3: 'మార్కెటింగ్, అమ్మకం లేదా ప్రజలను మీ అభిప్రాయానికి ఒప్పించడం మీకు ఇష్టమా?',
  i_c1: 'డేటా, లిఖిత రికార్డులు, వివరాలతో పని చేయడం మీకు ఇష్టమా?',
  i_c2: 'కార్యకలాపాలను ప్రణాళిక వేయడం, వ్యవస్థీకరించడం, ప్రాధాన్యత ఇవ్వడం మీకు ఇష్టమా?',
  i_c3: 'సంఖ్యలు, వ్యాపారం, ఆర్థిక వ్యవస్థ పట్ల మీకు ఆసక్తి ఉందా?',

  // --- Motivators ---
  m_adv: 'నా కలల ఉద్యోగంలో శారీరక ప్రమాదం ఉన్నా సరే, సాహసం, ఉత్సాహం కావాలి.',
  m_ind: 'ఒంటరిగా పని చేయడం, నా నిర్ణయాలు నేనే తీసుకోవడం, నా పనిని నేనే ప్రణాళిక వేసుకునే స్వేచ్ఛ కావాలి.',
  m_learn: 'నిరంతరం నేర్చుకుంటూ జ్ఞానపు సరిహద్దుల్లో పని చేయాలని కోరుకుంటాను.',
  m_pace: 'అధిక స్థాయి పోటీ, సవాలు, వేగం, ఉత్సాహం కావాలి.',
  m_struct: 'అధిక ఖచ్చితత్వం, నమ్మకత్వం, నిర్దిష్ట విధానాలు ఉన్న వ్యవస్థీకృత వాతావరణం కావాలి.',
  m_create: 'ఏదో ఒక కళారూపంలో సృజనాత్మక పని చేయాలని కోరుకుంటాను.',
  m_social: 'సమాజ సేవ, బాధ్యత, ప్రజల సంక్షేమం ఉన్న పని కావాలి.',

  // --- Learning styles (VARK) ---
  l1: 'మీరు చదువుతున్నప్పుడు, బాగా నేర్చుకోవడానికి మీకు ఏది సహాయపడుతుంది?',
  l2: 'కంప్యూటర్ ఎలా పనిచేస్తుందో నేర్చుకోవడానికి, మీరు దేన్ని ఇష్టపడతారు…',
  l3: 'తరగతి లేదా సెమినార్‌లో, మీరు సాధారణంగా…',
  l4: 'మీరు మీ తరగతికి ఒక ఆలోచనను ప్రదర్శించాలి. మీరు దేన్ని ఇష్టపడతారు…',
  l5: 'మీరు ఇలాంటి ఉపాధ్యాయుడిని లేదా ప్రదర్శకుడిని ఇష్టపడతారు…',
  l6: 'కొత్త ఫోన్ కొనేటప్పుడు (ధర కాకుండా), మిమ్మల్ని ఎక్కువగా ఏది ప్రభావితం చేస్తుంది?',
  l7: 'ఒక పదం స్పెల్లింగ్ గురించి మీకు ఖచ్చితంగా తెలియకపోతే, మీరు…',
  l8: 'మీరు చివరిసారి కొత్తగా ఏదైనా నేర్చుకున్నప్పుడు, మీరు ఎలా బాగా నేర్చుకున్నారు…',

  // --- Multiple intelligences ---
  mi_lin1: 'చదవడం, రాయడం, పద ఆటలు, పదాల్లో నన్ను వ్యక్తపరచుకోవడం నాకు ఇష్టం.',
  mi_lin2: 'విషయాలను వివరించడం, చదివిన లేదా విన్నది గుర్తుంచుకోవడం నాకు సులభం.',
  mi_log1: 'పజిల్‌లు, నమూనాలు, తార్కిక లేదా సంఖ్యా సమస్యలను పరిష్కరించడం నాకు ఇష్టం.',
  mi_log2: 'సమస్యలను దశలవారీగా విశ్లేషించి తర్కంతో పరిష్కరించగలను.',
  mi_spa1: 'వస్తువులు, మ్యాప్‌లు, డిజైన్‌లను నా మనసులో సులభంగా ఊహించగలను.',
  mi_spa2: 'గీయడం, డిజైన్ చేయడం లేదా ఆకారాలు, దృశ్యాలతో పని చేయడం నాకు ఇష్టం.',
  mi_kin1: 'కదలకుండా కూర్చోవడం కంటే చేస్తూ, తయారు చేస్తూ లేదా కదులుతూ నేను బాగా నేర్చుకుంటాను.',
  mi_kin2: 'నా చేతులతో పని చేయడంలో, శారీరక లేదా క్రీడా కార్యకలాపాల్లో నేను నిపుణుడిని.',
  mi_mus1: 'లయలు, రాగాలు, ధ్వనులను గమనిస్తాను, సంగీతాన్ని ఆస్వాదిస్తాను.',
  mi_mus2: 'రాగాలను సులభంగా గుర్తుంచుకోగలను లేదా పాట లయను పట్టుకోగలను.',
  mi_inter1: 'ఇతరులు ఎలా భావిస్తారో అర్థం చేసుకుంటాను, చాలా మందితో బాగా కలిసిపోతాను.',
  mi_inter2: 'సలహా కోసం లేదా విభేదాలను పరిష్కరించడానికి ప్రజలు తరచుగా నా దగ్గరికి వస్తారు.',
  mi_intra1: 'నా భావాలు, బలాలు, లక్ష్యాలను నేను బాగా అర్థం చేసుకుంటాను.',
  mi_intra2: 'ఆత్మపరిశీలన చేయడం, వ్యక్తిగత లక్ష్యాలు ఏర్పరచుకోవడం, స్వతంత్రంగా పని చేయడం నాకు ఇష్టం.',
  mi_nat1: 'ప్రకృతిలో ఉండటం నాకు ఇష్టం, మొక్కలు, జంతువులు లేదా పర్యావరణం గురించి శ్రద్ధ వహిస్తాను.',
  mi_nat2: 'ప్రకృతి ప్రపంచంలోని వస్తువులను గమనించడం, వర్గీకరించడంలో నేను నిపుణుడిని.',

  // --- Analytical & logical (aptitude) ---
  a_n1: 'నీటి ప్రవాహ వేగం గంటకు 5 కి.మీ., ఒక వ్యక్తి ఈ నీటిలో గంటకు 15 కి.మీ. వేగంతో ఈదుతాడు. నిశ్చల నీటిలో అతని వేగం ఎంత?',
  a_n2: 'మాథ్యూ జీతం 10% పెంచి, ఆపై 10% తగ్గించబడింది. నికర శాతం మార్పు ఎంత?',
  a_n3: 'ఒక వ్యక్తి ₹1000కి ఒక సైకిల్ కొని, 15% నష్టానికి అమ్ముతాడు. విక్రయ ధర ఎంత?',
  a_n4: 'రామ్ ఒక ఇంటిని 3 గంటల్లో, శ్యామ్ 2 గంటల్లో శుభ్రం చేస్తారు. ఇద్దరూ కలిసి సుమారు ఎంత సమయంలో చేస్తారు?',
  a_l1: 'శ్రేణిని పూర్తి చేయండి: ELFA, GLHA, ____, MLNA',
  a_l2: 'సూ, జెన్నిఫర్ తెల్లగా ఉన్నారు. బ్రయాన్, రాబిన్ నల్లగా ఉన్నారు. సూ, రాబిన్ పొడవుగా ఉన్నారు. తెల్లగా మరియు పొడవుగా ఉన్నది ఎవరు?',
  a_l3: 'ఆపిల్‌లు : పండు :: నవల : ?',
  a_l4: 'అన్ని గులాబీలు పూలు అయితే, కొన్ని పూలు త్వరగా వాడిపోతే, అప్పుడు…',
  a_v1: 'సరిగ్గా స్పెల్లింగ్ ఉన్న పదాన్ని ఎంచుకోండి.',
  a_v2: 'ఖాళీలను పూరించండి: "I have ____ the presentation for you. I ____ it during my lunch break."',
  a_v3: 'అండర్‌లైన్ చేసిన పదాలను మార్చండి: "The population of Tokyo is GREATER THEN THAT OF ANY OTHER town in the world."',
  a_s1: 'ఒక ఘనం అన్ని వైపులా రంగు వేయబడి, 27 సమాన చిన్న ఘనాలుగా కత్తిరించబడింది. సరిగ్గా ఒక వైపు రంగు ఉన్న ఘనాలు ఎన్ని?',
  a_s2: 'ఒక చతురస్రం లోపల రెండు కర్ణాలు గీసినప్పుడు ఎన్ని త్రిభుజాలు ఏర్పడతాయి?',
};

const OPTION_TE: Record<string, string> = {
  // Shared scales
  Yes: 'అవును',
  No: 'కాదు',
  Always: 'ఎల్లప్పుడూ',
  'Most of the time': 'చాలా సార్లు',
  'Not really': 'అంతగా కాదు',
  'Definitely No': 'ఖచ్చితంగా కాదు',

  // Personality options
  'I usually like to have many people around me.': 'సాధారణంగా నా చుట్టూ చాలా మంది ఉండటం నాకు ఇష్టం.',
  'I enjoy spending time by myself.': 'ఒంటరిగా సమయం గడపడం నాకు ఇష్టం.',
  'I talk more than I listen.': 'నేను వినడం కంటే ఎక్కువ మాట్లాడతాను.',
  'I listen more than I talk.': 'నేను మాట్లాడటం కంటే ఎక్కువ వింటాను.',
  'It is easy for me to approach others and make new friends.': 'ఇతరులతో మాట్లాడటం, కొత్త స్నేహితులను చేసుకోవడం నాకు సులభం.',
  'I am more reserved and approach new relationships carefully.': 'నేను కొంచెం మౌనంగా ఉంటాను, కొత్త సంబంధాలను జాగ్రత్తగా ఏర్పరచుకుంటాను.',
  'I develop new ideas through discussion with others.': 'ఇతరులతో చర్చించడం ద్వారా నేను కొత్త ఆలోచనలను అభివృద్ధి చేస్తాను.',
  'I develop new ideas when I focus within myself.': 'నాలో నేను దృష్టి కేంద్రీకరించినప్పుడు కొత్త ఆలోచనలు వస్తాయి.',
  'I like to do things in proven, established ways.': 'నిరూపితమైన, స్థిరమైన పద్ధతుల్లో పనులు చేయడం నాకు ఇష్టం.',
  'I like to do things in new, original ways.': 'కొత్త, వినూత్నమైన పద్ధతుల్లో పనులు చేయడం నాకు ఇష్టం.',
  'I usually begin with facts and then build a bigger idea.': 'సాధారణంగా నేను వాస్తవాలతో మొదలుపెట్టి, ఆపై పెద్ద ఆలోచనను నిర్మిస్తాను.',
  'I usually build a bigger idea first and then find the facts.': 'సాధారణంగా నేను ముందుగా పెద్ద ఆలోచనను నిర్మించి, ఆపై వాస్తవాలను వెతుకుతాను.',
  'I prefer to trust my actual, concrete experience.': 'నా వాస్తవమైన, ఖచ్చితమైన అనుభవాన్ని నమ్మడం నాకు ఇష్టం.',
  'I prefer to trust my gut instincts and hunches.': 'నా అంతరంగ భావనలను, ఊహలను నమ్మడం నాకు ఇష్టం.',
  'I learn best through observation and practical activities.': 'పరిశీలన, ఆచరణాత్మక కార్యకలాపాల ద్వారా నేను బాగా నేర్చుకుంటాను.',
  'I learn best through intensive thinking and imagination.': 'లోతైన ఆలోచన, ఊహ ద్వారా నేను బాగా నేర్చుకుంటాను.',
  'With my head — I focus on facts and logic.': 'నా మెదడుతో — నేను వాస్తవాలు, తర్కంపై దృష్టి పెడతాను.',
  'With my heart — I consider other people’s feelings.': 'నా హృదయంతో — నేను ఇతరుల భావాలను పరిగణిస్తాను.',
  'I usually give direct and honest opinions.': 'సాధారణంగా నేను నేరుగా, నిజాయితీగా అభిప్రాయాలు చెబుతాను.',
  'I am careful not to hurt others with my comments.': 'నా మాటలతో ఇతరులను బాధపెట్టకుండా జాగ్రత్త పడతాను.',
  'I am usually tough-minded.': 'సాధారణంగా నేను కఠినమైన ఆలోచన కలిగి ఉంటాను.',
  'I am usually soft-hearted.': 'సాధారణంగా నేను మృదువైన హృదయం కలిగి ఉంటాను.',
  'I give more importance to facts, tasks and logic.': 'వాస్తవాలు, పనులు, తర్కానికి నేను ఎక్కువ ప్రాధాన్యత ఇస్తాను.',
  'I give more importance to values and social considerations.': 'విలువలు, సామాజిక అంశాలకు నేను ఎక్కువ ప్రాధాన్యత ఇస్తాను.',
  'I make plans and schedules and try to stick with them.': 'నేను ప్రణాళికలు, షెడ్యూల్‌లు రూపొందించి, వాటికి కట్టుబడి ఉండటానికి ప్రయత్నిస్తాను.',
  'I like to be flexible and keep plans to a minimum.': 'సరళంగా ఉండటం, ప్రణాళికలను తక్కువగా ఉంచడం నాకు ఇష్టం.',
  'I plan everything in advance before moving into action.': 'పని ప్రారంభించే ముందు అన్నీ ముందుగానే ప్రణాళిక వేస్తాను.',
  'I usually take tasks on without making a plan.': 'సాధారణంగా ప్రణాళిక లేకుండానే పనులను చేపడతాను.',
  'I prefer to narrow down options and conclude.': 'ఎంపికలను తగ్గించి ఒక నిర్ణయానికి రావడం నాకు ఇష్టం.',
  'I prefer to keep options open and explore.': 'ఎంపికలను తెరిచి ఉంచి అన్వేషించడం నాకు ఇష్టం.',
  'I am usually punctual and finish work on time.': 'సాధారణంగా నేను సమయపాలన పాటిస్తాను, పనిని సమయానికి పూర్తి చేస్తాను.',
  'I am less time-conscious and often run late.': 'నేను సమయం పట్ల తక్కువ శ్రద్ధ చూపుతాను, తరచుగా ఆలస్యం అవుతాను.',

  // Learning-style options
  'Reading and re-writing notes and headings.': 'నోట్స్, శీర్షికలను చదవడం, తిరిగి రాయడం.',
  'Listening to a lecture, discussing it or repeating it aloud.': 'ఉపన్యాసం వినడం, దాని గురించి చర్చించడం లేదా బిగ్గరగా పునరావృతం చేయడం.',
  'Moving around and learning through practicals and demos.': 'తిరుగుతూ ప్రయోగాలు, ప్రదర్శనల ద్వారా నేర్చుకోవడం.',
  'Turning text into diagrams, flowcharts and images.': 'పాఠాన్ని చిత్రాలు, ఫ్లోచార్ట్‌లు, బొమ్మలుగా మార్చడం.',
  'Watch a demo video about it.': 'దాని గురించి ఒక డెమో వీడియో చూడటం.',
  'Listen to someone explain it.': 'ఎవరైనా వివరిస్తే వినడం.',
  'Take it apart and figure it out yourself.': 'దాన్ని విడదీసి మీరే అర్థం చేసుకోవడం.',
  'Read the instructions and manual.': 'సూచనలు, మాన్యువల్ చదవడం.',
  'Make plenty of written notes.': 'చాలా లిఖిత నోట్స్ రాస్తారు.',
  'Listen carefully and make a few notes.': 'జాగ్రత్తగా విని కొన్ని నోట్స్ రాస్తారు.',
  'Draw pictures and illustrations while listening.': 'వింటూ బొమ్మలు, చిత్రాలు గీస్తారు.',
  'Prefer examples, demos and real-time applications.': 'ఉదాహరణలు, ప్రదర్శనలు, వాస్తవ ఉపయోగాలను ఇష్టపడతారు.',
  'Create a working model and demonstrate it.': 'ఒక పనిచేసే నమూనాను తయారు చేసి ప్రదర్శించడం.',
  'Create diagrams, flowcharts and graphs.': 'చిత్రాలు, ఫ్లోచార్ట్‌లు, గ్రాఫ్‌లు తయారు చేయడం.',
  'Practise a few key words by saying them aloud.': 'కొన్ని ముఖ్య పదాలను బిగ్గరగా చెప్పి అభ్యాసం చేయడం.',
  'Write out your speech and read it over and over.': 'మీ ప్రసంగాన్ని రాసి, మళ్లీ మళ్లీ చదవడం.',
  'Diagrams, charts or graphs.': 'చిత్రాలు, చార్ట్‌లు లేదా గ్రాఫ్‌లు.',
  'Discussion, Q&A or guest speakers.': 'చర్చ, ప్రశ్నోత్తరాలు లేదా అతిథి వక్తలు.',
  'Handouts, books or readings.': 'హ్యాండ్‌అవుట్‌లు, పుస్తకాలు లేదా చదవడాలు.',
  'Demonstrations, models or practical sessions.': 'ప్రదర్శనలు, నమూనాలు లేదా ఆచరణాత్మక సెషన్లు.',
  'Trying or testing it myself.': 'దాన్ని నేనే ప్రయత్నించడం లేదా పరీక్షించడం.',
  'Reading the details and features online.': 'ఆన్‌లైన్‌లో దాని వివరాలు, లక్షణాలు చదవడం.',
  'Its modern design and sleek looks.': 'దాని ఆధునిక డిజైన్, అందమైన రూపం.',
  'The salesperson telling me about it.': 'విక్రయదారుడు దాని గురించి చెప్పడం.',
  'Look it up in the dictionary.': 'నిఘంటువులో చూస్తారు.',
  'Picture the word and choose how it looks.': 'పదాన్ని ఊహించి, ఏది సరిగా కనిపిస్తుందో ఎంచుకుంటారు.',
  'Say it aloud to hear if it sounds right.': 'బిగ్గరగా చెప్పి సరిగా అనిపిస్తుందో వింటారు.',
  'Write both versions down and choose one.': 'రెండు రూపాలను రాసి ఒకటి ఎంచుకుంటారు.',
  'Watching a demonstration.': 'ఒక ప్రదర్శనను చూడటం ద్వారా.',
  'Listening to someone explain and asking questions.': 'ఎవరైనా వివరిస్తే విని, ప్రశ్నలు అడగడం ద్వారా.',
  'Trying it out and doing it hands-on.': 'స్వయంగా ప్రయత్నించి చేయడం ద్వారా.',
  'Following written instructions, a manual or book.': 'లిఖిత సూచనలు, మాన్యువల్ లేదా పుస్తకాన్ని అనుసరించడం ద్వారా.',

  // Analytical word options (numeric/spelling options stay as-is via fallback)
  bookstore: 'పుస్తకాల దుకాణం',
  magazine: 'పత్రిక',
  book: 'పుస్తకం',
  shopping: 'షాపింగ్',
  'All roses fade quickly': 'అన్ని గులాబీలు త్వరగా వాడిపోతాయి',
  'Some roses may fade quickly': 'కొన్ని గులాబీలు త్వరగా వాడిపోవచ్చు',
  'No rose fades': 'ఏ గులాబీ వాడిపోదు',
  'Roses are not flowers': 'గులాబీలు పూలు కావు',
  Sue: 'సూ',
  Jennifer: 'జెన్నిఫర్',
  Brian: 'బ్రయాన్',
  Robyn: 'రాబిన్',
  'No change': 'మార్పు లేదు',
  '2% decrease': '2% తగ్గుదల',
  '1% decrease': '1% తగ్గుదల',
  '20% decrease': '20% తగ్గుదల',
};

/* ================================================================== */

const PROMPTS: Record<Exclude<ExamLang, 'en'>, Record<string, string>> = {
  hi: PROMPT_HI,
  te: PROMPT_TE,
};
const OPTIONS: Record<Exclude<ExamLang, 'en'>, Record<string, string>> = {
  hi: OPTION_HI,
  te: OPTION_TE,
};

/**
 * Localise a question's visible text. Scoring is index-based, so only the
 * prompt and option labels change — never the order or count of options.
 * Any missing translation falls back to the original English string.
 */
export function localizeQuestion(
  q: Question,
  lang: ExamLang
): { prompt: string; options: string[] } {
  if (lang === 'en') {
    return { prompt: q.prompt, options: q.options.map((o) => o.label) };
  }
  const promptMap = PROMPTS[lang];
  const optionMap = OPTIONS[lang];
  return {
    prompt: promptMap[q.id] ?? q.prompt,
    options: q.options.map((o) => optionMap[o.label] ?? o.label),
  };
}
