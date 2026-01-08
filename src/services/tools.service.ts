
import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { TranslationService, Language } from './translation.service';

export interface Tool {
  id: string;
  name: string;
  icon: string;
  category: string;
  type: 'timer' | 'list' | 'calc' | 'ai_content' | 'tracker' | 'camera';
  description?: string;
  config?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private tService = inject(TranslationService);
  
  // The master list of tools
  private allTools = signal<Tool[]>([]);
  
  // Expose as read-only
  tools = computed(() => this.allTools());

  constructor() {
    effect(() => {
      const lang = this.tService.currentLang();
      this.generateTools(lang);
    });
  }

  private generateTools(lang: Language) {
    const categories = [
      { id: 'cat_organization', icon: 'fa-calendar-check', base: ['Agenda', 'Lista de Tarefas', 'Planejador Semanal', 'Cronômetro', 'Pomodoro', 'Lembrete'] },
      { id: 'cat_entertainment', icon: 'fa-gamepad', base: [] }, 
      { id: 'cat_health', icon: 'fa-heart-pulse', base: ['Rastreamento de Água', 'Meditação', 'Treino em Casa', 'Diário de Sintomas', 'IMC Calculadora', 'Monitor de Sono'] },
      { id: 'cat_finance', icon: 'fa-wallet', base: ['Controle de Gastos', 'Conversor de Moeda', 'Calculadora de Juros', 'Lista de Compras', 'Comparador de Preço'] },
      { id: 'cat_work', icon: 'fa-briefcase', base: ['Resumo de Texto', 'Tradutor', 'Pomodoro Trabalho', 'Organizador de Prazos', 'Leitor de PDF'] },
      { id: 'cat_leisure', icon: 'fa-film', base: ['Sugestão de Filmes', 'Receitas Rápidas', 'Planejador de Festa'] },
      { id: 'cat_security', icon: 'fa-shield-halved', base: ['SOS Emergência', 'Localização Rápida', 'Lanterna Tática', 'Gravação Segura'] },
      { id: 'cat_utils', icon: 'fa-screwdriver-wrench', base: ['Conversor Unidades', 'Scanner QR', 'Lupa', 'Bússola', 'Velocímetro', 'Senha Segura'] }
    ];

    // Specific Gaming & Anime Tools (AI Powered)
    const entertainmentTools = [
      { name: 'Sugestão de Animes', icon: 'fa-tv', type: 'ai_content' },
      { name: 'Animes da Temporada', icon: 'fa-calendar', type: 'ai_content' },
      { name: 'Jogos Mobile (Android/iOS)', icon: 'fa-mobile-screen', type: 'ai_content' },
      { name: 'Jogos PC (Steam/Epic)', icon: 'fa-computer', type: 'ai_content' },
      { name: 'Xbox Game Pass (Destaques)', icon: 'fa-xbox', type: 'ai_content' },
      { name: 'Xbox Jogos Grátis', icon: 'fa-xbox', type: 'ai_content' },
      { name: 'PlayStation Plus', icon: 'fa-playstation', type: 'ai_content' },
      { name: 'PlayStation Grátis', icon: 'fa-playstation', type: 'ai_content' },
      { name: 'Jogos Grátis (Geral)', icon: 'fa-gift', type: 'ai_content' },
      { name: 'MMORPGs Populares', icon: 'fa-users', type: 'ai_content' },
      { name: 'Jogos de Estratégia', icon: 'fa-chess-rook', type: 'ai_content' },
      { name: 'Dicas de FPS Competitivo', icon: 'fa-crosshairs', type: 'ai_content' }
    ];

    const generated: Tool[] = [];
    let idCounter = 1;

    // Add Entertainment Tools First
    entertainmentTools.forEach(t => {
       generated.push({
         id: `tool_ent_${idCounter++}`,
         name: t.name,
         category: 'cat_entertainment',
         icon: t.icon,
         type: 'ai_content', 
         description: 'Recomendação Inteligente'
       });
    });

    categories.forEach(cat => {
      cat.base.forEach(baseName => {
        const baseType = this.guessType(baseName);
        
        // Add the main tool
        generated.push({
          id: `tool_${idCounter++}`,
          name: baseName,
          category: cat.id,
          icon: cat.icon,
          type: baseType,
          description: lang === 'pt' ? `Ferramenta de ${baseName}` : `${baseName} tool`
        });
        
        // Generate Variations that INHERIT the parent type correctly
        // Only generate variations for functional tools to avoid AI spam
        if (cat.id !== 'cat_entertainment' && baseType !== 'ai_content') {
            const subContexts = ['Rápido', 'Avançado', 'Personalizado'];
            subContexts.forEach(sub => {
               generated.push({
                 id: `tool_${idCounter++}`,
                 name: `${baseName} (${sub})`,
                 category: cat.id,
                 icon: cat.icon,
                 type: baseType, // CRITICAL: Inherit type!
                 description: `Modo ${sub}`
               })
            });
        }
      });
    });

    this.allTools.set(generated);
  }

  private guessType(name: string): 'timer' | 'list' | 'calc' | 'ai_content' | 'tracker' | 'camera' {
    const n = name.toLowerCase();
    
    // Timer Logic
    if (n.includes('cronômetro') || n.includes('pomodoro') || n.includes('meditação') || n.includes('treino') || n.includes('respiração')) return 'timer';
    
    // List Logic
    if (n.includes('lista') || n.includes('tarefa') || n.includes('compras') || n.includes('planejador') || n.includes('agenda') || n.includes('prazos')) return 'list';
    
    // Calc Logic
    if (n.includes('calculadora') || n.includes('conversor') || n.includes('imc') || n.includes('juros') || n.includes('financeira')) return 'calc';
    
    // Camera Logic
    if (n.includes('scanner') || n.includes('lupa') || n.includes('foto') || n.includes('lanterna') || n.includes('gravação')) return 'camera';
    
    // Tracker Logic
    if (n.includes('controle') || n.includes('rastreamento') || n.includes('diário') || n.includes('monitor') || n.includes('água') || n.includes('sono')) return 'tracker';
    
    // Default to AI for "Suggestions", "Guides", "Ideas", etc.
    return 'ai_content';
  }

  getToolsByCategory(catId: string): Tool[] {
    return this.allTools().filter(t => t.category === catId);
  }

  searchTools(query: string): Tool[] {
    const q = query.toLowerCase();
    return this.allTools().filter(t => t.name.toLowerCase().includes(q));
  }
}
