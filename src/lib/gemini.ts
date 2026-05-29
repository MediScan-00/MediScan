import { GoogleGenAI, Type } from "@google/genai";
import { LANGUAGES } from "./i18n";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the "Smart Pharmacist Assistant" for the MediScan app. Your task is to analyze images of FULL prescriptions or entered drug names, extract ALL medications, provide explanations adapted to different user types, and rigorously detect serious risks and interactions between the identified drugs.

Strict Rules:
- Image Analysis: Extract ALL drug names, concentrations (e.g., 500mg), and the written dosages from images. If dosage seems too high, flag it.
- Language/Tone: Adapt to the three requested modes (Very Quick, Simplified, Professional).
- Risk & Interaction Detection: You MUST evaluate interactions between all medications found in the prescription. State them clearly in globalInteractions.
- Accuracy & Sourcing: Provide a "confidenceScore" (0-100) reflecting how sure you are about the drug identification and analysis. Also provide "referenceLinks" to actual, real drug databases (e.g., Drugs.com, WebMD, MedlinePlus) for the patient to verify.
- Emergency Detection: If you detect a severe risk of OVERDOSE, a SEVERE ALLERGIC REACTION (based on provided patient context), or critically severe symptoms, you MUST trigger "emergencyDetails.isEmergency" = true, providing the reason, immediate action, and standard emergency numbers (e.g., 911/112).
- Cost Savings: For each medication, check if a widely available cheaper generic alternative exists. Provide the alternative name, estimated savings percentage, and confirm if it has the exact same active ingredient.
- Medical Error Detection: Actively scan for logical medical errors (e.g., two conflicting medications, illogical/fatal dosages, an adult's dosage given to a child, duplicate therapies). If detected, set "medicalErrorDetection.isError" to true, describe the error, and include the exact text "Warning: Check with your pharmacist before use." in the action.
- Counterfeit Analysis (Image only): If an image of a medication package is provided, analyze its packaging, shape, font, barcode, print quality, and country of origin. If you suspect it might be counterfeit, set "counterfeitAnalysis.isSuspectedCounterfeit" to true and explain the reasoning.

Response Structure Requirements (MUST RETURN JSON with these exact fields):
1. emergencyDetails: Object with isEmergency (boolean), reason (string), immediateAction (string), localEmergencyNumber (string).
2. medicalErrorDetection: Object with isError (boolean), description (string), requiredAction (string - must contain "Warning: Check with your pharmacist before use.").
3. counterfeitAnalysis: Object with isSuspectedCounterfeit (boolean), reasoning (string).
4. drugs: Array of objects, each containing:
   - drugName: Trade and Generic Names.
   - confidenceScore: Number (0-100).
   - referenceLinks: Array of { title: string, url: string }.
   - activeIngredient: String (the drug's core active ingredient).
   - cheaperAlternative: Object with exists (boolean), name (string), savingsEstimate (string), sameActiveIngredient (boolean), explanation (string).
   - veryQuickMode: A single, very simple sentence explaining what it is and what it does.
   - simplifiedMode: Object with whyUseIt, doctorPrescriptionReason (start with "This was likely prescribed to you because..."), whenStartsWorking, commonSideEffects, whatToAvoid, howToTake, timing (Before/After meals), frequency (How often), missedDose (What if I forget).
   - professionalMode: Object with activeIngredient, interactions, mechanismOfAction, and warnings.
   - dangerousDosageRisk: boolean (true if dosage is unusually high or dangerous)
   - unsuitableForChildren: boolean (true if definitely unsafe for kids)
   - pregnancyRisk: boolean (true if contraindicated in pregnancy)
   - causesDrowsiness: boolean (true if it causes sleepiness)
   - requiresFood: boolean (true if MUST be taken with food to avoid gastric issues)
   - foodDrinkAvoidance: array of strings (e.g., ["Alcohol", "Grapefruit", "Coffee"])
   - chronicConditionRisks: array of strings (e.g., ["High Blood Pressure", "Liver Disease"])
   - predictedQuestions: Array of objects with question (string) and answer (string). Generate 3-5 very common, highly relevant questions that a user might ask about this specific medication (e.g., "Does it cause weight gain?", "Does it affect erections?", "Is it safe to take with coffee?"), along with an intelligent, conversational, and biological answer to each.
4. globalInteractions: Explanation of any dangerous interactions between the listed drugs. e.g. "Do not take medication A with B." Leave empty if none.
5. globalWarnings: Array of strings for general warnings about the whole prescription.
6. disclaimer: Must be exactly "This analysis is for educational purposes only. Please consult your doctor or pharmacist before making any medical decisions."
`;

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface CheaperAlternative {
  exists: boolean;
  name: string;
  savingsEstimate: string;
  sameActiveIngredient: boolean;
  explanation: string;
}

export interface AnalyzedDrug {
  drugName: string;
  confidenceScore: number;
  referenceLinks: ReferenceLink[];
  activeIngredient?: string;
  cheaperAlternative?: CheaperAlternative;
  veryQuickMode: string;
  simplifiedMode: {
    whyUseIt: string;
    doctorPrescriptionReason: string;
    whenStartsWorking: string;
    commonSideEffects: string;
    whatToAvoid: string;
    howToTake: string;
    timing: string;
    frequency: string;
    missedDose: string;
  };
  professionalMode: {
    activeIngredient: string;
    interactions: string;
    mechanismOfAction: string;
    warnings: string;
  };
  dangerousDosageRisk: boolean;
  unsuitableForChildren: boolean;
  pregnancyRisk: boolean;
  causesDrowsiness: boolean;
  requiresFood: boolean;
  foodDrinkAvoidance: string[];
  chronicConditionRisks: string[];
  predictedQuestions?: { question: string, answer: string }[];
}

export interface EmergencyDetails {
  isEmergency: boolean;
  reason: string;
  immediateAction: string;
  localEmergencyNumber: string;
}

export interface MedicalErrorDetection {
  isError: boolean;
  description: string;
  requiredAction: string;
}

export interface CounterfeitAnalysis {
  isSuspectedCounterfeit: boolean;
  reasoning: string;
}

export interface DrugAnalysisResult {
  drugs: AnalyzedDrug[];
  globalInteractions: string;
  globalWarnings: string[];
  disclaimer: string;
  emergencyDetails: EmergencyDetails;
  medicalErrorDetection?: MedicalErrorDetection;
  counterfeitAnalysis?: CounterfeitAnalysis;
  // Backward compatibility fields below:
  drugName?: string;
  veryQuickMode?: string;
}

export interface TranscriptionResult {
  extractedItems: {
    predictedName: string;
    possibleAlternatives: string[];
    confidence: 'high' | 'medium' | 'low';
  }[];
}

export async function transcribePrescription(base64Image: string, mimeType: string): Promise<TranscriptionResult> {
  try {

  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('dt_language') || 'en') : 'en';
  const langName = typeof window !== 'undefined' ? (LANGUAGES[currentLang]?.name || 'English') : 'English';

  const parts = [
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    },
    {
      text: "You are a professional pharmacist deciphering terrible doctor's handwriting. Extract the list of medications from this prescription. For each medication, provide the most likely name. If the handwriting is ambiguous, provide 2-3 logical alternative medication names that look similar or are commonly prescribed in similar contexts. Indicate your reading confidence (high, medium, low)."
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [...parts, { text: `\n\nRespond in ${langName} language only.` }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                predictedName: { type: Type.STRING },
                possibleAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
              },
              required: ["predictedName", "possibleAlternatives", "confidence"]
            }
          }
        },
        required: ["extractedItems"]
      }
    },
  });

  const jsonStr = response.text;
  if (!jsonStr) {
    throw new Error("No response received from the assistant.");
  }

  return JSON.parse(jsonStr) as TranscriptionResult;

  } catch (error) {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('dt_user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          feature: 'drug_analysis',
          plan: user?.plan || 'unknown'
        },
        extra: {
          analysisType: 'transcribe'
        }
      });
    }
    throw error;
  }}

export interface MedicationComparisonResult {
  drugAName: string;
  drugBName: string;
  generalDifference: string;
  drowsinessComparison: string;
  costComparison: string;
  sideEffectsComparison: string;
  disclaimer: string;
}

export async function compareMedications(drugA: string, drugB: string): Promise<MedicationComparisonResult> {
  try {

  const currentLang = localStorage.getItem('dt_language') || 'en';
  const langName = typeof window !== 'undefined' ? (LANGUAGES[currentLang]?.name || 'English') : 'English';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare the medications "${drugA}" and "${drugB}". Provide information only, without making medical recommendations. Address general differences, which typically causes less drowsiness, general cost comparisons (which is cheaper), and a comparison of common side effects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          drugAName: { type: Type.STRING },
          drugBName: { type: Type.STRING },
          generalDifference: { type: Type.STRING, description: "General difference between the two medications." },
          drowsinessComparison: { type: Type.STRING, description: "Which causes less drowsiness?" },
          costComparison: { type: Type.STRING, description: "Which is generally cheaper or more cost-effective?" },
          sideEffectsComparison: { type: Type.STRING, description: "Comparison of common side effects." },
          disclaimer: { type: Type.STRING, description: "Must include a disclaimer that this is for informational purposes only and not a recommendation." }
        },
        required: ["drugAName", "drugBName", "generalDifference", "drowsinessComparison", "costComparison", "sideEffectsComparison", "disclaimer"]
      }
    },
  });

  const jsonStr = response.text;
  if (!jsonStr) {
    throw new Error("No response received from the assistant.");
  }

  return JSON.parse(jsonStr) as MedicationComparisonResult;

  } catch (error) {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('dt_user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          feature: 'drug_analysis',
          plan: user?.plan || 'unknown'
        },
        extra: {
          analysisType: 'compare'
        }
      });
    }
    throw error;
  }}

export interface PatientProfile {
  medications: string;
  conditions: string;
  allergies: string;
}

export async function analyzePrescription(
  textPrompt: string,
  base64Image?: string,
  mimeType?: string,
  patientProfile?: PatientProfile
): Promise<DrugAnalysisResult> {
  try {

  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('dt_language') || 'en') : 'en';
  const langName = typeof window !== 'undefined' ? (LANGUAGES[currentLang]?.name || 'English') : 'English';

  try {
    const parts: any[] = [];
    
    let instructions = "";
    if (patientProfile && (patientProfile.medications.trim() !== '' || patientProfile.conditions.trim() !== '' || patientProfile.allergies.trim() !== '')) {
      instructions += `CRITICAL PATIENT CONTEXT:\n`;
      if (patientProfile.medications.trim() !== '') instructions += `- Current Medications: ${patientProfile.medications}\n`;
      if (patientProfile.conditions.trim() !== '') instructions += `- Medical Conditions: ${patientProfile.conditions}\n`;
      if (patientProfile.allergies.trim() !== '') instructions += `- Allergies: ${patientProfile.allergies}\n`;
      instructions += `\nYou MUST evaluate interactions and risks of the newly prescribed/entered drugs against this patient's CURRENT medications, conditions, and allergies. Alert the user in globalInteractions and globalWarnings if any newly entered drug is dangerous given this context!\n\n`;
    }
    
    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
    }
    
    if (textPrompt || instructions) {
      parts.push({ text: instructions + (textPrompt || "Please analyze this prescription.") });
    }

    if (parts.length === 0) {
      throw new Error("Please provide either an image or a drug name.");
    }


    const promptParts = [...parts, { text: `\n\nRespond in ${langName} language only.` }];
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: promptParts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emergencyDetails: {
              type: Type.OBJECT,
              properties: {
                isEmergency: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                immediateAction: { type: Type.STRING },
                localEmergencyNumber: { type: Type.STRING }
              },
              required: ["isEmergency", "reason", "immediateAction", "localEmergencyNumber"]
            },
            medicalErrorDetection: {
              type: Type.OBJECT,
              properties: {
                isError: { type: Type.BOOLEAN },
                description: { type: Type.STRING },
                requiredAction: { type: Type.STRING }
              },
              required: ["isError", "description", "requiredAction"]
            },
            counterfeitAnalysis: {
              type: Type.OBJECT,
              properties: {
                isSuspectedCounterfeit: { type: Type.BOOLEAN },
                reasoning: { type: Type.STRING }
              },
              required: ["isSuspectedCounterfeit", "reasoning"]
            },
            drugs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  drugName: { type: Type.STRING, description: "Trade and Generic Names" },
                  activeIngredient: { type: Type.STRING },
                  cheaperAlternative: {
                    type: Type.OBJECT,
                    properties: {
                      exists: { type: Type.BOOLEAN },
                      name: { type: Type.STRING },
                      savingsEstimate: { type: Type.STRING, description: "e.g., '40% cheaper'" },
                      sameActiveIngredient: { type: Type.BOOLEAN },
                      explanation: { type: Type.STRING }
                    },
                    required: ["exists", "name", "savingsEstimate", "sameActiveIngredient", "explanation"]
                  },
                  confidenceScore: { type: Type.INTEGER, description: "Confirmation rate (0-100)" },
                  referenceLinks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ["title", "url"]
                    }
                  },
                  veryQuickMode: { type: Type.STRING, description: "Single simple sentence explanation" },
                  simplifiedMode: {
                    type: Type.OBJECT,
                    properties: {
                      whyUseIt: { type: Type.STRING },
                      doctorPrescriptionReason: { type: Type.STRING, description: "Explain why it was prescribed, starting with 'This was likely prescribed to you because...'" },
                      whenStartsWorking: { type: Type.STRING },
                      commonSideEffects: { type: Type.STRING },
                      whatToAvoid: { type: Type.STRING },
                      howToTake: { type: Type.STRING },
                      timing: { type: Type.STRING, description: "When should I take it? Before or after meals?" },
                      frequency: { type: Type.STRING, description: "How often should I take it?" },
                      missedDose: { type: Type.STRING, description: "What to do if I forget a dose?" }
                    },
                    required: ["whyUseIt", "doctorPrescriptionReason", "whenStartsWorking", "commonSideEffects", "whatToAvoid", "howToTake", "timing", "frequency", "missedDose"]
                  },
                  professionalMode: {
                    type: Type.OBJECT,
                    properties: {
                      activeIngredient: { type: Type.STRING },
                      interactions: { type: Type.STRING },
                      mechanismOfAction: { type: Type.STRING },
                      warnings: { type: Type.STRING }
                    },
                    required: ["activeIngredient", "interactions", "mechanismOfAction", "warnings"]
                  },
                  dangerousDosageRisk: { type: Type.BOOLEAN },
                  unsuitableForChildren: { type: Type.BOOLEAN },
                  pregnancyRisk: { type: Type.BOOLEAN },
                  causesDrowsiness: { type: Type.BOOLEAN },
                  requiresFood: { type: Type.BOOLEAN },
                  foodDrinkAvoidance: { type: Type.ARRAY, items: { type: Type.STRING } },
                  chronicConditionRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  predictedQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING, description: "A highly relevant predicted question about this drug" },
                        answer: { type: Type.STRING, description: "A biological, informative, yet conversational answer" }
                      },
                      required: ["question", "answer"]
                    }
                  }
                },
                required: ["drugName", "confidenceScore", "referenceLinks", "cheaperAlternative", "veryQuickMode", "simplifiedMode", "professionalMode", "dangerousDosageRisk", "unsuitableForChildren", "pregnancyRisk", "causesDrowsiness", "requiresFood", "foodDrinkAvoidance", "chronicConditionRisks", "predictedQuestions"]
              }
            },
            globalInteractions: { type: Type.STRING, description: "Explanation of dangerous interactions" },
            globalWarnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "General warnings" },
            disclaimer: { type: Type.STRING }
          },
          required: ["emergencyDetails", "medicalErrorDetection", "counterfeitAnalysis", "drugs", "globalInteractions", "globalWarnings", "disclaimer"]
        }
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("No response received from the assistant.");
    }

    return JSON.parse(jsonStr) as DrugAnalysisResult;
  } catch (error) {
    console.error("Error analyzing prescription:", error);
    throw error;
  }

  } catch (error) {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('dt_user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          feature: 'drug_analysis',
          plan: user?.plan || 'unknown'
        },
        extra: {
          analysisType: 'scan|text'
        }
      });
    }
    throw error;
  }}

