
import { Injectable, signal } from '@angular/core';

export type Language = 'pt' | 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('pt');

  translations: Record<string, Record<Language, string>> = {
    'welcome': {
      pt: 'Olá! Como posso ajudar?',
      en: 'Hello! How can I help?',
      es: '¡Hola! ¿Cómo puedo ayudar?'
    },
    'welcome_subtitle': {
      pt: 'Sua vida organizada em um só lugar.',
      en: 'Your life organized in one place.',
      es: 'Tu vida organizada en un solo lugar.'
    },
    'search_placeholder': {
      pt: 'Busque animes, jogos, ferramentas...',
      en: 'Search anime, games, tools...',
      es: 'Busca animes, juegos, herramientas...'
    },
    'cat_organization': { pt: 'Organização', en: 'Organization', es: 'Organización' },
    'cat_entertainment': { pt: 'Animes & Jogos', en: 'Anime & Games', es: 'Anime y Juegos' },
    'cat_health': { pt: 'Saúde', en: 'Health', es: 'Salud' },
    'cat_finance': { pt: 'Finanças', en: 'Finance', es: 'Finanzas' },
    'cat_work': { pt: 'Trabalho', en: 'Work', es: 'Trabajo' },
    'cat_leisure': { pt: 'Lazer', en: 'Leisure', es: 'Ocio' },
    'cat_security': { pt: 'Segurança', en: 'Security', es: 'Seguridad' },
    'cat_utils': { pt: 'Utilidades', en: 'Utilities', es: 'Utilidades' },
    'home': { pt: 'Início', en: 'Home', es: 'Inicio' },
    'tools': { pt: 'Explorar', en: 'Explore', es: 'Explorar' },
    'assistant': { pt: 'IA Chat', en: 'AI Chat', es: 'IA Chat' },
    'profile': { pt: 'Perfil', en: 'Profile', es: 'Perfil' },
    'favorites': { pt: 'Favoritos', en: 'Favorites', es: 'Favoritos' },
    'categories': { pt: 'Categorias', en: 'Categories', es: 'Categorías' },
    'recents': { pt: 'Recentes', en: 'Recents', es: 'Recientes' },
    'emergency': { pt: 'SOS', en: 'SOS', es: 'SOS' },
    'dark_mode': { pt: 'Tema Escuro', en: 'Dark Mode', es: 'Tema Oscuro' },
    'language': { pt: 'Idioma', en: 'Language', es: 'Idioma' },
    'notifications': { pt: 'Notificações', en: 'Notifications', es: 'Notificaciones' },
    'about': { pt: 'Sobre', en: 'About', es: 'Sobre' },
    'close': { pt: 'Fechar', en: 'Close', es: 'Cerrar' },
    'save': { pt: 'Salvar', en: 'Save', es: 'Guardar' },
    'typing': { pt: 'Digitando...', en: 'Typing...', es: 'Escribiendo...' },
    'suggestion_btn': { pt: 'Sugestão Mágica', en: 'Magic Suggestion', es: 'Sugerencia Mágica' },
    'no_results': { pt: 'Nada encontrado.', en: 'No results found.', es: 'No se encontraron resultados.' },
    'premium_member': { pt: 'Membro Premium', en: 'Premium Member', es: 'Miembro Premium' },
    'generate_btn': { pt: 'Gerar Conteúdo', en: 'Generate Content', es: 'Generar Contenido' },
    'regenerate_btn': { pt: 'Atualizar Lista', en: 'Refresh List', es: 'Actualizar Lista' },
  };

  t(key: string): string {
    const k = key.toLowerCase();
    if (this.translations[k]) {
      return this.translations[k][this.currentLang()] || key;
    }
    return key;
  }

  setLang(lang: Language) {
    this.currentLang.set(lang);
  }
}
