/**
 * textPreprocessor.ts
 * Text pre-processing and phonetic normalization layer for child-friendly Arabic,
 * Moroccan Darija (ar-MA), and multilingual speech synthesis.
 * Handles:
 * 1. Deep cleaning of Markdown, emojis, URLs, code blocks, technical jargon.
 * 2. Moroccan Darija phonetic tuning (adding precise short vowels / diacritics / phonetic adjustments so browser engines pronounce Darija naturally).
 * 3. Arabic child-friendly positive reinforcement vocalization (Tashkeel for natural intonation).
 * 4. Micro-chunking (35 - 95 characters) with natural punctuation to produce human-like cadence and breathing room.
 */

export interface PreprocessedSpeechResult {
  fullNormalizedText: string;
  chunks: string[];
}

/**
 * Moroccan Darija & Colloquial Arabic phonetic mapping:
 * Browser speech synthesizers (Google, Apple, Microsoft, eSpeak) interpret unvocalized Arabic
 * with harsh default consonants. Adding selective diacritics (Harakat / تشكيل) and phonetic
 * substitutions forces the synthesis engine to pronounce Moroccan Darija words with authentic,
 * smooth, and warm local cadence.
 */
const DARIJA_PHONETIC_DICTIONARY: [RegExp, string][] = [
  // Common Darija prepositions & pronouns
  [/\bديالك\b/g, "دْيَالَكْ"],
  [/\bديالكم\b/g, "دْيَالَكْمْ"],
  [/\bديالنا\b/g, "دْيَالْنَا"],
  [/\bديالي\b/g, "دْيَالِي"],
  [/\bديال\b/g, "دْيَالْ"],
  [/\bدابا\b/g, "دَابَا"],
  [/\bمزيان\b/g, "مْزْيَانْ"],
  [/\bمزيانة\b/g, "مْزْيَانَة"],
  [/\bبزاف\b/g, "بْزَّافْ"],
  [/\bشنو\b/g, "شْنُو"],
  [/\bواخا\b/g, "وَاخَا"],
  [/\bكيفاش\b/g, "كِيفَاشْ"],
  [/\bزوين\b/g, "زْوِينْ"],
  [/\bزوينة\b/g, "زْوِينَة"],
  [/\bزوينين\b/g, "زْوِينِينْ"],
  [/\bصحابك\b/g, "صْحَابَكْ"],
  [/\bصاحبي\b/g, "صَاحْبِي"],
  [/\bأ صاحبي\b/g, "أَ صَاحْبِي"],
  [/\bأ صاحبتي\b/g, "أَ صَاحْبَتِي"],
  [/\bهضرة\b/g, "هَضْرَة"],
  [/\bالهضرة\b/g, "الْهَضْرَة"],
  [/\bسولني\b/g, "سَوَّلْنِي"],
  [/\bسول\b/g, "سَوَّلْ"],
  [/\bطاحت ليك\b/g, "طَاحَتْ لِيكْ"],
  [/\bفبالك\b/g, "فْ بَالِكْ"],
  [/\bعاود ليا\b/g, "عَاوْدْ لِيَّا"],
  [/\bعاود\b/g, "عَاوْدْ"],
  [/\bتبارك الله\b/g, "تَبَارَكَ اللهُ"],
  [/\bبخير\b/g, "بِخَيْرْ"],
  [/\bراك\b/g, "رَاكْ"],
  [/\bواش\b/g, "وَاكْشْ"], // Pronounced gently
  [/\bعلاش\b/g, "عْلَاشْ"],
  [/\bدير\b/g, "دِيرْ"],
  [/\bديكشي\b/g, "دَاكْ الشِّي"],
  [/\bهادشي\b/g, "هَادْ الشِّي"],
  [/\bكاع\b/g, "كَاعْ"],
  [/\bبصح\b/g, "بْ الصَّحْ"],
  [/\bحاجة\b/g, "حَاجَة"],
  [/\bحوايج\b/g, "حْوَايْجْ"],
  [/\bغادي\b/g, "غَادِي"],
  [/\bنخدمو\b/g, "نْخْدْمُو"],
  [/\bنلعبو\b/g, "نْلْعْبُو"],
  [/\bنتعلمو\b/g, "نْتْعْلْمُو"],
];

