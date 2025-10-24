import { GoogleGenAI, Type } from "@google/genai";
import type { Task } from '../types';

// A function to get the client, this will be called only when needed.
// This prevents a crash on app load if the API key is missing.
const getAiClient = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    // This will be caught by the calling function's try/catch block.
    throw new Error("API_KEY environment variable not set.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export async function generateSubtasks(taskTitle: string, taskDescription: string): Promise<string[]> {
  const prompt = `
    As an expert project manager at a top-tier chartered accountancy firm, your task is to break down a high-level accounting task into a series of clear, actionable sub-tasks.
    
    The primary task is:
    Title: "${taskTitle}"
    Description: "${taskDescription}"
    
    Based on this information, generate a list of 3 to 7 concise, logical sub-tasks that an associate accountant should perform to complete the primary task.
    Each sub-task should be a clear action item.
    Do not include any preamble or explanation in your response. Only provide the JSON array of sub-task strings.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              description: "A list of actionable sub-task strings for the accounting task.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["subtasks"],
        }
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.subtasks)) {
      return parsed.subtasks;
    } else {
      console.error("Unexpected JSON structure:", parsed);
      throw new Error("Failed to parse sub-tasks from Gemini response.");
    }

  } catch (error) {
    console.error("Error generating subtasks:", error);
    throw new Error("Could not generate sub-tasks. Please check your API key and network connection.");
  }
}


export async function generateTaskTitle(taskDescription: string): Promise<string> {
    const prompt = `
    Based on the following detailed task description for an accounting task, generate a concise and professional task title (under 10 words).
    
    Description: "${taskDescription}"
    
    The title should be clear and immediately understandable to a chartered accountant.
    Do not include any preamble, explanation, or quotation marks in your response. Only provide the JSON object with the title string.
  `;
  
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise, professional title for the task.",
            }
          },
          required: ["title"],
        }
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response for title generation.");
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed && typeof parsed.title === 'string') {
      return parsed.title.replace(/"/g, ''); // Clean up any stray quotes
    } else {
      console.error("Unexpected JSON structure for title:", parsed);
      throw new Error("Failed to parse title from Gemini response.");
    }

  } catch (error) {
    console.error("Error generating task title:", error);
    throw new Error("Could not generate task title. Please check your API key and network connection.");
  }
}

export async function findTasksByQuery(query: string, tasks: Task[]): Promise<string[]> {
  const currentDate = new Date().toISOString().split('T')[0];
  // Sanitize tasks to only include relevant fields for the prompt, reducing token count
  const taskDataForPrompt = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      startDate: t.startDate,
      dueDate: t.dueDate,
      assignee: t.assignee.name,
      engagementType: t.engagementType,
      projectId: t.projectId, // Can be used to find client later
  }));
  
  const prompt = `
    You are an advanced data analysis assistant for a task management application.
    A user has provided a natural language query to find specific tasks.
    Your job is to analyze the following JSON array of tasks and return the IDs of the tasks that match the user's query.

    User Query: "${query}"

    Today's Date is: "${currentDate}". Use this for any relative date calculations (e.g., "next week", "overdue").

    Tasks Data:
    ${JSON.stringify(taskDataForPrompt)}

    Analyze the user's query and the provided task data. Consider all fields: dates, assignees, status, priority, title, description, and engagement type.

    Return ONLY a JSON object with a single key "taskIds" which is an array of strings. Each string must be the ID of a matching task.
    Example response for a successful match: { "taskIds": ["task-1", "task-5"] }
    If no tasks match the query, you must return an empty array: { "taskIds": [] }
  `;

  try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      taskIds: {
                          type: Type.ARRAY,
                          description: "An array of task IDs that match the user's query.",
                          items: {
                              type: Type.STRING
                          }
                      }
                  },
                  required: ["taskIds"]
              }
          }
      });
      
      const jsonText = response.text.trim();
      if (!jsonText) {
          throw new Error("AI returned an empty response for search.");
      }

      const parsed = JSON.parse(jsonText);

      if (parsed && Array.isArray(parsed.taskIds)) {
          return parsed.taskIds;
      } else {
          console.error("Unexpected JSON structure for search results:", parsed);
          throw new Error("Failed to parse task IDs from Gemini response.");
      }

  } catch (error) {
      console.error("Error finding tasks by query:", error);
      throw new Error("Could not perform AI search. Please check your API key and network connection.");
  }
}

export async function formatSQLQuery(sql: string): Promise<string> {
  const prompt = `
    As an expert SQL developer, your task is to format the following SQL query.
    Apply standard SQL formatting best practices:
    - Use consistent capitalization for keywords (e.g., uppercase SELECT, FROM, WHERE).
    - Use indentation for readability.
    - Place each clause (SELECT, FROM, WHERE, GROUP BY, etc.) on a new line.
    - Ensure the query is syntactically correct and logically unchanged.

    SQL to format:
    \`\`\`sql
    ${sql}
    \`\`\`

    Return ONLY the formatted SQL query as a raw string. Do not include backticks, the word "sql", or any explanation.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    let formattedSql = response.text.trim();
    
    // Clean up potential markdown code block formatting
    if (formattedSql.startsWith('```sql')) {
        formattedSql = formattedSql.substring(6);
    }
    if (formattedSql.startsWith('```')) {
        formattedSql = formattedSql.substring(3);
    }
    if (formattedSql.endsWith('```')) {
        formattedSql = formattedSql.slice(0, -3);
    }
    
    return formattedSql.trim();

  } catch (error) {
    console.error("Error formatting SQL:", error);
    throw new Error("Could not format SQL query. Please check your API key and network connection.");
  }
}
