
import { Component, input, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tool } from '../services/tools.service';
import { AiService } from '../services/ai.service';
import { TranslationService } from '../services/translation.service';
import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-tool-runner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-5 flex flex-col h-full max-w-lg mx-auto pb-24 font-sans">
      
      <!-- Icon Header -->
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
           <i [class]="'fa ' + tool().icon"></i>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-800 dark:text-white leading-none">{{ tool().name }}</h2>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
             {{ tool().type === 'ai_content' ? 'Smart AI' : 'Ferramenta' }}
          </span>
        </div>
      </div>

      <!-- Dynamic Content Body -->
      <div class="flex-1 animate-fade-in">
        
        <!-- TYPE: TIMER -->
        @if (tool().type === 'timer') {
          <div class="flex flex-col items-center justify-center py-6">
            <div class="text-7xl font-light text-slate-800 dark:text-white tabular-nums tracking-tighter mb-8">
               {{ formatTime(timerValue()) }}
            </div>

            <div class="flex items-center gap-4">
               <button (click)="resetTimer()" class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center">
                <i class="fa fa-rotate-left"></i>
              </button>

              <button (click)="toggleTimer()" [class]="'w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl shadow-lg transition-all active:scale-95 ' + (timerRunning() ? 'bg-amber-400 text-amber-900' : 'bg-indigo-600 text-white')">
                <i [class]="timerRunning() ? 'fa fa-pause' : 'fa fa-play pl-1'"></i>
              </button>
            </div>
          </div>
        }

        <!-- TYPE: LIST -->
        @if (tool().type === 'list') {
          <div class="space-y-4">
            <div class="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-2">
              <input 
                type="text" 
                [(ngModel)]="newItemText" 
                (keyup.enter)="addListItem()"
                placeholder="Novo item..."
                class="flex-1 p-2 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400 text-sm"
              />
              <button (click)="addListItem()" class="w-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-indigo-700 transition">
                <i class="fa fa-plus text-xs"></i>
              </button>
            </div>
            
            <ul class="space-y-2">
              @for (item of listItems(); track $index) {
                <li class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50">
                  <div class="relative flex items-center justify-center w-5 h-5">
                    <input type="checkbox" [(ngModel)]="item.checked" class="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer">
                    <i class="fa fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                  </div>
                  <span [class.line-through]="item.checked" [class.text-slate-400]="item.checked" class="flex-1 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors">
                    {{ item.text }}
                  </span>
                  <button (click)="removeListItem($index)" class="text-slate-300 hover:text-red-500 transition-colors">
                    <i class="fa fa-times"></i>
                  </button>
                </li>
              }
              @if (listItems().length === 0) {
                <div class="text-center py-12">
                  <p class="text-slate-400 text-xs font-medium">Lista vazia</p>
                </div>
              }
            </ul>
          </div>
        }

        <!-- TYPE: CALC -->
        @if (tool().type === 'calc') {
           <div class="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
             <div class="grid grid-cols-2 gap-4">
               <div>
                 <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Valor A</label>
                 <input type="number" [(ngModel)]="calcA" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xl font-bold text-slate-800 dark:text-white text-center outline-none">
               </div>
               <div>
                 <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Valor B</label>
                 <input type="number" [(ngModel)]="calcB" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xl font-bold text-slate-800 dark:text-white text-center outline-none">
               </div>
             </div>
             
             <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
               <div class="flex justify-between items-center mb-2">
                 <span class="text-slate-400 text-xs">Soma</span>
                 <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ calcA + calcB }}</span>
               </div>
               <div class="flex justify-between items-center">
                 <span class="text-slate-400 text-xs">Multiplicação</span>
                 <span class="text-lg font-bold text-slate-600 dark:text-slate-300">{{ calcA * calcB }}</span>
               </div>
             </div>
           </div>
        }

        <!-- TYPE: TRACKER -->
        @if (tool().type === 'tracker') {
          <div class="flex flex-col items-center justify-center py-4">
            <div class="relative w-56 h-56 mb-8">
               <svg class="w-full h-full transform -rotate-90">
                 <circle cx="112" cy="112" r="90" stroke="currentColor" stroke-width="10" fill="transparent" class="text-slate-100 dark:text-slate-800" />
                 <circle cx="112" cy="112" r="90" stroke="currentColor" stroke-width="10" fill="transparent" 
                   [attr.stroke-dasharray]="circumference" 
                   [attr.stroke-dashoffset]="circumference - (trackerCount() / 20) * circumference" 
                   stroke-linecap="round"
                   class="text-indigo-500 transition-all duration-500 ease-out" />
               </svg>
               <div class="absolute inset-0 flex items-center justify-center flex-col">
                 <span class="text-5xl font-bold text-slate-800 dark:text-white">{{ trackerCount() }}</span>
               </div>
            </div>
            
            <div class="flex gap-6">
               <button (click)="updateTracker(-1)" class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center text-xl">
                 <i class="fa fa-minus"></i>
               </button>
               <button (click)="updateTracker(1)" class="w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center text-xl active:scale-95 transition-transform">
                 <i class="fa fa-plus"></i>
               </button>
            </div>
          </div>
        }

        <!-- TYPE: CAMERA -->
        @if (tool().type === 'camera') {
           <div class="flex flex-col items-center space-y-4">
             @if (!cameraActive() && !capturedImage()) {
               <div (click)="activateCamera()" class="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center flex-col text-slate-400 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                 <i class="fa fa-camera text-4xl mb-3"></i>
                 <p class="font-bold text-sm">Câmera Traseira</p>
               </div>
             } @else if (capturedImage()) {
                <div class="w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden relative shadow-lg">
                  <img [src]="capturedImage()" class="w-full h-full object-cover" />
                  <div class="absolute bottom-4 inset-x-4 flex gap-3">
                     <button (click)="capturedImage.set(null); activateCamera()" class="flex-1 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-bold text-sm">Repetir</button>
                     <button class="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm">Salvar</button>
                  </div>
                </div>
             } @else {
               <div class="w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden relative shadow-lg">
                  <video #videoElement autoplay playsinline class="w-full h-full object-cover"></video>
                  <div class="absolute bottom-6 w-full flex justify-center">
                    <button (click)="takePhoto()" class="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform">
                       <div class="w-12 h-12 bg-white rounded-full"></div>
                    </button>
                  </div>
               </div>
             }
           </div>
        }

        <!-- TYPE: AI CONTENT -->
        @if (tool().type === 'ai_content') {
          <div class="flex flex-col gap-4">
             @if (!aiContent()) {
               <div class="py-8 px-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                 <div class="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fa fa-wand-magic-sparkles text-2xl"></i>
                 </div>
                 <h3 class="text-lg font-bold mb-2 text-slate-800 dark:text-white">Gerar Conteúdo</h3>
                 <p class="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                   A IA irá criar sugestões personalizadas para você agora.
                 </p>
                 <button (click)="generateContent()" [disabled]="isLoadingContent()" class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70 transition-all text-sm">
                    @if (isLoadingContent()) {
                      <i class="fa fa-circle-notch fa-spin"></i>
                    } @else {
                      Gerar Agora
                    }
                 </button>
               </div>
             } @else {
               <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 fade-in">
                  <div class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-slate-700 dark:text-slate-200">
                    {{ aiContent() }}
                  </div>
               </div>
               <button (click)="generateContent()" [disabled]="isLoadingContent()" class="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold active:scale-95 transition-all text-sm">
                  <i class="fa fa-refresh mr-2"></i> Atualizar
               </button>
             }
          </div>
        }

      </div>
    </div>
  `
})
export class ToolRunnerComponent implements OnInit {
  tool = input.required<Tool>();
  
  private aiService = inject(AiService);
  private tService = inject(TranslationService);
  private authService = inject(AuthService);
  private dbService = inject(DbService);

  // Timer State
  timerValue = signal(25 * 60);
  timerRunning = signal(false);
  intervalId: any;

  // List State
  newItemText = '';
  listItems = signal<{text: string, checked: boolean}[]>([]);

  // Calc State
  calcA = 0;
  calcB = 0;

  // Tracker State
  trackerCount = signal(0);
  circumference = 2 * Math.PI * 90; // Compact radius

  // Camera State
  cameraActive = signal(false);
  capturedImage = signal<string | null>(null);

  // AI Content State
  aiContent = signal<string>('');
  isLoadingContent = signal(false);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      if (this.tool().type === 'tracker') {
        const savedCount = this.dbService.getUserData(user.id, `tool_${this.tool().id}_tracker`, 0);
        this.trackerCount.set(savedCount);
      }
      if (this.tool().type === 'list') {
        const savedList = this.dbService.getUserData(user.id, `tool_${this.tool().id}_list`, []);
        this.listItems.set(savedList);
      }
    }
  }

  // Timer Logic
  toggleTimer() {
    if (this.timerRunning()) {
      clearInterval(this.intervalId);
      this.timerRunning.set(false);
    } else {
      this.timerRunning.set(true);
      this.intervalId = setInterval(() => {
        this.timerValue.update(v => v > 0 ? v - 1 : 0);
        if (this.timerValue() === 0) this.toggleTimer();
      }, 1000);
    }
  }

  resetTimer() {
    this.timerRunning.set(false);
    clearInterval(this.intervalId);
    this.timerValue.set(25 * 60);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // List Logic
  addListItem() {
    if (this.newItemText.trim()) {
      this.listItems.update(l => [...l, { text: this.newItemText, checked: false }]);
      this.newItemText = '';
      this.persistList();
    }
  }

  removeListItem(index: number) {
    this.listItems.update(l => l.filter((_, i) => i !== index));
    this.persistList();
  }

  persistList() {
    const user = this.authService.currentUser();
    if (user) {
      this.dbService.saveUserData(user.id, `tool_${this.tool().id}_list`, this.listItems());
    }
  }

  // Tracker Logic
  updateTracker(delta: number) {
    const newVal = Math.max(0, this.trackerCount() + delta);
    this.trackerCount.set(newVal);
    const user = this.authService.currentUser();
    if (user) {
      this.dbService.saveUserData(user.id, `tool_${this.tool().id}_tracker`, newVal);
    }
  }

  // Camera Logic
  activateCamera() {
    this.cameraActive.set(true);
    setTimeout(() => {
        const video = document.querySelector('video');
        if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
             navigator.mediaDevices.getUserMedia({ 
               video: { facingMode: 'environment' } 
             })
             .then(stream => { video.srcObject = stream; })
             .catch(e => {
               console.error("Camera error", e);
               navigator.mediaDevices.getUserMedia({ video: true })
                 .then(stream => video.srcObject = stream);
             });
        }
    }, 100);
  }

  takePhoto() {
    const video = document.querySelector('video');
    if (video) {
       // Flash effect
       const flash = document.createElement('div');
       flash.className = 'fixed inset-0 bg-white z-[100] transition-opacity duration-200';
       document.body.appendChild(flash);
       setTimeout(() => { flash.style.opacity = '0'; }, 50);
       setTimeout(() => { document.body.removeChild(flash); }, 250);

       const canvas = document.createElement('canvas');
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
       canvas.getContext('2d')?.drawImage(video, 0, 0);
       this.capturedImage.set(canvas.toDataURL('image/png'));
       
       const stream = video.srcObject as MediaStream;
       stream?.getTracks().forEach(track => track.stop());
       this.cameraActive.set(false);
    }
  }

  // AI Content Logic
  async generateContent() {
    this.isLoadingContent.set(true);
    this.aiContent.set('');
    const lang = this.tService.currentLang();
    const content = await this.aiService.getToolContent(this.tool().name, lang);
    this.aiContent.set(content);
    this.isLoadingContent.set(false);
  }
}
