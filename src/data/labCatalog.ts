import { LabDefinition } from "../types";

export const LAB_CATALOG: LabDefinition[] = [
  // ================= LEVEL 1: أفهم الذكاء الاصطناعي (Classification & Computer Vision) =================
  {
    key: "fruit-classifier",
    titleAr: "مصنف الفواكه الذكي 🍎",
    titleEn: "Smart Fruit & Veg Classifier",
    category: "classification",
    levelId: 1,
    difficulty: "easy",
    estimatedMinutes: 8,
    descriptionAr: "درب نموذج تعلّم آلي على عينات الفواكه ليميّز بين التفاح والموز والبرتقال بناءً على الوزن والملمس واللون.",
    learningGoalAr: "فهم مبدأ التعلّم الإشرافي (Supervised Learning) وكيف تتحول البيانات إلى قرارات ذكية.",
    tipsAr: [
      "كلما زادت العينات التدريبية، ارتفعت دقة النموذج في توقع الأصناف غير المعروفة!",
      "البيانات المتوازنة تمنع النموذج من التحيز لصنف دون غيره.",
      "فصل البيانات إلى تدريب واختبار هو سر نجاح مهندسي الذكاء الاصطناعي.",
    ],
    explanationAr: "لقد دربت نموذجاً حقيقياً للتصنيف! قمت بتزويد الخوارزمية بميزات عددية (الوزن واللون) وربطتها بتسميات، فاستطاعت الآلة بناء حد قرار رياضي ذكي للتنبؤ الفوري.",
    baseAccuracy: 95,
    improveBonus: 3,
    thumbnail: "🍎",
    tags: ["Supervised ML", "Classification", "Feature Extraction", "Level-1"],
    starterCode: `# نموذج تصنيف الفواكه بالتعلم الآلي
features = [[150, 1], [170, 1], [120, 2], [130, 2]] # [الوزن, الملمس]
labels = ["تفاح", "تفاح", "برتقال", "برتقال"]
model.train(features, labels)
print("دقة النموذج المحققة:", model.score())`,
  },
  {
    key: "emotion-classifier",
    titleAr: "مصنف المشاعر والتعابير 😊",
    titleEn: "Facial Emotion & Mood Classifier",
    category: "classification",
    levelId: 1,
    difficulty: "easy",
    estimatedMinutes: 10,
    descriptionAr: "ابنِ مصنفاً ذكياً يقرأ علامات الوجه (انحناء الفم، اتساع العينين) ويصنف المشاعر: سعيد، متفاجئ، أو مفكر.",
    learningGoalAr: "اكتشاف كيف تترجم الحواسيب الإشارات الحيوية إلى فئات شعورية واضحة.",
    tipsAr: [
      "انحناء الفم إلى أعلى مؤشر قوي على الابتسامة والسعادة!",
      "اتساع العيون مع ارتفاع الحواجب يشير إلى الدهشة أو التفكير العميق.",
      "النماذج الذكية تحسب احتمالية لكل شعور وتختار الأعلى ثقة.",
    ],
    explanationAr: "أحسنت! نموذجك الآن يستخرج معالم الوجه الرياضية ويحسب درجات الاحتمالية لكل تعبير شعوري بدقة متناهية وسرعة فائقة.",
    baseAccuracy: 94,
    improveBonus: 4,
    thumbnail: "😊",
    tags: ["Facial AI", "Emotion Classification", "Data Probability", "Level-1"],
    starterCode: `# استخراج ميزات التعابير وتصنيف المشاعر
landmarks = {"mouth_curve": 0.85, "eye_openness": 0.9}
predicted_emotion = emotion_ai.predict(landmarks)
print("التوقع الشعوري:", predicted_emotion)`,
  },
  {
    key: "object-detector",
    titleAr: "كاشف الأشياء والوجوه البصري 👁️",
    titleEn: "Visual Object & Face Detector",
    category: "computer-vision",
    levelId: 1,
    difficulty: "medium",
    estimatedMinutes: 12,
    descriptionAr: "حلل مصفوفات البكسلات واستخرج الملامح واكتشف المربعات المحيطة (Bounding Boxes) للوجوه والأشياء في الزمن الحقيقي.",
    learningGoalAr: "فهم كيفية معالجة الصور الرقمية وتحويل المصفوفات اللونية إلى كائنات محددة.",
    tipsAr: [
      "الصورة الرقمية هي مجرد جدول أرقام (Matrix) يمثل شدة الضوء والألوان RGB!",
      "خوارزميات الرؤية تبحث عن التباين الحاد في الحواف لتحديد حدود الأجسام.",
      "المربع المحيط (Bounding Box) يحدد الإحداثيات [X, Y, العرض, الارتفاع].",
    ],
    explanationAr: "مبارك! قمت بتطبيق الرؤية الحاسوبية على مصفوفة بكسلات كاملة واستخرجت المربعات المحيطة (Bounding Boxes) بدقة فائقة كالكاميرات الذكية في السيارات ذاتية القيادة.",
    baseAccuracy: 96,
    improveBonus: 2,
    thumbnail: "👁️",
    tags: ["Computer Vision", "Bounding Box", "Pixel Matrix", "Level-1"],
    starterCode: `# معالجة الصورة واستخراج المربعات المحيطة
matrix = load_image_pixels("camera_feed.jpg")
detected_boxes = vision_engine.detect_objects(matrix, threshold=0.85)
print(f"تم كشف {len(detected_boxes)} كائنات بدقة عالية!")`,
  },
  {
    key: "color-sorter",
    titleAr: "فارز الألوان والمصفوفات الذكي 🎨",
    titleEn: "Smart Pixel Color Sorter",
    category: "computer-vision",
    levelId: 1,
    difficulty: "easy",
    estimatedMinutes: 8,
    descriptionAr: "تحليل الألوان الأساسية RGB في الصور وفرز الكائنات حسب درجات التباين والتشبع اللوني التلقائي.",
    learningGoalAr: "استيعاب تمثيل الألوان الحاسوبي (RGB) وطرق الفلترة البصرية.",
    tipsAr: [
      "كل بكسل يتكون من 3 قنوات: الأحمر (Red)، الأخضر (Green)، والأزرق (Blue).",
      "القيمة 255 تعني اللون بأعلى سطوع، والصفر يعني غيابه التام.",
      "عتبة الفصل (Threshold) تسمح بفصل الكائن عن خلفية الصورة بسهولة.",
    ],
    explanationAr: "رائع! استطعت تحليل القنوات اللونية الثلاث وتطبيق قناع ترشيح (Mask Filter) لفصل الألوان بدقة هندسية مبهرة.",
    baseAccuracy: 97,
    improveBonus: 3,
    thumbnail: "🎨",
    tags: ["Color Matrix", "RGB Filters", "Image Segmentation", "Level-1"],
    starterCode: `# فرز قنوات الألوان وتطبيق القناع
red_channel = image[:, :, 0]
mask = red_channel > 200
filtered_objects = apply_color_mask(image, mask)
print("تم فرز وتحديد الكائنات الملونة بنجاح")`,
  },

  // ================= LEVEL 2: أتحكم في الأوامر (Prompt Engineering) =================
  {
    key: "story-prompter",
    titleAr: "أوامر القصص الخيالية الذكية 🔮",
    titleEn: "Sci-Fi Story Prompt Architect",
    category: "prompt-engineering",
    levelId: 2,
    difficulty: "easy",
    estimatedMinutes: 10,
    descriptionAr: "طبق معادلة الأوامر الخماسية (الدور، المهمة، السياق، القيود، الأسلوب) لتوجيه الذكاء التوليدي لصناعة قصة فضاء ملهمة.",
    learningGoalAr: "إتقان هيكلة الأوامر (Prompt Architecture) للتحكم الدقيق في مخرجات النماذج اللغوية الكبيرة.",
    tipsAr: [
      "تحديد الدور (مثال: 'أنت رائد فضاء مؤلف') يجعل الذكاء يتبنى نبرة ومعجم متخصص.",
      "وضع القيود الصارمة (مثال: 'في 3 فقرات فقط') يمنع النموذج من الاسترسال غير المفيد.",
      "درجة الحرارة (Temperature) المنخفضة تعطي منطقاً ثابتاً، والمرتفعة تطلق العنان للإبداع!",
    ],
    explanationAr: "مذهل! لقد أتقنت صياغة الأوامر الخماسية، مما جعل النموذج التوليدي يقدم حبكة متماسكة بدون هلوسة أو خروج عن السياق المحدد.",
    baseAccuracy: 98,
    improveBonus: 2,
    thumbnail: "🔮",
    tags: ["Prompt Engineering", "Generative AI", "Storytelling", "Level-2"],
    starterPrompt: `الدور: مؤلف خيال علمي مبدع للأطفال
المهمة: اكتب قصة عن رحلة الروبوت زكي لاستكشاف كويكب الزمرد
السياق: في عام 2050 حيث تعيش الروبوتات بتعاون مع البشر
القيود: 3 فقرات، خالية من العنف، تحتوي معلومة علمية حقيقية
الأسلوب: حماسي ومبهج`,
  },
  {
    key: "image-prompt-crafter",
    titleAr: "أوامر الرسوم التوليدية الفنية 🎨",
    titleEn: "Visual Generative Prompt Crafter",
    category: "prompt-engineering",
    levelId: 2,
    difficulty: "easy",
    estimatedMinutes: 10,
    descriptionAr: "اصنع وصفاً هندسياً دقيقاً لتوليد لوحة فنية لمدينة المستقبل مع تحديد الإضاءة وزاوية الكاميرا والأسلوب الفني.",
    learningGoalAr: "فهم الكلمات المفتاحية البصرية (Visual Modifiers) وأثرها على نماذج تحويل النص إلى صور.",
    tipsAr: [
      "حدد أسلوب الرسم بدقة: هل هو 3D Render، فن رقمي، كارتون، أم رسم زيتي؟",
      "أضف تفاصيل الإضاءة: 'إضاءة سينمائية دافئة'، 'وهج نيون مستقبلي'.",
      "تحديد زاوية اللقطة: 'منظور عين الطائر' أو 'لقطة مقربة واسعة'.",
    ],
    explanationAr: "إبداع حقيقي! هندسة الأوامر البصرية التي صممتها جمعت بين المفهوم والأسلوب والضوء، فنتج عنها مشهد رقمي متناسق وخلاب.",
    baseAccuracy: 96,
    improveBonus: 3,
    thumbnail: "🖼️",
    tags: ["Image Gen", "Visual Modifiers", "Art Prompts", "Level-2"],
    starterPrompt: `الموضوع: مدينة عائمة مستقبلية مليئة بالحدائق الذكية
الأسلوب: فن رقمي ثلاثي الأبعاد فائق الجودة، ألوان زاهية
الإضاءة: شمس الغروب الذهبية مع أضواء نيون زرقاء خافتة
المنظور: لقطة بانورامية واسعة بدقة 8k`,
  },
  {
    key: "explain-like-five",
    titleAr: "اشرح لي كأنني صغير (ELI5) 🧒",
    titleEn: "Explain Like I'm Five AI Prompt",
    category: "prompt-engineering",
    levelId: 2,
    difficulty: "easy",
    estimatedMinutes: 8,
    descriptionAr: "وجه الذكاء الاصطناعي لشرح مفاهيم معقدة مثل (الحوسبة السحابية) و(الشبكات العصبية) باستخدام تشبيهات ممتعة من واقع الطفل.",
    learningGoalAr: "تعلم تقنية القيود المعرفية وتعديل لغة النموذج لتناسب الفئات العمرية المستهدفة.",
    tipsAr: [
      "اطلب من النموذج استخدام التشبيهات المألوفة (كالليغو، أو الطبخ، أو حديقة الحيوان).",
      "امنع استخدام المصطلحات الإنجليزية المعقدة بدون تبسيط فوري.",
      "اطلب اختبار فهم الطفل في نهاية الشرح بسؤال مرح.",
    ],
    explanationAr: "أحسنت التوجيه! بفضل القيود الأسلوبية التي وضعتها، قام النموذج بتحويل مفهوم الشبكات العصبية إلى تشبيه مبسط كفريق نمل يتعاون لحمل حبة سكر!",
    baseAccuracy: 99,
    improveBonus: 1,
    thumbnail: "🧒",
    tags: ["ELI5", "Pedagogy Prompts", "Analogies", "Level-2"],
    starterPrompt: `المهمة: اشرح مفهوم 'الشبكات العصبية' لطفل عمره 7 سنوات
التشبيه: استخدم تشبيه فريق من الأصدقاء في ملعب المدرسة يتبادلون الكرة
القيود: بدون مصطلحات معقدة، الحد الأقصى 100 كلمة، ينتهي بتشجيع حماسي`,
  },
  {
    key: "prompt-debugger",
    titleAr: "مصلح الأوامر ومحارب الهلوسة 🛠️",
    titleEn: "Prompt Debugger & Anti-Hallucination",
    category: "prompt-engineering",
    levelId: 2,
    difficulty: "medium",
    estimatedMinutes: 12,
    descriptionAr: "اكتشف الأوامر الضعيفة التي تسبب إجابات خاطئة، وأعد صياغتها بوضع قيود الحقائق ومنع التأليف غير الموثق.",
    learningGoalAr: "التعرف على ظاهرة الهلوسة في الذكاء الاصطناعي وكيفية كبحها عبر الأوامر المحكمة.",
    tipsAr: [
      "أضف قيد: 'إذا لم تكن متأكداً من المعلومة، قل بكل أمانة لا أعلم'.",
      "حدد مصادر موثوقة ليقتبس النموذج منها فقط.",
      "اطلب من النموذج ذكر خطوات تفكيره أولاً قبل إعطاء النتيجة النهائية (Chain of Thought).",
    ],
    explanationAr: "رائع جداً! أصبحت الآن مهندس أوامر محترف قادراً على ترويض النماذج الذكية وحمايتها من تقديم معلومات مضللة أو غير دقيقة.",
    baseAccuracy: 95,
    improveBonus: 4,
    thumbnail: "🛠️",
    tags: ["Prompt Debugging", "Anti-Hallucination", "Chain of Thought", "Level-2"],
    starterPrompt: `الأمر الأصلي المعطوب: "احك لي عن كائن فضائي زار القاهرة عام 1920"
الأمر المصحح بالذكاء: "وضح الفرق بين الحقائق التاريخية والخيال، وإذا سُئلت عن خيال صرح بأنه قصة غير حقيقية"`,
  },

  // ================= LEVEL 3: أبني بنفسي (Python Code & Algorithms) =================
  {
    key: "python-turtle-loops",
    titleAr: "رسم المربع والحلقات التكرارية 🟩",
    titleEn: "Python Loops & Geometric Shapes",
    category: "python-code",
    levelId: 3,
    difficulty: "medium",
    estimatedMinutes: 12,
    descriptionAr: "اكتب كود بايثون حقيقي باستخدام حلقات التكرار (for loops) لتوجيه سلحفاة البرمجة لرسم مربعات وأشكال هندسية مكررة.",
    learningGoalAr: "إتقان مبدأ التكرار (Iteration) وتقليل تكرار الأوامر البرمجية لبناء خوارزميات رشيقة.",
    tipsAr: [
      "بدل كتابة 'تحرك للأمام ثم انعطف 90 درجة' أربع مرات، استخدم `for i in range(4):`!",
      "المسافات البادئة (Indentation) في بايثون هي التي تحدد ما يتم تنفيذه داخل الحلقة.",
      "يمكنك تغيير زاوية الدوران لصنع مضلعات خماسية وسداسية مذهلة!",
    ],
    explanationAr: "ممتاز! قمت باختصار كود طويل إلى 3 أسطر برمجية احترافية عبر حلقة `for`، وتعلمت كيف تتحكم الحواسيب في الرسومات الهندسية بدقة الزوايا الرياضية.",
    baseAccuracy: 96,
    improveBonus: 3,
    thumbnail: "🟩",
    tags: ["Python", "For Loops", "Turtle Geometry", "Level-3"],
    starterCode: `# رسم مربع ذكي بحلقة تكرار بايثون
import turtle

pen = turtle.Turtle()
pen.color("indigo")

# كرر 4 مرات: تحرك 100 خطوة ثم انعطف 90 درجة
for side in range(4):
    pen.forward(100)
    pen.right(90)

print("تم رسم المربع الهندسي بنجاح عبر حلقة التكرار!")`,
  },
  {
    key: "python-star-drawer",
    titleAr: "رسم النجمة الهندسية والزوايا ⭐",
    titleEn: "Python Star & Angle Calculations",
    category: "python-code",
    levelId: 3,
    difficulty: "medium",
    estimatedMinutes: 15,
    descriptionAr: "حساب الزاوية الهندسية 144 درجة في بايثون ورسم نجمة ذهبية خماسية عبر دمج العمليات الحسابية مع أوامر الحركة.",
    learningGoalAr: "ربط الرياضيات بالبرمجة واستخدام الزوايا الهندسية لإنتاج أعمال بصرية متقنة.",
    tipsAr: [
      "مجموع زوايا دوران النجمة الخماسية هو 720 درجة، لذا كل زاوية انعطاف تساوي 144 درجة!",
      "استخدم متغيرات الألوان لتلوين كل ضلع بلون براق مختلف.",
      "يمكنك تغليف كود الرسم داخل دالة خاصة تسمى `draw_star()`!",
    ],
    explanationAr: "إنجاز مهندسين حقيقيين! استخدمت معادلة الزوايا الهندسية في بايثون لتوليد نجمة ذهبية منتظمة، وهذه هي اللبنة الأولى لبناء ألعاب ورسوم حاسوبية تفاعلية.",
    baseAccuracy: 97,
    improveBonus: 2,
    thumbnail: "⭐",
    tags: ["Python", "Geometry", "Functions", "Level-3"],
    starterCode: `# رسم نجمة خماسية متألقة بالبايثون
def draw_star(size=120):
    for i in range(5):
        pen.forward(size)
        pen.right(144)

draw_star(150)
print("نجمة ذهبية خماسية مرسومة بحسابات زوايا دقيقة!")`,
  },
  {
    key: "python-smart-counter",
    titleAr: "العداد التكراري والشروط المنطقية ⏱️",
    titleEn: "Python Smart Counter & Conditionals",
    category: "python-code",
    levelId: 3,
    difficulty: "easy",
    estimatedMinutes: 10,
    descriptionAr: "بناء عداد ذكي يفرز الأرقام الزوجية والفردية ويحسب مجموع نقاط تدريب نماذج الذكاء الاصطناعي مع اتخاذ قرارات شرطية.",
    learningGoalAr: "فهم العبارات الشرطية (if/else) وكيف تتخذ البرامج قرارات منطقية بناءً على قيم المتغيرات.",
    tipsAr: [
      "المؤثر `%` (باقي القسمة) يساعدنا في معرفة هل العدد زوجي: `number % 2 == 0`.",
      "عبارة `if` تنفذ الكود فقط عندما يتحقق الشرط المنطقي وتكون نتيجته صحيحة (True).",
      "العداد التراكمي `total += score` هو قلب خوارزميات حساب النتائج في الأنظمة الذكية.",
    ],
    explanationAr: "أحسنت! كودك الآن يحلل البيانات عدداً بعد عدد، ويفرز الأرقام تلقائياً ويتخذ قرارات منطقية كما تفعل رقاقات المعالجة في الروبوتات.",
    baseAccuracy: 98,
    improveBonus: 2,
    thumbnail: "⏱️",
    tags: ["Python", "If Else", "Logic Operators", "Level-3"],
    starterCode: `# عداد وفرز درجات التجارب
scores = [95, 88, 100, 72, 98]
high_scores = []

for score in scores:
    if score >= 90:
        high_scores.append(score)
        print(f"درجة متميزة: {score} ⭐")

print(f"إجمالي التجارب المتفوقة: {len(high_scores)}")`,
  },
  {
    key: "python-pattern-gen",
    titleAr: "أنماط النجوم والمصفوفات النصية 🌟",
    titleEn: "Nested Loops & ASCII Pattern Matrix",
    category: "python-code",
    levelId: 3,
    difficulty: "hard",
    estimatedMinutes: 15,
    descriptionAr: "برمجة الحلقات المتداخلة (Nested Loops) لتوليد أهرامات وأنماط مصفوفات نصية جميلة على شاشة الأوامر كالمطورين المحترفين.",
    learningGoalAr: "فهم الحلقات المتداخلة (Nested Loops) والتحكم في إحداثيات الصفوف والأعمدة البرمجية.",
    tipsAr: [
      "الحلقة الخارجية تتحكم في رقم السطر، والحلقة الداخلية تتحكم في عدد الرموز في ذلك السطر.",
      "المعامل `end=''` في بايثون يمنع الانتقال لسطر جديد حتى تكتمل طباعة الصف بأكمله.",
      "المصفوفات النصية هي النموذج المبسط لكيفية تخزين الصور والخرائط في الذاكرة!",
    ],
    explanationAr: "إتقان فائق! بنيت خوارزمية مصفوفة كاملة بحلقات متداخلة، وهي نفس التقنية المستخدمة في بناء جداول قواعد البيانات وشاشات العرض الرقمية.",
    baseAccuracy: 95,
    improveBonus: 4,
    thumbnail: "🌟",
    tags: ["Python", "Nested Loops", "ASCII Art", "Level-3"],
    starterCode: `# توليد هرم نجمي بالحلقات المتداخلة
rows = 5
for i in range(1, rows + 1):
    # طباعة المسافات والنجوم
    spaces = " " * (rows - i)
    stars = "⭐" * i
    print(spaces + stars)

print("تم بناء هرم النجوم الخوارزمي بنجاح تام!")`,
  },
];

export function getLabDefinition(key: string): LabDefinition | undefined {
  return LAB_CATALOG.find((lab) => lab.key === key);
}

export function getLabsByLevel(levelId: number): LabDefinition[] {
  return LAB_CATALOG.filter((lab) => lab.levelId === levelId);
}

export function getLabsByCategory(category: string): LabDefinition[] {
  return LAB_CATALOG.filter((lab) => lab.category === category);
}
