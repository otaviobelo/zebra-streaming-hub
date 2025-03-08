
// Um serviço para sincronização de dados entre diferentes partes da aplicação e dispositivos

// Usamos um sistema de eventos personalizado para notificar sobre mudanças
type EventCallback = () => void;
type EventMap = {
  'channels-updated': EventCallback[];
};

class SyncService {
  private events: EventMap = {
    'channels-updated': []
  };
  
  // Timestamp da última atualização dos canais - armazenado no localStorage
  private lastChannelUpdate: number = Date.now();
  private readonly STORAGE_KEY = 'tvzebra-sync-timestamp';
  
  constructor() {
    // Inicializa a partir do localStorage ou com o tempo atual
    const storedTimestamp = localStorage.getItem(this.STORAGE_KEY);
    this.lastChannelUpdate = storedTimestamp ? parseInt(storedTimestamp, 10) : Date.now();
    
    // Configurar verificação periódica de atualizações no localStorage (para sincronização entre abas)
    setInterval(() => this.checkLocalStorageUpdates(), 1000); // Reduzindo o intervalo para 1 segundo
    
    // Adicionar listener para eventos de storage (para sincronização entre abas)
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        const newTimestamp = event.newValue ? parseInt(event.newValue, 10) : 0;
        if (newTimestamp > this.lastChannelUpdate) {
          console.log(`Update detected via storage event: ${newTimestamp} vs ${this.lastChannelUpdate}`);
          this.lastChannelUpdate = newTimestamp;
          this.notifyListeners();
        }
      }
    });
  }
  
  // Verifica se houve atualizações em outras abas/janelas
  private checkLocalStorageUpdates(): void {
    const storedTimestamp = localStorage.getItem(this.STORAGE_KEY);
    if (storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10);
      if (timestamp > this.lastChannelUpdate) {
        console.log(`Update detected via polling: ${timestamp} vs ${this.lastChannelUpdate}`);
        this.lastChannelUpdate = timestamp;
        this.notifyListeners();
      }
    }
  }
  
  // Notifica todos os listeners
  private notifyListeners(): void {
    console.log('Notifying listeners about channel updates');
    this.events['channels-updated'].forEach(callback => callback());
  }
  
  // Registra um ouvinte para o evento de atualização de canais
  public onChannelsUpdated(callback: EventCallback): () => void {
    this.events['channels-updated'].push(callback);
    console.log(`Added channel update listener. Current count: ${this.events['channels-updated'].length}`);
    
    // Retorna uma função para remover o listener
    return () => {
      this.events['channels-updated'] = this.events['channels-updated']
        .filter(cb => cb !== callback);
      console.log(`Removed channel update listener. Current count: ${this.events['channels-updated'].length}`);
    };
  }
  
  // Notifica que os canais foram atualizados
  public notifyChannelsUpdated(): void {
    // Gera um novo timestamp
    this.lastChannelUpdate = Date.now();
    console.log(`Notifying channel update with timestamp: ${this.lastChannelUpdate}`);
    
    // Atualiza o localStorage para sincronizar entre abas/janelas
    localStorage.setItem(this.STORAGE_KEY, this.lastChannelUpdate.toString());
    
    // Notifica os listeners na aba atual
    this.notifyListeners();
  }
  
  // Obtém o timestamp da última atualização
  public getLastChannelUpdateTime(): number {
    return this.lastChannelUpdate;
  }
  
  // Obtém o timestamp atual para uso em URLs (cache busting)
  public getVersionParam(): string {
    return `v=${this.lastChannelUpdate}`;
  }
  
  // Força uma verificação de atualizações
  public checkForUpdates(): void {
    this.checkLocalStorageUpdates();
  }
}

// Exporta uma única instância do serviço para toda a aplicação
export const syncService = new SyncService();