/**
 * Modern Standard Arabic (MSA) child positive reinforcement & key terms vocalization
 */
const ARABIC_PHONETIC_ENHANCEMENTS: [RegExp, string][] = [
  [/\bمرحبا\b/g, "مَرْحَبًا"],
  [/\bمرحباً\b/g, "مَرْحَبًا"],
  [/\bأهلاً\b/g, "أَهْلًا"],
  [/\bأهلا\b/g, "أَهْلًا"],
  [/\bشكراً\b/g, "شُكْرًا"],
  [/\bشكرا\b/g, "شُكْرًا"],
  [/\bأحسنت\b/g, "أَحْسَنْتَ"],
  [/\bرائع\b/g, "رَائِعٌ"],
  [/\bرائعة\b/g, "رَائِعَة"],
  [/\bممتاز\b/g, "مُمْتَازٌ"],
  [/\bبطل\b/g, "بَطَلْ"],
  [/\bيا بطل\b/g, "يَا بَطَلْ"],
  [/\bيا بطلة\b/g, "يَا بَطَلَة"],
  [/\bصديقي\b/g, "صَدِيقِي"],
  [/\bصديقتي\b/g, "صَدِيقَتِي"],
  [/\bأنا\b/g, "أَنَا"],
  [/\bزكي\b/g, "زَكِي"],
  [/\bالأستاذ زكي\b/g, "الأُسْتَاذُ زَكِي"],
  [/\bسلمى\b/g, "سَلْمَى"],
  [/\bالذكاء الاصطناعي\b/g, "الذَّكَاءُ الاصْطِنَاعِي"],
  [/\bروبوت\b/g, "رُوبُوتْ"],
  [/\bروبوتات\b/g, "رُوبُوتَاتْ"],
  [/\bكمبيوتر\b/g, "كَمْبِيُوتَرْ"],
  [/\bحاسوب\b/g, "حَاسُوبْ"],
  [/\bفكرة\b/g, "فِكْرَة"],
  [/\bأفكار\b/g, "أَفْكَارْ"],
  [/\bمبروك\b/g, "مَبْرُوكْ"],
  [/\bتحدي\b/g, "تَحَدٍّ"],
  [/\bمغامرة\b/g, "مُغَامَرَة"],
  [/\bمستكشف\b/g, "مُسْتَكْشِفْ"],
];

/**
 * Clean markdown symbols, emojis, and unpronounceable characters
 */
