
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language } from './services/translation.service';
import { AiService } from './services/ai.service';
import { ToolsService, Tool } from './services/tools.service';
import { AuthService, User } from './services/auth.service';
import { DbService } from './services/db.service';
import { ToolRunnerComponent } from './components/tool-runner.component';

type View = 'login' | 'home' | 'explore' | 'favorites' | 'category' | 'tool' | 'chat' | 'profile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ToolRunnerComponent],
  templateUrl: './app.component.html',
  styleUrls: [] 
})
export class AppComponent {
  // Services
  tService = inject(TranslationService);
  aiService = inject(AiService);
  toolsService = inject(ToolsService);
  authService = inject(AuthService);
  dbService = inject(DbService);

  // App State
  currentView = signal<View>('login'); 
  darkMode = signal<boolean>(false);
  
  // Explore Tab State
  activeCategory = signal<string>('all'); // 'all' or category ID
  searchQuery = signal<string>('');
  
  // Tool State
  activeTool = signal<Tool | null>(null);
  
  // Login State
  isRegistering = signal(false);
  loginData = { name: '', email: '', password: '' };
  loginError = signal('');
  isProcessingAuth = signal(false);
  isGoogleLoading = signal(false);

  // Chat State
  chatMessages = signal<{role: 'user' | 'ai', text: string}[]>([]);
  chatInput = '';
  isChatLoading = signal(false);

  // Favorites
  favorites = signal<Tool[]>([]);

  // Computed
  currentUser = this.authService.currentUser;
  
  // Filtered tools for Explore Tab
  currentTools = computed(() => {
    let tools = this.toolsService.tools();
    
    // Filter by Category
    if (this.currentView() === 'category') {
       // Deep link view from Home
       tools = this.toolsService.getToolsByCategory(this.activeCategory());
    } else if (this.currentView() === 'explore') {
       // Tab view with pills
       if (this.activeCategory() !== 'all') {
         tools = this.toolsService.getToolsByCategory(this.activeCategory());
       }
    }

    // Filter by Search
    if (this.searchQuery().trim().length > 0) {
      const q = this.searchQuery().toLowerCase();
      tools = tools.filter(t => t.name.toLowerCase().includes(q));
    }
    
    return tools;
  });
  
  categoryTitle = computed(() => {
      const cat = this.activeCategory();
      if (cat === 'all') return 'Explorar';
      return this.tService.t(cat);
  });

  categories = [
    { id: 'cat_organization', icon: 'fa-calendar-check', color: 'bg-indigo-500' },
    { id: 'cat_entertainment', icon: 'fa-gamepad', color: 'bg-violet-500' },
    { id: 'cat_health', icon: 'fa-heart-pulse', color: 'bg-rose-500' },
    { id: 'cat_finance', icon: 'fa-wallet', color: 'bg-emerald-500' },
    { id: 'cat_work', icon: 'fa-briefcase', color: 'bg-slate-600' },
    { id: 'cat_leisure', icon: 'fa-film', color: 'bg-pink-500' },
    { id: 'cat_security', icon: 'fa-shield-halved', color: 'bg-orange-500' },
    { id: 'cat_utils', icon: 'fa-screwdriver-wrench', color: 'bg-cyan-500' }
  ];

