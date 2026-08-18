export type AppLanguage = "darija" | "ar" | "fr" | "en";

export interface TranslationDict {
  nav: {
    home: string;
    path: string;
    pathBadge: string;
    lessons: string;
    labs: string;
    projects: string;
    chat: string;
    graduation: string;
    graduationCertified: string;
    graduationReady: string;
    parent_report: string;
    rewards: string;
  };
  statusBar: {
    storageConnected: string;
    storageReadOnly: string;
    rankLabel: string;
    projectsCount: string;
    accuracyLabel: string;
    certifiedBadge: string;
    towardsDev: string;
  };
  header: {
    appTitle: string;
    appSubtitle: string;
    forKidsBadge: string;
    zakiCustomizer: string;
    levelPrefix: string;
    guestUser: string;
    loginBtn: string;
    soundOn: string;
    soundOff: string;
    languageBtn: string;
    languageModalTitle: string;
    languageModalSubtitle: string;
    close: string;
    activeLanguage: string;
  };
  hero: {
    welcomeMessage: string;
    askZakiBtn: string;
    customizeZakiBtn: string;
  };
  portals: {
    pathTitle: string;
    pathSubtitle: string;
    pathDesc: string;
    pathBtn: string;

    lessonsTitle: string;
    lessonsSubtitle: string;
    lessonsDesc: string;
    lessonsBtn: string;

    labsTitle: string;
    labsSubtitle: string;
    labsDesc: string;
    labsBtn: string;

    projectsTitle: string;
    projectsSubtitle: string;
    projectsDesc: string;
    projectsBtn: string;

    chatTitle: string;
    chatSubtitle: string;
    chatDesc: string;
    chatBtn: string;

    graduationTitle: string;
    graduationSubtitle: string;
    graduationDesc: string;
    graduationBtn: string;

    parentTitle: string;
    parentSubtitle: string;
    parentDesc: string;
    parentBtn: string;

    rewardsTitle: string;
    rewardsSubtitle: string;
    rewardsDesc: string;
    rewardsBtn: string;
  };
  chat: {
    title: string;
    subtitle: string;
    suggestedQuestions: string;
    placeholder: string;
    listening: string;
    send: string;
    stopAudio: string;
    zakiVoice: string;
    changeLanguage: string;
    clearChat: string;
    thinking: string;
    errorConnection: string;
    replay: string;
    listen: string;
    stop: string;
  };
  roles: {
    parent: string;
    child: string;
    guest: string;
  };
  common: {
    xp: string;
    level: string;
    daysStreak: string;
    save: string;
    cancel: string;
    confirm: string;
    back: string;
    loading: string;
    success: string;
    congratulations: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDict> = {
  // 1. الدارجة المغربية
  darija: {
    nav: {
      home: "الرئيسية",
      path: "المسار ديالي 🚀",
      pathBadge: "3 مستويات",
      lessons: "الدروس 📚",
      labs: "المختبر 🧪",
      projects: "المشاريع ديالي 📁",
      chat: "هضر مع زكي 💬",
      graduation: "التخرج والشهادة 🎓",
      graduationCertified: "معتمد ⭐",
      graduationReady: "واجد للتخرج!",
      parent_report: "تقرير الوالدين 👨‍👩‍👧",
      rewards: "الجوائز والأوسمة 🏆",
    },
    statusBar: {
      storageConnected: "التخزين خدام مزيان 💾",
      storageReadOnly: "وضع القراءة فقط",
      rankLabel: "الرتبة",
      projectsCount: "مشاريع مصاوبة",
      accuracyLabel: "نسبة الدقة",
      certifiedBadge: "شهادة مطور معتمدة 🎓",
      towardsDev: "طريق نحو مطور صغير 🚀",
    },
    header: {
      appTitle: "مُعَلِّمُ الذَّكَاءِ",
      appSubtitle: "Moallem Al-Zaka (الدارجة 🇲🇦)",
      forKidsBadge: "للوليدات 🚀",
      zakiCustomizer: "🎨 زكي",
      levelPrefix: "مستوى",
      guestUser: "ضيف 👤",
      loginBtn: "دخول",
      soundOn: "تشغيل الصوت",
      soundOff: "إيقاف الصوت",
      languageBtn: "اللغة 🇲🇦",
      languageModalTitle: "اختار اللغة المفضلة ديالك",
      languageModalSubtitle: "كتغير نصوص التطبيق وردود زكي والصوت ديالو بنقرة وحدة!",
      close: "إغلاق",
      activeLanguage: "اللغة المختارة حالياً",
    },
    hero: {
      welcomeMessage:
        "مرحباً بيك أ صاحبي فـ أكاديمية الذكاء الاصطناعي للوليدات! 🤖✨\nأنا زكي، المساعد ديالك فكل خطوة. اختار مغامرة من اللي كاينين لتحت باش نبرمجو ونكتاشفو العالم الذكي معاً!",
      askZakiBtn: "سول زكي 💬",
      customizeZakiBtn: "بدل شكل زكي 🎨",
    },
    portals: {
      pathTitle: "مسار التعلّم الذكي",
      pathSubtitle: "3 مستويات متدرجة",
      pathDesc: "رحلة تفاعلية خطوة بخطوة من البدايات حتى تصنع أول روبوت ديالك وتفهم كيفاش كيفكر!",
      pathBtn: "تابع المسار 🚀",

      lessonsTitle: "دروس تفاعلية ممتعة",
      lessonsSubtitle: "شروحات مبسطة",
      lessonsDesc: "دروس تفاعلية مع أنشطة وأسئلة ذكية ونطق صوتي واضح للكلمات!",
      lessonsBtn: "افتح الدروس 📚",

      labsTitle: "مختبر التجارب والذكاء",
      labsSubtitle: "4 مختبرات عملية",
      labsDesc: "درّب روبوت التعرف على الصور، جرب هندسة الأوامر، وافهم أخلاقيات الذكاء!",
      labsBtn: "ادخل للمختبر 🧪",

      projectsTitle: "المحفظة والمشاريع",
      projectsSubtitle: "إبداعاتك الموثقة",
      projectsDesc: "شوف كل المشاريع اللي درتي، مع بطاقات إتقان وشهادات قابلة للتحميل والمشاركة!",
      projectsBtn: "شوف المشاريع 📁",

      chatTitle: "المساعد الذكي زكي",
      chatSubtitle: "حوار ونطق بالدارجة",
      chatDesc: "سول زكي على أي فكرة أو كود أو سؤال في بالك، وغادي يجاوبك ويشرح ليك بالصوت!",
      chatBtn: "هضر مع زكي 💬",

      graduationTitle: "التخرج والشهادة",
      graduationSubtitle: "رتبة مطور معتمد",
      graduationDesc: "كمل التحديات والمشاريع باش تاخد شهادة تخرج رسمية معتمدة باسمك!",
      graduationBtn: "شوف التخرج 🎓",

      parentTitle: "لوحة الوالدين",
      parentSubtitle: "متابعة التقدم",
      parentDesc: "تقرير مبسط للآباء والأمهات لمتابعة مهارات الطفل ومستوى الدقة وساعات التعلم.",
      parentBtn: "فتح التقرير 👨‍👩‍👧",

      rewardsTitle: "الخزانة والأوسمة",
      rewardsSubtitle: "الجوائز والنقاط",
      rewardsDesc: "جمع كؤوس التميز وأوسمة المبرمجين وافتح ملابس جديدة ومميزة لشخصية زكي!",
      rewardsBtn: "افتح الخزانة 🏆",
    },
    chat: {
      title: "الأستاذ زكي",
      subtitle: "المساعد الذكي للأطفال",
      suggestedQuestions: "أسئلة مقترحة:",
      placeholder: "اكتب سؤالك لـ زكي بالدارجة...",
      listening: "كنسمع للصوت ديالك دابا...",
      send: "إرسال",
      stopAudio: "إيقاف الصوت 🛑",
      zakiVoice: "صوت زكي 🎙️",
      changeLanguage: "اللغة ⚙️",
      clearChat: "مسح المحادثة",
      thinking: "زكي كيفكر فـ أحسن جواب ليك... 💡",
      errorConnection: "عذراً أ صاحبي! وقع مشكل بسيط فالشبكة. عاود جرب دابا! 🚀",
      replay: "إعادة القراءة",
      listen: "استمع 🔊",
      stop: "إيقاف 🛑",
    },
    roles: {
      parent: "ولي أمر 👨‍👩‍👧",
      child: "طفل مبتكر 👦",
      guest: "ضيف 👤",
    },
    common: {
      xp: "نقطة XP",
      level: "مستوى",
      daysStreak: "أيام حماس",
      save: "حفظ",
      cancel: "إلغاء",
      confirm: "تأكيد",
      back: "رجوع",
      loading: "جارِ التحميل...",
      success: "نجاح!",
      congratulations: "مبروك يا بطل!",
    },
  },

  // 2. العربية الفصحى
  ar: {
    nav: {
      home: "الرئيسية",
      path: "مساري 🚀",
      pathBadge: "3 مستويات",
      lessons: "الدروس 📚",
      labs: "المختبر 🧪",
      projects: "المشاريع 📁",
      chat: "المساعد زكي 💬",
      graduation: "التخرج والشهادة 🎓",
      graduationCertified: "معتمد ⭐",
      graduationReady: "جاهز للتخرج!",
      parent_report: "تقرير ولي الأمر 👨‍👩‍👧",
      rewards: "الخزانة والأوسمة 🏆",
    },
    statusBar: {
      storageConnected: "التخزين المحلي متصل 💾",
      storageReadOnly: "وضع القراءة فقط",
      rankLabel: "الرتبة",
      projectsCount: "مشاريع موثقة",
      accuracyLabel: "متوسط الدقة",
      certifiedBadge: "شهادة مطور معتمدة 🎓",
      towardsDev: "نحو رتبة مطور صغير 🚀",
    },
    header: {
      appTitle: "مُعَلِّمُ الذَّكَاءِ",
      appSubtitle: "Moallem Al-Zaka (العربية 🇸🇦)",
      forKidsBadge: "للأطفال 🚀",
      zakiCustomizer: "🎨 زكي",
      levelPrefix: "مست",
      guestUser: "ضيف 👤",
      loginBtn: "دخول",
      soundOn: "تشغيل الصوت",
      soundOff: "إيقاف الصوت",
      languageBtn: "اللغة 🇸🇦",
      languageModalTitle: "اختر لغتك المفضلة",
      languageModalSubtitle: "تتحول كل نصوص الواجهة وردود زكي ومحرك الصوت فوراً للغة المختارة!",
      close: "إغلاق",
      activeLanguage: "اللغة النشطة حالياً",
    },
    hero: {
      welcomeMessage:
        "أهلاً بك يا صديقي في أكاديمية الذكاء الاصطناعي للأطفال! 🤖✨\nأنا زكي، مساعدك الشخصي للذكاء الاصطناعي. اختر إحدى المغامرات التفاعلية بالأسفل لنستكشف العالم الرقمي معاً!",
      askZakiBtn: "اسأل زكي 💬",
      customizeZakiBtn: "تخصيص زكي 🎨",
    },
    portals: {
      pathTitle: "مسار التعلّم الذكي",
      pathSubtitle: "3 مستويات متدرجة",
      pathDesc: "رحلة استكشافية متكاملة تأخذك من الصفر لتفهم أسرار الروبوتات والذكاء الاصطناعي وتصبح مبرمجاً واعداً!",
      pathBtn: "تابع المسار 🚀",

      lessonsTitle: "الدروس التفاعلية",
      lessonsSubtitle: "مفاهيم مبسطة ومدعومة بالصوت",
      lessonsDesc: "دروس تفاعلية شيقة مع أمثلة من حياتنا اليومية وأسئلة تفاعلية تشجعك على التفكير والاكتشاف.",
      lessonsBtn: "استكشف الدروس 📚",

      labsTitle: "مختبر الذكاء الاصطناعي",
      labsSubtitle: "4 مختبرات عملية وتطبيقية",
      labsDesc: "جرّب تدريب نماذج الرؤية الحاسوبية، واكتب أوامر توليد الصور، واكتشف أخلاقيات الذكاء في بيئة آمنة.",
      labsBtn: "ادخل المختبر 🧪",

      projectsTitle: "المحفظة الرقمية للمشاريع",
      projectsSubtitle: "إنجازاتك العملية الموثقة",
      projectsDesc: "استعرض مشاريعك المكتملة، وحمّل بطاقات الإتقان القابلة للمشاركة والطباعة لتفتخر بإبداعاتك!",
      projectsBtn: "استعرض المحفظة 📁",

      chatTitle: "المساعد الذكي زكي",
      chatSubtitle: "حوار تفاعلي ونطق طبيعي",
      chatDesc: "تحدث مع زكي عبر الكتابة أو الصوت، واسأله عن أي فكرة أو مصطلح لتتلقى شرحاً دافئاً ومبسطاً.",
      chatBtn: "تحدث مع زكي 💬",

      graduationTitle: "التخرج والشهادة الرسمية",
      graduationSubtitle: "رتبة مطور ذكاء اصطناعي ناشئ",
      graduationDesc: "أكمل المشاريع والمتطلبات الأساسية لتحصل على شهادة تخرج رسمية معتمدة ورقم تعريف فريد!",
      graduationBtn: "بوابة التخرج 🎓",

      parentTitle: "تقرير ولي الأمر",
      parentSubtitle: "لوحة متابعة الأداء والتقدم",
      parentDesc: "نافذة مخصصة للآباء والمعلمين لمتابعة ساعات التعلّم ونسبة الإتقان والمشاريع المنجزة بدقة.",
      parentBtn: "عرض التقرير 👨‍👩‍👧",

      rewardsTitle: "الخزانة والأوسمة",
      rewardsSubtitle: "كؤوس وجوائز وتخصيص",
      rewardsDesc: "اجمع نقاط الخبرة وافتح أوسمة الشرف وكؤوس الإنجاز، وخصص مظهر شخصية زكي بملابس رائعة!",
      rewardsBtn: "فتح الخزانة 🏆",
    },
    chat: {
      title: "الأستاذ زكي",
      subtitle: "المساعد الذكي للأطفال",
      suggestedQuestions: "أسئلة مقترحة:",
      placeholder: "اكتب سؤالك لـ زكي بالعربية...",
      listening: "جارٍ الاستماع لصوتك الآن...",
      send: "إرسال",
      stopAudio: "إيقاف الصوت 🛑",
      zakiVoice: "صوت زكي 🎙️",
      changeLanguage: "اللغة ⚙️",
      clearChat: "مسح المحادثة",
      thinking: "زكي يفكر في أفضل إجابة مبسطة لك... 💡",
      errorConnection: "عذراً يا صديقي! حدث تعثر بسيط في شبكة الاتصال بـ Zaki AI. حاول مجدداً! 🚀",
      replay: "إعادة القراءة",
      listen: "استمع 🔊",
      stop: "إيقاف 🛑",
    },
    roles: {
      parent: "ولي أمر 👨‍👩‍👧",
      child: "طفل مبتكر 👦",
      guest: "ضيف 👤",
    },
    common: {
      xp: "XP",
      level: "مست",
      daysStreak: "أيام متتالية",
      save: "حفظ",
      cancel: "إلغاء",
      confirm: "تأكيد",
      back: "رجوع",
      loading: "جارٍ التحميل...",
      success: "تم بنجاح!",
      congratulations: "أحسنت يا بطل!",
    },
  },

  // 3. الفرنسية
  fr: {
    nav: {
      home: "Accueil",
      path: "Mon Parcours 🚀",
      pathBadge: "3 Niveaux",
      lessons: "Leçons 📚",
      labs: "Labos IA 🧪",
      projects: "Mes Projets 📁",
      chat: "Assistant Zaki 💬",
      graduation: "Diplôme & Certificat 🎓",
      graduationCertified: "Certifié ⭐",
      graduationReady: "Prêt au diplôme !",
      parent_report: "Espace Parents 👨‍👩‍👧",
      rewards: "Trophées & Badges 🏆",
    },
    statusBar: {
      storageConnected: "Stockage local connecté 💾",
      storageReadOnly: "Mode lecture seule",
      rankLabel: "Rang",
      projectsCount: "projets validés",
      accuracyLabel: "Précision moyenne",
      certifiedBadge: "Certificat Validé 🎓",
      towardsDev: "Objectif Jeune Développeur 🚀",
    },
    header: {
      appTitle: "GUIDE DE L'IA",
      appSubtitle: "Moallem Al-Zaka (Français 🇫🇷)",
      forKidsBadge: "Pour Enfants 🚀",
      zakiCustomizer: "🎨 Zaki",
      levelPrefix: "Niv",
      guestUser: "Invité 👤",
      loginBtn: "Connexion",
      soundOn: "Activer le son",
      soundOff: "Couper le son",
      languageBtn: "Langue 🇫🇷",
      languageModalTitle: "Choisis ta langue préférée",
      languageModalSubtitle: "Toute l'interface, les réponses de Zaki et la synthèse vocale s'adaptent instantanément !",
      close: "Fermer",
      activeLanguage: "Langue active actuelle",
    },
    hero: {
      welcomeMessage:
        "Bienvenue mon ami(e) dans l'Académie d'Intelligence Artificielle pour Enfants ! 🤖✨\nJe suis Zaki, ton guide personnel. Choisis une aventure interactive ci-dessous pour explorer le monde du futur !",
      askZakiBtn: "Parler à Zaki 💬",
      customizeZakiBtn: "Personnaliser Zaki 🎨",
    },
    portals: {
      pathTitle: "Parcours d'Apprentissage IA",
      pathSubtitle: "3 Niveaux Progressifs",
      pathDesc: "Une aventure interactive étape par étape pour comprendre le fonctionnement des algorithmes et créer des projets !",
      pathBtn: "Suivre le parcours 🚀",

      lessonsTitle: "Leçons Interactives & Audio",
      lessonsSubtitle: "Explications claires et simples",
      lessonsDesc: "Découvre les secrets de l'IA avec des exemples de la vie quotidienne, des quiz et une lecture vocale naturelle.",
      lessonsBtn: "Ouvrir les leçons 📚",

      labsTitle: "Laboratoire d'Expérimentation",
      labsSubtitle: "4 Ateliers Pratiques",
      labsDesc: "Entraîne des modèles de vision par ordinateur, teste le prompt engineering et explore l'éthique de l'IA !",
      labsBtn: "Entrer au labo 🧪",

      projectsTitle: "Portfolio & Projets",
      projectsSubtitle: "Tes réalisations documentées",
      projectsDesc: "Consulte tes projets terminés, télécharge tes fiches de maîtrise et partage tes créations avec fierté !",
      projectsBtn: "Voir le portfolio 📁",

      chatTitle: "Assistant Vocal & Écrit Zaki",
      chatSubtitle: "Dialogue fluide en français",
      chatDesc: "Pose toutes tes questions à Zaki par texte ou au micro et écoute ses explications bienveillantes !",
      chatBtn: "Discuter avec Zaki 💬",

      graduationTitle: "Diplôme Officiel & Certificat",
      graduationSubtitle: "Rang de Jeune Développeur IA",
      graduationDesc: "Valide tes projets pour recevoir ton certificat officiel signé avec un identifiant de vérification unique.",
      graduationBtn: "Espace Diplôme 🎓",

      parentTitle: "Rapport Pédagogique Parents",
      parentSubtitle: "Suivi des compétences",
      parentDesc: "Un tableau de bord clair pour les parents afin de suivre le temps d'apprentissage, la précision et les progrès.",
      parentBtn: "Ouvrir le rapport 👨‍👩‍👧",

      rewardsTitle: "Trophées, Badges & Coffre",
      rewardsSubtitle: "Récompenses et XP",
      rewardsDesc: "Gagne des points d'expérience, débloque des badges et personnalise la tenue de Zaki !",
      rewardsBtn: "Ouvrir le coffre 🏆",
    },
    chat: {
      title: "Professeur Zaki",
      subtitle: "Guide IA pour Enfants",
      suggestedQuestions: "Questions suggérées :",
      placeholder: "Pose ta question à Zaki en français...",
      listening: "Écoute de ta voix en cours...",
      send: "Envoyer",
      stopAudio: "Arrêter l'audio 🛑",
      zakiVoice: "Voix Zaki 🎙️",
      changeLanguage: "Langue ⚙️",
      clearChat: "Effacer la discussion",
      thinking: "Zaki réfléchit à la meilleure explication pour toi... 💡",
      errorConnection: "Oups ! Un petit problème de connexion. Réessaie dans un instant ! 🚀",
      replay: "Réécouter",
      listen: "Écouter 🔊",
      stop: "Arrêter 🛑",
    },
    roles: {
      parent: "Parent 👨‍👩‍👧",
      child: "Jeune Créateur 👦",
      guest: "Invité 👤",
    },
    common: {
      xp: "XP",
      level: "Niv",
      daysStreak: "Jours de suite",
      save: "Enregistrer",
      cancel: "Annuler",
      confirm: "Confirmer",
      back: "Retour",
      loading: "Chargement...",
      success: "Succès !",
      congratulations: "Bravo champion !",
    },
  },

  // 4. الإنجليزية
  en: {
    nav: {
      home: "Home",
      path: "My Journey 🚀",
      pathBadge: "3 Levels",
      lessons: "Lessons 📚",
      labs: "AI Labs 🧪",
      projects: "Projects 📁",
      chat: "Zaki Assistant 💬",
      graduation: "Graduation & Certificate 🎓",
      graduationCertified: "Certified ⭐",
      graduationReady: "Ready to graduate!",
      parent_report: "Parent Report 👨‍👩‍👧",
      rewards: "Rewards & Badges 🏆",
    },
    statusBar: {
      storageConnected: "Local storage connected 💾",
      storageReadOnly: "Read-only mode",
      rankLabel: "Rank",
      projectsCount: "documented projects",
      accuracyLabel: "Average accuracy",
      certifiedBadge: "Certified Developer 🎓",
      towardsDev: "Path to Young Developer 🚀",
    },
    header: {
      appTitle: "AI TEACHER FOR KIDS",
      appSubtitle: "Moallem Al-Zaka (English 🇬🇧)",
      forKidsBadge: "For Kids 🚀",
      zakiCustomizer: "🎨 Zaki",
      levelPrefix: "Lvl",
      guestUser: "Guest 👤",
      loginBtn: "Login",
      soundOn: "Sound On",
      soundOff: "Sound Off",
      languageBtn: "Language 🇬🇧",
      languageModalTitle: "Choose Your Preferred Language",
      languageModalSubtitle: "The entire interface, Zaki's responses, and voice speech synchronize instantly!",
      close: "Close",
      activeLanguage: "Current Active Language",
    },
    hero: {
      welcomeMessage:
        "Welcome my friend to the Artificial Intelligence Academy for Kids! 🤖✨\nI am Zaki, your personal AI companion. Pick an interactive quest below and let's explore the world of smart tech together!",
      askZakiBtn: "Ask Zaki 💬",
      customizeZakiBtn: "Customize Zaki 🎨",
    },
    portals: {
      pathTitle: "Smart Learning Journey",
      pathSubtitle: "3 Progressive Levels",
      pathDesc: "An engaging step-by-step adventure taking you from basics to building and training your first AI robot!",
      pathBtn: "Start Journey 🚀",

      lessonsTitle: "Interactive Audio Lessons",
      lessonsSubtitle: "Bite-sized concepts with voice",
      lessonsDesc: "Engaging lessons with everyday life analogies, quizzes, and clear natural speech synthesis for kids.",
      lessonsBtn: "Explore Lessons 📚",

      labsTitle: "Hands-on AI Labs",
      labsSubtitle: "4 Practical Workstations",
      labsDesc: "Train computer vision models, engineer creative prompts, and understand AI safety in a kid-friendly environment.",
      labsBtn: "Enter Lab 🧪",

      projectsTitle: "Portfolio & Projects",
      projectsSubtitle: "Your verified achievements",
      projectsDesc: "Review your completed projects, download mastery badges, and share your digital portfolio with pride!",
      projectsBtn: "View Portfolio 📁",

      chatTitle: "Zaki AI Assistant",
      chatSubtitle: "Interactive voice & text chat",
      chatDesc: "Chat with Zaki using text or voice, ask any question, and get cheerful, easy-to-understand explanations!",
      chatBtn: "Chat with Zaki 💬",

      graduationTitle: "Official Graduation & Certificate",
      graduationSubtitle: "Junior AI Developer Rank",
      graduationDesc: "Complete required labs and challenges to earn an official verified certificate with a unique badge ID.",
      graduationBtn: "Graduation Portal 🎓",

      parentTitle: "Parent & Teacher Dashboard",
      parentSubtitle: "Progress & Skill Insights",
      parentDesc: "A dedicated analytics view for parents to monitor learning time, accuracy rates, and completed projects.",
      parentBtn: "Open Report 👨‍👩‍👧",

      rewardsTitle: "Rewards, Badges & Locker",
      rewardsSubtitle: "Trophies and custom skins",
      rewardsDesc: "Earn experience points, unlock achievement trophies, and customize Zaki's appearance with cool outfits!",
      rewardsBtn: "Open Locker 🏆",
    },
    chat: {
      title: "Teacher Zaki",
      subtitle: "AI Companion for Kids",
      suggestedQuestions: "Suggested Questions:",
      placeholder: "Type your question for Zaki in English...",
      listening: "Listening to your voice now...",
      send: "Send",
      stopAudio: "Stop Voice 🛑",
      zakiVoice: "Zaki Voice 🎙️",
      changeLanguage: "Language ⚙️",
      clearChat: "Clear Chat",
      thinking: "Zaki is thinking of the best answer for you... 💡",
      errorConnection: "Sorry my friend! A quick connection glitch occurred. Try again! 🚀",
      replay: "Replay",
      listen: "Listen 🔊",
      stop: "Stop 🛑",
    },
    roles: {
      parent: "Parent 👨‍👩‍👧",
      child: "Young Creator 👦",
      guest: "Guest 👤",
    },
    common: {
      xp: "XP",
      level: "Lvl",
      daysStreak: "Day Streak",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      loading: "Loading...",
      success: "Success!",
      congratulations: "Awesome job champion!",
    },
  },
};
