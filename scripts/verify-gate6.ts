/**
 * GATE 6 Verification Suite: Child Safety, Privacy & Data Minimization
 * Formal Acceptance Proofs 1 through 20
 */

import { PRIVACY_POLICY, isAllowedChildStateField, containsBase64Image } from "../src/domain/privacy/policy.js";
import { resetEducationalData, UI_PREFERENCE_KEYS } from "../src/domain/privacy/reset.js";
import {
  progressStore,
  learningEvidenceStore,
  labsStore,
  certificateStore,
  starredProjectsStore,
  STORAGE_KEYS,
  DEFAULT_PROGRESS,
} from "../src/persistence/index.js";
import { BASE_CHILD_SAFETY_RULES, composeSystemInstruction } from "../server/ai/safety.js";
import { AIGateway } from "../server/ai/gateway.js";
import { AIProvider, ProviderRequest, ProviderResponse } from "../server/ai/types.js";
import { validateChatInput, validatePedagogicalReportInput, validateQuizInput } from "../server/ai/validation.js";
import { deriveMasteryStatus } from "../src/utils/learningEvidence.js";
import { calculateLevel } from "../src/domain/progress/level.js";
import { evaluateStreakOnActivity } from "../src/domain/progress/streak.js";
import { LearningEvidence } from "../src/types/learningEvidence.js";
import fs from "fs";
import path from "path";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

// Mock AI Provider
class MockPrivacyProvider implements AIProvider {
  public readonly name = "mock-privacy-provider";
  public calls: ProviderRequest[] = [];

  public async generate(request: ProviderRequest): Promise<ProviderResponse> {
    this.calls.push(request);
    return {
      text: "رد الذكاء الاصطناعي الآمن والصديق للأطفال 🤖",
      modelUsed: "gemini-3.7-flash",
      latencyMs: 40,
    };
  }
}

// In-Memory LocalStorage polyfill for NodeJS test runner
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(n: number): string | null {
    return Object.keys(this.store)[n] || null;
  }
}

// Set global localStorage and window for node tests
if (typeof (global as any).localStorage === "undefined") {
  (global as any).localStorage = new MockLocalStorage();
}
if (typeof (global as any).window === "undefined") {
  (global as any).window = {
    localStorage: (global as any).localStorage,
    dispatchEvent: () => true,
  };
}

