import { GoogleGenAI } from "@google/genai";
import { UserProfile, DailyPlan, StrategyPath } from "../types";
import { FALLBACK_DAILY_PLAN, FALLBACK_STRATEGIES } from "../constants";

// Using gemini-2.5-flash as it is currently stable and fast for JSON generation
const MODEL_NAME = 'gemini-2.5-flash'; 

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an elite productivity and career strategist for a high-potential Geomatics student.
The user is ambitious, running a business ('MyNexRyde'), studying Geomatics, and learning Trading, Cybersecurity, and Programming.
Your goal is to maximize their "Level Up" speed by finding synergies.
`;

// Robust JSON cleaner that handles Markdown and potential garbage
const cleanAndParseJson = <T>(text: string, fallback: T): T => {
  if (!text) return fallback;
  
  try {
      let clean = text.trim();
      // Remove markdown code blocks if present
      clean = clean.replace(/```json/g, '').replace(/```/g, '');
      
      // Find the first outer brace or bracket
      const firstBrace = clean.indexOf('{');
      const firstBracket = clean.indexOf('[');
      
      if (firstBrace === -1 && firstBracket === -1) {
          console.warn("No JSON structure found in response");
          return fallback;
      }
      
      const isObject = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket);
      const start = isObject ? firstBrace : firstBracket;
      const end = isObject ? clean.lastIndexOf('}') : clean.lastIndexOf(']');
      
      if (start !== -1 && end !== -1 && end >= start) {
        clean = clean.substring(start, end + 1);
        return JSON.parse(clean);
      }
      
      return JSON.parse(clean);
  } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Raw Text:", text);
      return fallback;
  }
};

export const generateDailySchedule = async (profile: UserProfile, date: Date): Promise<DailyPlan> => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  const prompt = `
    Create a strict JSON daily schedule for ${dayName}.
    
    **CONSTRAINTS & REQUIREMENTS:**
    1. **WAKE UP TIME**: 04:00 AM. (The schedule MUST start here).
    2. **FIXED SCHOOL SCHEDULE**: 
       The user has the following school classes. You MUST schedule these exactly as written and mark category as 'fixed'. Do not schedule other tasks during these times.
       """
       ${profile.schoolSchedule}
       """
    3. **PRIORITIES**: 
       - '${profile.businessName}' (Business) - Daily.
       - Geomatics/GIS (Major) - Daily.
       - Trading, Cyber, Programming (Hobbies) - Daily.
       - Gym/Volleyball - Daily/Weekly.

    Structure the response EXACTLY like this JSON example:
    {
      "date": "2024-01-01",
      "dayOfWeek": "Monday",
      "focusOfTheDay": "Theme of the day",
      "tips": ["Tip 1", "Tip 2"],
      "schedule": [
        { "time": "04:00", "activity": "Wake Up", "category": "health", "description": "Early rise" }
      ]
    }
    Allowed categories: learning, business, health, hobby, rest, fixed.
    IMPORTANT: Return ONLY valid JSON. No Markdown. No introduction.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // We do NOT use responseSchema here to allow the model more flexibility 
        // which often prevents "blocked" responses on the free tier/preview models.
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return cleanAndParseJson(text, FALLBACK_DAILY_PLAN);

  } catch (error) {
    console.error("AI Schedule Error (Using Fallback):", error);
    // Return a modified fallback with the correct date
    return {
        ...FALLBACK_DAILY_PLAN,
        date: date.toISOString(),
        dayOfWeek: dayName
    };
  }
};

export const generateStrategy = async (profile: UserProfile): Promise<StrategyPath[]> => {
  const prompt = `
    Create 3 strategic paths for a Geomatics student interested in Trading, Cyber, and Business (${profile.businessName}).
    Focus on synergies (e.g. GIS + Trading).
    
    Structure the response EXACTLY as a JSON Array like this:
    [
      {
        "title": "Strategy Name",
        "description": "Explanation",
        "synergies": ["Skill A + Skill B"],
        "actionItems": ["Do this", "Do that"]
      }
    ]
    IMPORTANT: Return ONLY valid JSON Array. No Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return cleanAndParseJson(text, FALLBACK_STRATEGIES);

  } catch (error) {
    console.error("AI Strategy Error (Using Fallback):", error);
    return FALLBACK_STRATEGIES;
  }
};

export const getLiveClient = () => {
    return ai.live;
}
