
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async getChatResponse(newMessage: string, history: {role: 'user' | 'ai', text: string}[]): Promise<string> {
    try {
      const model = 'gemini-2.5-flash';
      
      // Format history for context to give the AI "Memory"
      // We take the last 10 messages to keep the token count reasonable but context high
      const context = history.slice(-10).map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.text}`).join('\n');

      const prompt = `
        System: You are "Aura", a highly intelligent, friendly, and concise personal assistant.
        Language: Portuguese (Brazil).
        
        Previous Conversation Context:
        ${context}
        
        New User Message: "${newMessage}"
        
        Instructions:
        - Answer directly and helpfully.
        - Maintain the context of previous messages (if the user says "and then?", refer to the previous story).
        - Use emojis sparingly to be friendly but professional.
        - Keep responses concise (under 400 chars) unless asked for a long explanation.
        - If asked for code, provide it briefly.
      `;
      
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt
      });

      return response.text || 'Desculpe, não entendi.';
    } catch (error) {
      console.error('AI Error', error);
      return 'Desculpe, estou com dificuldade de conexão no momento.';
    }
  }

  async getToolContent(toolName: string, lang: string): Promise<string> {
    try {
      const prompt = `
        Task: Generate content for app feature "${toolName}".
        Language: ${lang}.
        Role: Expert Assistant.
        
        Requirements:
        - If it's a list (Games, Anime, Movies), provide 5 TOP items. 
        - Format: 
           Title (Rating)
           One sentence description.
        - If it's a guide/tip: Provide 3-5 clear bullet points.
        - Tone: Professional but engaging.
        - NO Markdown symbols (like ** or #). Just plain text with emojis.
        - Keep it visually clean.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text || 'Tente novamente.';
    } catch (e) {
      return 'Erro na conexão.';
    }
  }
}