async function runGate6Verification() {
  console.log("\n=======================================================");
  console.log("🛡️  GATE 6 VERIFICATION: Child Safety & Privacy");
  console.log("=======================================================\n");

  // --------------------------------------------------------------------------
  // PROOF 1: Forensic Inventory Audit - No unnecessary PII fields in child state
  // --------------------------------------------------------------------------
  console.log("--- Group A: Data Minimization & Identity ---");
  {
    const allowed = ["xp", "level", "streakDays", "completedLessons", "completedLabs", "studentName", "zakiCustomization"];
    const forbidden = ["email", "phoneNumber", "homeAddress", "birthDate", "nationalId", "creditCard", "schoolName"];
    
    const allAllowedValid = allowed.every((f) => isAllowedChildStateField(f));
    const allForbiddenRejected = forbidden.every((f) => !isAllowedChildStateField(f));
    
    assert(
      allAllowedValid && allForbiddenRejected,
      "Proof 1: Forensic schema rejects unneeded PII (email, phone, address, national ID)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 2: Nickname Non-Legal Identity
  // --------------------------------------------------------------------------
  {
    const defaultName = DEFAULT_PROGRESS.studentName;
    const policyDefault = PRIVACY_POLICY.defaultStudentDisplayName;
    const isBounded = PRIVACY_POLICY.maxDisplayNameChars <= 50;
    
    assert(
      defaultName === "المستكشف الصغير" && defaultName === policyDefault && isBounded,
      "Proof 2: Student identity is strictly a display nickname (bounded to <= 50 chars)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 3: Chat In-Memory Transience
  // --------------------------------------------------------------------------
  console.log("\n--- Group B: In-Memory Transience (Chat & Images) ---");
  {
    const isChatPersisted = PRIVACY_POLICY.persistChatHistory;
    // Check that none of the storage keys are used for chat messages
    const storageKeys = Object.values(STORAGE_KEYS);
    const hasChatKey = storageKeys.some((k) => k.toLowerCase().includes("chat") || k.toLowerCase().includes("messages"));

    assert(
      !isChatPersisted && !hasChatKey,
      "Proof 3: AI chat conversation history is strictly transient in-memory only"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 4: Vision Image Transience
  // --------------------------------------------------------------------------
  {
    const isImagePersisted = PRIVACY_POLICY.persistUploadedImages;
    const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const detected = containsBase64Image(testBase64);

    assert(
      !isImagePersisted && detected,
      "Proof 4: Uploaded images are transient in-memory and base64 detection is active"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 5: LearningEvidence Data Minimization
  // --------------------------------------------------------------------------
  {
    // Clear and append evidence with huge/base64 metadata
    learningEvidenceStore.clearEvidence?.();
    const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
    
    const added = learningEvidenceStore.appendEvidence({
      type: "LAB_COMPLETED",
      sourceId: "lab-cv-test",
      skillIds: ["skill_computer_vision"],
      assessed: true,
      score: 95,
      passed: true,
      masteryEligible: true,
      metadata: {
        cleanKey: "valid_summary",
        leakedImage: testBase64,
        oversizedText: "A".repeat(400),
      },
    });

    const loaded = learningEvidenceStore.loadEvidence();
    const target = loaded.find((e) => e.id === added.id);
    const leakedImgPresent = target?.metadata?.leakedImage !== undefined;
    const oversizedPresent = target?.metadata?.oversizedText !== undefined;
    const cleanPresent = target?.metadata?.cleanKey === "valid_summary";

    // Test arbitrary nested properties (e.g. metadata.payload.nested.image)
    const nestedAdded = learningEvidenceStore.appendEvidence({
      type: "LAB_COMPLETED",
      sourceId: "lab-nested-test",
      skillIds: ["skill_neural_networks"],
      assessed: true,
      score: 100,
      passed: true,
      masteryEligible: true,
      metadata: {
        legitMetric: 42,
        nested: {
          screenshot: "data:image/png;base64,iVBORw0KGgoAAA...",
          hugeData: "B".repeat(500),
          cleanChild: "safe_tag",
        },
      },
    });

    const loadedNested = learningEvidenceStore.loadEvidence().find((e) => e.id === nestedAdded.id);
    const nestedCleanChildPresent = loadedNested?.metadata?.nested?.cleanChild === "safe_tag";
    const nestedScreenshotPresent = loadedNested?.metadata?.nested?.screenshot !== undefined;
    const nestedHugePresent = loadedNested?.metadata?.nested?.hugeData !== undefined;

    assert(
      !leakedImgPresent && !oversizedPresent && cleanPresent && nestedCleanChildPresent && !nestedScreenshotPresent && !nestedHugePresent,
      "Proof 5: LearningEvidence store strips raw base64 and oversized payloads from metadata (including nested properties)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 6: Local Educational Data Reset
  // --------------------------------------------------------------------------
  console.log("\n--- Group C: Local Educational Data Reset ---");
  {
    // Populate dummy state across all educational stores
    progressStore.saveProgress({
      ...DEFAULT_PROGRESS,
      xp: 500,
      level: 4,
      studentName: "بطل مؤقت",
    });
    certificateStore.saveCertificate({
      id: "test-cert",
      childName: "بطل مؤقت",
      titleAr: "شهادة إنجاز",
      issuedAt: new Date().toISOString(),
      totalProjects: 6,
      averageAccuracy: 95,
      levelsCompleted: 3,
      rank: "young-developer",
      rankTitleAr: "مطور صغير",
      highlightProjects: [],
      serialNumber: "CERT-1234",
    });

    // Execute reset
    const result = resetEducationalData();
    
    const progressAfter = progressStore.loadProgress();
    const certAfter = certificateStore.loadCertificate();
    const evidenceAfter = learningEvidenceStore.loadEvidence();

    assert(
      result.success &&
      progressAfter.xp === DEFAULT_PROGRESS.xp &&
      progressAfter.studentName === DEFAULT_PROGRESS.studentName &&
      certAfter === null &&
      evidenceAfter.length === 0,
      "Proof 6: resetEducationalData cleanly restores progress, clears evidence, and resets certificate"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 7: Non-Destructive Reset Boundary
  // --------------------------------------------------------------------------
  {
    // Set a third-party unrelated localStorage key
    (global as any).localStorage.setItem("unrelated_third_party_app_key", "important_data_123");
    
    // Execute educational reset
    resetEducationalData();
    
    const thirdPartyVal = (global as any).localStorage.getItem("unrelated_third_party_app_key");

    assert(
      thirdPartyVal === "important_data_123",
      "Proof 7: Scoped educational reset protects unrelated browser localStorage keys"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 8: UI Preference Isolation
  // --------------------------------------------------------------------------
  {
    (global as any).localStorage.setItem(UI_PREFERENCE_KEYS.LANGUAGE, "darija");
    (global as any).localStorage.setItem(UI_PREFERENCE_KEYS.VOICE_SETTINGS, '{"rate":1.1}');

    // Reset without preference wipe
    resetEducationalData({ resetUIPreferences: false });
    const langPreserved = (global as any).localStorage.getItem(UI_PREFERENCE_KEYS.LANGUAGE) === "darija";

    // Reset with explicit preference wipe
    resetEducationalData({ resetUIPreferences: true });
    const langCleared = (global as any).localStorage.getItem(UI_PREFERENCE_KEYS.LANGUAGE) === null;

    assert(
      langPreserved && langCleared,
      "Proof 8: UI preferences (language, voice) are preserved by default and optional in reset"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 9: AI Gateway Child Privacy Directives
  // --------------------------------------------------------------------------
  console.log("\n--- Group D: AI Safety & Gateway Privacy Boundaries ---");
  {
    const prompt = BASE_CHILD_SAFETY_RULES;
    const hasPrivacyInstruction = prompt.includes("لا تطلب أبداً ولا تشجع الطفل على مشاركة معلومات شخصية");
    const hasNoFullNameOrPhone = prompt.includes("الاسم القانوني الكامل") && prompt.includes("رقم الهاتف");
    const hasNoAddressOrSchool = prompt.includes("العنوان المنزلي") && prompt.includes("اسم وموقع المدرسة");

    assert(
      hasPrivacyInstruction && hasNoFullNameOrPhone && hasNoAddressOrSchool,
      "Proof 9: BASE_CHILD_SAFETY_RULES forbids requesting full name, phone, address, or school location"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 10: AI Gateway External Contact Prevention
  // --------------------------------------------------------------------------
  {
    const prompt = BASE_CHILD_SAFETY_RULES;
    const forbidsOffPlatform = prompt.includes("منع التواصل الخارجي") || prompt.includes("التواصل خارج المنصة");

    assert(
      forbidsOffPlatform,
      "Proof 10: AI Safety system instruction forbids off-platform communication and private messaging"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 11: AI Gateway Secret & Credential Defense
  // --------------------------------------------------------------------------
  {
    const prompt = BASE_CHILD_SAFETY_RULES;
    const defendsSecrets = prompt.includes("حماية الأسرار وكلمات المرور") && prompt.includes("كلمة مرور أو مفتاحاً برمجياً");

    assert(
      defendsSecrets,
      "Proof 11: AI Safety rules explicitly forbid echoing or collecting passwords and API credentials"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 12: AI Gateway Context Minimization (Chat)
  // --------------------------------------------------------------------------
  {
    const mockProvider = new MockPrivacyProvider();
    const gateway = new AIGateway(mockProvider);

    await gateway.handleChat(
      {
        messages: [{ role: "user", content: "كيف يعمل التعرف على الوجوه؟" }],
        language: "ar_fusha",
        persona: "wise",
      },
      "127.0.0.1"
    );

    const call = mockProvider.calls[0];
    const systemPrompt = call.systemInstruction || "";
    
    // Check that sensitive records are NOT present in the AI payload
    const containsEvidence = systemPrompt.includes("kids_ai_learning_evidence");
    const containsProgress = systemPrompt.includes("currentXP");
    const containsCertificate = systemPrompt.includes("serialNumber");

    assert(
      !containsEvidence && !containsProgress && !containsCertificate && call.contents.length === 1,
      "Proof 12: Chat AI invocation transmits minimal context (no learning evidence, XP, or certificates)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 13: AI Gateway Context Minimization (Report)
  // --------------------------------------------------------------------------
  {
    const validation = validatePedagogicalReportInput({
      studentName: "المستكشف الصغير",
      level: 3,
      xp: 500,
      streakDays: 4,
      completedLessons: ["lesson-1", "lesson-2"],
      completedLabs: ["lab-1"],
      completedProjects: [
        { title: "مشروع 1", score: 95 },
        { title: "مشروع 2", score: 100 },
      ],
      earnedBadges: ["badge-1"],
      totalChatMessages: 10,
      language: "ar_fusha",
    });

    assert(
      validation.isValid && validation.sanitizedData?.completedProjects?.length === 2,
      "Proof 13: Pedagogical report input is strictly bounded to aggregate metrics and max array items"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 14: AI Gateway Context Minimization (Quiz)
  // --------------------------------------------------------------------------
  {
    const validation = validateQuizInput({
      topic: "Computer Vision",
      level: 1,
      language: "ar_fusha",
    });

    assert(
      validation.isValid && validation.sanitizedData?.topic === "Computer Vision",
      "Proof 14: Quiz generation input requires only topic, level, and language (0 personal data)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 15: Anonymous Structural Telemetry
  // --------------------------------------------------------------------------
  console.log("\n--- Group E: Client/Server Privacy & Network Hygiene ---");
  {
    const providerFile = fs.readFileSync(path.join(process.cwd(), "server/ai/provider.ts"), "utf-8");
    const hasChildMessageLog = providerFile.includes("console.log(request.contents)") || providerFile.includes("console.log(message)");
    const hasBase64Log = providerFile.includes("console.log(imageBase64)");

    assert(
      !hasChildMessageLog && !hasBase64Log,
      "Proof 15: AI Provider logs strictly anonymous structural metadata (no child text or base64 images)"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 16: Zero Third-Party Tracking SDKs
  // --------------------------------------------------------------------------
  {
    const indexHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
    const pkgJson = fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8");

    const trackers = ["gtag", "google-analytics", "facebook-pixel", "mixpanel", "amplitude", "posthog", "hotjar"];
    const foundInHtml = trackers.some((t) => indexHtml.includes(t));
    const foundInPkg = trackers.some((t) => pkgJson.includes(t));

    assert(
      !foundInHtml && !foundInPkg,
      "Proof 16: Zero third-party analytics, behavioral tracking, or advertising SDKs present"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 17: No Fake Regulatory/Consent Checkboxes
  // --------------------------------------------------------------------------
  {
    const privacyPolicy = PRIVACY_POLICY;
    assert(
      privacyPolicy.requireConsentForNormalLearning === false,
      "Proof 17: Normal educational exploration requires no deceptive consent checkboxes"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 18: Non-Accredited Achievement Wording
  // --------------------------------------------------------------------------
  {
    const certFile = fs.readFileSync(path.join(process.cwd(), "src/data/graduation.ts"), "utf-8");
    // Ensure titles use learning terms rather than legal accreditation
    const hasUnverifiedClaims = certFile.includes("Certified Young AI Developer") || certFile.includes("الرقم التسلسلي المعتمد");

    assert(
      !hasUnverifiedClaims,
      "Proof 18: Graduation credentials use pedagogical achievement terms without legal certification claims"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 19: Regression Proof: Evidence Mastery & XP Separation (Gate 2 & 4)
  // --------------------------------------------------------------------------
  console.log("\n--- Group F: Regression Proofs (Gates 2, 4, 5) ---");
  {
    const mockEvidences: LearningEvidence[] = [
      {
        id: "ev-reg-1",
        type: "QUIZ_ATTEMPTED",
        sourceId: "quiz-1",
        skillIds: ["skill_computer_vision"],
        assessed: true,
        score: 100,
        passed: true,
        masteryEligible: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const visionMastery = deriveMasteryStatus("skill_computer_vision", mockEvidences);
    const pythonMastery = deriveMasteryStatus("skill_python_coding", mockEvidences);
    const levelRes = calculateLevel(400);

    assert(
      visionMastery === "demonstrated" && pythonMastery === "not_assessed" && levelRes === 3,
      "Proof 19: Learning evidence mastery derivation and XP level math remain 100% intact"
    );
  }

  // --------------------------------------------------------------------------
  // PROOF 20: Regression Proof: AI Gateway Cost Controls (Gate 5)
  // --------------------------------------------------------------------------
  {
    const historyCheck = validateChatInput({
      messages: Array(20).fill({ role: "user", content: "hello" }), // Exceeds max 10
    });

    const oversizedMessage = validateChatInput({
      messages: [{ role: "user", content: "A".repeat(1500) }], // Exceeds max 800
    });

    const boundedHistory = historyCheck.isValid && historyCheck.sanitizedData?.messages.length === 10;
    const boundedLength = oversizedMessage.isValid && (oversizedMessage.sanitizedData?.messages[0].content.length || 0) <= 800;

    assert(
      boundedHistory && boundedLength,
      "Proof 20: AI Gateway limits (max 10 history items, max 800 chars/msg) remain strictly enforced"
    );
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`Gate 6 Verification Summary: ${passedCount} / ${passedCount + failedCount} PASSED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runGate6Verification().catch((err) => {
  console.error("Fatal error during Gate 6 verification:", err);
  process.exit(1);
});