  constructor() {
    if (this.authService.currentUser()) {
      this.currentView.set('home');
      this.loadUserData();
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkMode.set(true);
      document.documentElement.classList.add('dark');
    }

    // Load Chat History if exists
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
         const history = this.dbService.getUserData(user.id, 'chat_history', []);
         if (history && history.length > 0) {
           this.chatMessages.set(history);
         } else {
           this.chatMessages.set([{role: 'ai', text: this.tService.t('welcome')}]);
         }
      }
    });
  }

  toggleTheme() {
    this.darkMode.update(d => !d);
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  changeLang(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.tService.setLang(target.value as Language);
  }

  navigate(view: View, param?: string | Tool) {
    if (view === 'explore') {
      this.searchQuery.set('');
      this.activeCategory.set('all'); // Reset filter on nav
    }
    
    if (view === 'category' && typeof param === 'string') {
      this.activeCategory.set(param);
    } else if (view === 'tool' && param && typeof param === 'object') {
      this.activeTool.set(param as Tool);
    }
    this.currentView.set(view);
    window.scrollTo(0,0);
  }

  filterExplore(catId: string) {
    this.activeCategory.set(catId);
  }

  openTool(tool: Tool) {
    this.navigate('tool', tool);
  }
  
  toggleAuthMode() {
    this.isRegistering.update(v => !v);
    this.loginError.set('');
    this.loginData = { name: '', email: '', password: '' };
  }

  async loginWithGoogle() {
    this.isGoogleLoading.set(true);
    const success = await this.authService.loginWithGoogle();
    this.isGoogleLoading.set(false);
    if (success) {
      this.loadUserData();
      this.navigate('home');
    }
  }

  async submitAuth() {
    if (!this.loginData.email || !this.loginData.password) {
      this.loginError.set('Preencha todos os campos');
      return;
    }

    if (this.isRegistering() && !this.loginData.name) {
       this.loginError.set('Nome é obrigatório');
       return;
    }

    this.isProcessingAuth.set(true);
    this.loginError.set('');

    let success = false;
    if (this.isRegistering()) {
      success = await this.authService.register(this.loginData.name, this.loginData.email, this.loginData.password);
      if (!success) this.loginError.set('E-mail já cadastrado.');
    } else {
      success = await this.authService.login(this.loginData.email, this.loginData.password);
      if (!success) this.loginError.set('E-mail ou senha inválidos.');
    }

    this.isProcessingAuth.set(false);

    if (success) {
      this.loadUserData();
      this.navigate('home');
    }
  }

  performLogout() {
    this.authService.logout();
    this.currentView.set('login');
    this.favorites.set([]);
    this.chatMessages.set([{role: 'ai', text: this.tService.t('welcome')}]);
    this.loginData = { name: '', email: '', password: '' };
  }

  loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      const favIds = this.dbService.getUserData<string[]>(user.id, 'favorites', []);
      const allTools = this.toolsService.tools();
      const loadedFavs = allTools.filter(t => favIds.includes(t.id));
      
      if (loadedFavs.length === 0 && allTools.length > 0) {
        // Defaults
        const defaults = allTools.slice(0, 4);
        this.favorites.set(defaults);
        this.saveFavorites(defaults);
      } else {
        this.favorites.set(loadedFavs);
      }
    }
  }

  saveFavorites(tools: Tool[]) {
    const user = this.authService.currentUser();
    if (user) {
      const ids = tools.map(t => t.id);
      this.dbService.saveUserData(user.id, 'favorites', ids);
    }
  }

  toggleFavorite(tool: Tool) {
    this.favorites.update(f => {
      const exists = f.find(i => i.id === tool.id);
      let newFavs;
      if (exists) {
        newFavs = f.filter(i => i.id !== tool.id);
      } else {
        newFavs = [...f, tool];
      }
      this.saveFavorites(newFavs);
      return newFavs;
    });
  }
  
  isFavorite(tool: Tool) {
    return this.favorites().some(f => f.id === tool.id);
  }

  async sendChatMessage() {
    if (!this.chatInput.trim()) return;
    
    const userMsg = this.chatInput;
    const history = this.chatMessages();
    
    // Add User Message
    const updatedHistory = [...history, {role: 'user', text: userMsg} as const];
    this.chatMessages.set(updatedHistory);
    
    this.chatInput = '';
    this.isChatLoading.set(true);

    // Save partial history (optimistic)
    this.persistChat(updatedHistory);

    // Get AI Response with full context
    const response = await this.aiService.getChatResponse(userMsg, updatedHistory);
    
    const finalHistory = [...updatedHistory, {role: 'ai', text: response} as const];
    this.chatMessages.set(finalHistory);
    this.isChatLoading.set(false);
    
    // Save full history
    this.persistChat(finalHistory);
  }

  persistChat(messages: {role: 'user' | 'ai', text: string}[]) {
    const user = this.authService.currentUser();
    if (user) {
      // Keep only last 50 messages to save space
      const toSave = messages.slice(-50);
      this.dbService.saveUserData(user.id, 'chat_history', toSave);
    }
  }
  
  onSearch() {
    // Search is handled by computed signal
  }
}