export function cleanTextForSpeech(rawText: string, lang: string = "ar-MA"): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove markdown code blocks ```...``` and inline code `...`
  text = text.replace(/```[\s\S]*?```/g, " كود برمجي ");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 2. Remove markdown images and links: ![alt](url) and [text](url) -> text
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, "");
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // 3. Remove markdown headers, bold, italics, strikethrough, blockquotes
  text = text.replace(/^#{1,6}\s+/gm, ""); // # Heading
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2"); // **bold**
  text = text.replace(/(\*|_)(.*?)\1/g, "$2"); // *italic*
  text = text.replace(/~~(.*?)~~/g, "$1"); // ~~strike~~
  text = text.replace(/^>\s+/gm, ""); // > quote
  text = text.replace(/^[-*+]\s+/gm, ""); // bullet list
  text = text.replace(/^\d+\.\s+/gm, ""); // numbered list

  // 4. Remove emojis & unicode decorative symbols
  text = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu,
    " "
  );

  // 5. Remove unwanted brackets, asterisks, tildes, slashes
  text = text.replace(/[\[\]{}|\\\/_~#^*<>]/g, " ");

  // 6. Convert mathematical and technical symbols to natural spoken words
  text = text.replace(/%/g, " بالمئة ");
  text = text.replace(/\+/g, " زائد ");
  text = text.replace(/=/g, " يساوي ");
  text = text.replace(/->|=>|→|➜/g, " يؤدي إلى ");
  text = text.replace(/\bvs\b|\bvs\.\b/gi, " ضد ");
  text = text.replace(/&/g, " و ");

  // 7. Convert technical English acronyms to natural Arabic words for kids
  text = text.replace(/\bAI\b/g, "الذكاء الاصطناعي");
  text = text.replace(/\bML\b/g, "تعلم الآلة");
  text = text.replace(/\bNLP\b/g, "معالجة اللغات الطبيعية");
  text = text.replace(/\bPython\b/gi, "بايثون");
  text = text.replace(/\bPrompt\b/gi, "أمر وتوجيه");
  text = text.replace(/\bDataset\b/gi, "بيانات التدريب");
  text = text.replace(/\bRobot\b/gi, "روبوت");
  text = text.replace(/\bXP\b/gi, "نقطة خبرة");

  // 8. Apply phonetic enhancements
  const isArabic = lang.toLowerCase().startsWith("ar") || lang.toLowerCase() === "darija";
  const isDarija = isArabic && (lang.toLowerCase().includes("ma") || lang.toLowerCase() === "darija");

  if (isArabic) {
    if (isDarija) {
      for (const [pattern, replacement] of DARIJA_PHONETIC_DICTIONARY) {
        text = text.replace(pattern, replacement);
      }
    }
    for (const [pattern, replacement] of ARABIC_PHONETIC_ENHANCEMENTS) {
      text = text.replace(pattern, replacement);
    }
  }

  // 9. Collapse excess whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Split text into short, natural acoustic chunks (ideally 35-90 characters)
 * to give synthesis engines natural breathing points and prevent robotic monotonic fatigue.
 */
export function splitIntoSentences(
  text: string,
  maxChunkLength: number = 85,
  lang: string = "ar-MA"
): string[] {
  if (!text || text.trim() === "") return [];

  const cleaned = cleanTextForSpeech(text, lang);
  if (!cleaned) return [];

  // Split by common sentence delimiters: . ! ? ؟ ، ؛ \n
  const rawSegments = cleaned
    .split(/([.!?؟،؛\n]+)/)
    .reduce<string[]>((acc, part, idx, arr) => {
      if (idx % 2 === 0) {
        const delimiter = arr[idx + 1] || "";
        const sentence = (part + delimiter).trim();
        if (sentence) {
          acc.push(sentence);
        }
      }
      return acc;
    }, []);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const seg of rawSegments) {
    if ((currentChunk + " " + seg).trim().length <= maxChunkLength) {
      currentChunk = (currentChunk + " " + seg).trim();
    } else {
      if (currentChunk) {
        chunks.push(ensurePunctuation(currentChunk));
      }

      // If a single segment is longer than maxChunkLength, break by clauses or words
      if (seg.length > maxChunkLength) {
        // Try breaking by conjunctions (و، ثم، لكن، لأن) or words
        const words = seg.split(" ");
        let wordSubChunk = "";
        for (const w of words) {
          if ((wordSubChunk + " " + w).trim().length <= maxChunkLength) {
            wordSubChunk = (wordSubChunk + " " + w).trim();
          } else {
            if (wordSubChunk) {
              chunks.push(ensurePunctuation(wordSubChunk));
            }
            wordSubChunk = w;
          }
        }
        currentChunk = wordSubChunk;
      } else {
        currentChunk = seg;
      }
    }
  }

  if (currentChunk) {
    chunks.push(ensurePunctuation(currentChunk));
  }

  return chunks.length > 0 ? chunks : [ensurePunctuation(cleaned)];
}

/**
 * Ensures proper trailing punctuation for natural synthesizer pauses
 */
function ensurePunctuation(sentence: string): string {
  const trimmed = sentence.trim();
  if (!trimmed) return "";
  const lastChar = trimmed.slice(-1);
  if (["!", "?", "؟", ".", "،", "؛", ":"].includes(lastChar)) {
    return trimmed;
  }
  // Add Arabic comma for smooth breathing room
  return trimmed + "،";
}

/**
 * Full preprocessing pipeline
 */
export function preprocessSpeechText(
  rawText: string,
  maxChunkLength: number = 85,
  lang: string = "ar-MA"
): PreprocessedSpeechResult {
  const fullNormalizedText = cleanTextForSpeech(rawText, lang);
  const chunks = splitIntoSentences(rawText, maxChunkLength, lang);
  return {
    fullNormalizedText,
    chunks,
  };
}