export interface EmergencyMistakeData {
  age: string;
  weight: string;
  medicationName: string;
  timeTaken: string;
  description: string;
}

export interface EmergencyAssessmentResult {
  isDangerous: boolean;
  requiresEmergencyAssistance: boolean;
  whatToDoNow: string;
  explanation: string;
  localEmergencyNumber: string;
}

export async function assessEmergencyMistake(data: EmergencyMistakeData): Promise<EmergencyAssessmentResult> {
  try {

  const currentLang = localStorage.getItem('dt_language') || 'en';
  const langName = typeof window !== 'undefined' ? (LANGUAGES[currentLang]?.name || 'English') : 'English';

  try {
    const prompt = `A user has reported a medication mistake or overdose.
Age: ${data.age}
Weight: ${data.weight}
Medication & Dose Information: ${data.medicationName}
When it was taken: ${data.timeTaken}
Additional details: ${data.description}

Analyze this situation immediately. 
Is this dangerous? Does it require emergency medical assistance? What should the user do NOW?

You MUST return the output as a valid JSON object matching the requested schema.

Respond in ${langName} language only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isDangerous: { type: Type.BOOLEAN, description: "True if the situation is potentially dangerous" },
            requiresEmergencyAssistance: { type: Type.BOOLEAN, description: "True if they should call an ambulance or go to ER immediately" },
            whatToDoNow: { type: Type.STRING, description: "Actionable, clear steps on what to do right now" },
            explanation: { type: Type.STRING, description: "Brief explanation of the risk" },
            localEmergencyNumber: { type: Type.STRING, description: "Standard emergency number (e.g., 911/112)" }
          },
          required: ["isDangerous", "requiresEmergencyAssistance", "whatToDoNow", "explanation", "localEmergencyNumber"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("No response received from the assistant.");
    }

    return JSON.parse(jsonStr) as EmergencyAssessmentResult;
  } catch (error) {
    console.error("Error assessing emergency:", error);
    throw error;
  }

  } catch (error) {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('dt_user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          feature: 'drug_analysis',
          plan: user?.plan || 'unknown'
        },
        extra: {
          analysisType: 'emergency'
        }
      });
    }
    throw error;
  }}

export interface SymptomExplanationResult {
  biologicalReason: string;
  isNormalSideEffect: boolean;
  requiresMedicalAttention: boolean;
  actionableAdvice: string;
}

export async function explainSymptom(medicationName: string, symptom: string): Promise<SymptomExplanationResult> {
  try {

  try {
    const prompt = `A user is taking the medication "${medicationName}" and is experiencing the following symptom/feeling: "${symptom}".
    
Explain the biological or chemical reason WHY they are experiencing this symptom after taking this medication. Be educational, clear, and reassuring if it's a normal side effect. Also, indicate if this symptom is a normal expected side effect, if it requires medical attention, and provide actionable advice.
    
You MUST return the output as a valid JSON object matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            biologicalReason: { type: Type.STRING, description: "A biological explanation of why this symptom occurs with this medication" },
            isNormalSideEffect: { type: Type.BOOLEAN, description: "True if this is a known, normal side effect." },
            requiresMedicalAttention: { type: Type.BOOLEAN, description: "True if this symptom is severe enough to require seeing a doctor." },
            actionableAdvice: { type: Type.STRING, description: "What the user should do about this symptom right now." }
          },
          required: ["biologicalReason", "isNormalSideEffect", "requiresMedicalAttention", "actionableAdvice"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("No response received from the assistant.");
    }

    return JSON.parse(jsonStr) as SymptomExplanationResult;
  } catch (error) {
    console.error("Error explaining symptom:", error);
    throw error;
  }

  } catch (error) {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('dt_user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          feature: 'drug_analysis',
          plan: user?.plan || 'unknown'
        },
        extra: {
          analysisType: 'interaction'
        }
      });
    }
    throw error;
  }}
