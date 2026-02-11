import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyPlan, StrategyPath } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an elite productivity and career strategist for a high-potential Geomatics student.
The user is ambitious, running a business ('MyNexRyde'), studying Geomatics, and learning Trading, Cybersecurity, and Programming.
Your goal is to maximize their "Level Up" speed by finding synergies (e.g., Spatial Finance, Geo-Cybersecurity) and creating realistic, high-performance schedules.
Use the Pareto Principle (80/20 rule) to suggest high-leverage activities that combine multiple skills.
`;

export const generateDailySchedule = async (profile: UserProfile, date: Date): Promise<DailyPlan> => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  const prompt = `
    Generate a strict, optimized daily schedule for ${dayName} covering the entire day from **Waking Up** to **Sleep**.
    
    CRITICAL - FIXED SCHOOL TIMETABLE:
    The user has the following fixed commitments (School/Classes). You MUST schedule around these. Do NOT schedule other tasks during these times. Mark these blocks as category 'fixed'.
    "${profile.schoolSchedule}"

    User Constraints:
    - **Identity**: Geomatics Student leveling up fast.
    - **Business**: Must work on '${profile.businessName}' EVERY DAY.
    - **Hobbies**: Trading, Cybersecurity, Programming must be practiced EVERY DAY.
    - **Health**: Gym is mandatory.
    - **Sports**: Volleyball is MANDATORY on Saturday and Sunday.
    
    A-STUDENT STUDY METHODS (Apply these in descriptions):
    - Use **Active Recall** (Testing self instead of re-reading).
    - Use **Spaced Repetition** (Reviewing older concepts).
    - Use **Pomodoro** (25m focus / 5m break) for coding/trading sessions.
    - Use **Feynman Technique** (Teach it to understand it).
    - **Skill Stacking**: Combine GIS with Trading or Cyber in the same block.
    
    Rules:
    1. **Start with "Wake Up"** and morning routine.
    2. Deep work blocks for Geomatics/Programming in the morning when fresh (unless Class is in session).
    3. Trading study/practice during market hours or evening analysis.
    4. Business operations (MyNexRyde) block required daily.
    5. Gym time required (if not playing Volleyball, or light session if playing).
    6. **End with "Sleep"** routine.
    7. Combine topics where possible (e.g., "Program a GIS trading bot") to level up faster.
    
    Return the response in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            dayOfWeek: { type: Type.STRING },
            focusOfTheDay: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['learning', 'business', 'health', 'hobby', 'rest', 'fixed'] },
                  description: { type: Type.STRING }
                },
                required: ['time', 'activity', 'category', 'description']
              }
            }
          },
          required: ['schedule', 'focusOfTheDay', 'dayOfWeek']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as DailyPlan;

  } catch (error) {
    console.error("Error generating schedule:", error);
    // Fallback or re-throw
    throw error;
  }
};

export const generateStrategy = async (profile: UserProfile): Promise<StrategyPath[]> => {
  const prompt = `
    Analyze this profile:
    - Major: ${profile.major}
    - Interests: ${profile.hobbies.join(', ')}
    - Business: ${profile.businessName}
    
    Provide 3 distinct "Strategic Paths" to level up fast. 
    Focus on intersections (Synergies). How can Geomatics apply to Trading? How does Cyber apply to GIS?
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              synergies: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'synergies', 'actionItems']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as StrategyPath[];

  } catch (error) {
    console.error("Error generating strategy:", error);
    return [];
  }
};

export const getLiveClient = () => {
    return ai.live;
}