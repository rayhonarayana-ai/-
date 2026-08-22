export const REASON_CODES = {
  COLD_START_FOUNDATION: "COLD_START_FOUNDATION",
  SKILL_DEVELOPING_REMEDIATION: "SKILL_DEVELOPING_REMEDIATION",
  INSTRUCTION_COMPLETE_READY_FOR_ASSESSMENT: "INSTRUCTION_COMPLETE_READY_FOR_ASSESSMENT",
  CORE_CURRICULUM_NEXT_LESSON: "CORE_CURRICULUM_NEXT_LESSON",
  PRACTICAL_LAB_APPLICATION: "PRACTICAL_LAB_APPLICATION",
  ADVANCED_CHALLENGE: "ADVANCED_CHALLENGE",
  FALLBACK_FOUNDATION: "FALLBACK_FOUNDATION",
} as const;

export const POLICY_PRIORITIES = {
  DEVELOPING_REMEDIATION: 100,
  READY_FOR_ASSESSMENT: 80,
  CORE_NEXT_LESSON: 60,
  PRACTICAL_LAB: 40,
  ADVANCED_CHALLENGE: 20,
  COLD_START: 10,
} as const;

export const TOPIC_BY_SKILL: Record<string, { ar: string; en: string }> = {
  skill_ai_foundations: {
    ar: "أساسيات الذكاء الاصطناعي",
    en: "AI Foundations & Logic",
  },
  skill_machine_learning: {
    ar: "تعلّم الآلة والتصنيف",
    en: "Machine Learning & Models",
  },
  skill_computer_vision: {
    ar: "رؤية الكمبيوتر ومعالجة الصور",
    en: "Computer Vision & Features",
  },
  skill_prompt_engineering: {
    ar: "هندسة الأوامر والذكاء التوليدي",
    en: "Prompt Engineering & Architecture",
  },
  skill_ai_ethics: {
    ar: "أخلاقيات وأمان الذكاء الاصطناعي",
    en: "AI Ethics & Safety",
  },
  skill_python_coding: {
    ar: "برمجة بايثون والخوارزميات",
    en: "Python Programming & Loops",
  },
};
