
// Um serviço simples para sincronizar dados entre diferentes partes da aplicação

// Usamos um sistema de eventos personalizado para notificar sobre mudanças
type EventCallback = () => void;
type EventMap = {
  'channels-updated': EventCallback[];
};

class SyncService {
  private events: EventMap = {
    'channels-updated': []
  };
  
  // Timestamp da última atualização dos canais
  private lastChannelUpdate: number = Date.now();
  
  constructor() {
    // Inicializa o timestamp com o tempo atual
    this.lastChannelUpdate = Date.now();
  }
  
  // Registra um ouvinte para o evento de atualização de canais
  public onChannelsUpdated(callback: EventCallback): () => void {
    this.events['channels-updated'].push(callback);
    
    // Retorna uma função para remover o listener
    return () => {
      this.events['channels-updated'] = this.events['channels-updated']
        .filter(cb => cb !== callback);
    };
  }
  
  // Notifica que os canais foram atualizados
  public notifyChannelsUpdated(): void {
    this.lastChannelUpdate = Date.now();
    this.events['channels-updated'].forEach(callback => callback());
  }
  
  // Obtém o timestamp da última atualização
  public getLastChannelUpdateTime(): number {
    return this.lastChannelUpdate;
  }
}

// Exporta uma única instância do serviço para toda a aplicação
export const syncService = new SyncService();
