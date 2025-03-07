
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, PlusCircle, LogOut, Pencil, Trash2 } from 'lucide-react';
import { adminCredentials, addChannel, getChannelsWithFavorites, saveChannels, deleteChannel, updateChannel } from '@/utils/channelData';
import { syncService } from '@/utils/syncService';
import { AdminCredentials, Channel } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<AdminCredentials>({ username: '', password: '' });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('Adicionar Canal');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    streamUrl: '',
    thumbnailUrl: '',
    logoUrl: '',
    category: 'entertainment',
    description: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const loadedChannels = await getChannelsWithFavorites();
        setChannels(loadedChannels);
      } catch (error) {
        console.error('Error loading channels:', error);
        toast({
          title: "Erro ao carregar canais",
          description: "Não foi possível carregar a lista de canais",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChannels();
    
    // Registrar para atualizações de canais
    const unsubscribe = syncService.onChannelsUpdated(async () => {
      // Recarregar canais quando houver mudanças
      await loadChannels();
    });
    
    return () => {
      unsubscribe();
    };
  }, [toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      loginForm.username === adminCredentials.username && 
      loginForm.password === adminCredentials.password
    ) {
      setIsAuthenticated(true);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel de administração",
        duration: 3000,
      });
    } else {
      toast({
        title: "Erro de login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      streamUrl: '',
      thumbnailUrl: '',
      logoUrl: '',
      category: 'entertainment',
      description: ''
    });
    setEditMode(false);
    setSelectedChannelId(null);
    setFormTitle('Adicionar Canal');
  };

  const handleEditChannel = (channel: Channel) => {
    setFormData({
      name: channel.name,
      streamUrl: channel.streamUrl,
      thumbnailUrl: channel.thumbnailUrl || '',
      logoUrl: channel.logoUrl || '',
      category: channel.category,
      description: channel.description
    });
    setSelectedChannelId(channel.id);
    setEditMode(true);
    setFormTitle('Editar Canal');
  };

  const handleDeleteChannel = (channel: Channel) => {
    setChannelToDelete(channel);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    setIsLoading(true);
    try {
      const updatedChannels = await deleteChannel(channelToDelete.id);
      setChannels(updatedChannels);
      
      toast({
        title: "Canal excluído",
        description: `${channelToDelete.name} foi excluído com sucesso`,
        duration: 3000,
      });
      
      // Notificar que os canais mudaram (isso já é feito em deleteChannel via saveChannels)
      // O syncService notificará outras partes do aplicativo
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Erro ao excluir canal",
        description: "Não foi possível excluir o canal",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setChannelToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.streamUrl || !formData.category) {
      toast({
        title: "Erro ao processar canal",
        description: "Nome, URL de transmissão e categoria são obrigatórios",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (editMode && selectedChannelId) {
        // Update existing channel
        const updatedChannels = await updateChannel(selectedChannelId, {
          name: formData.name,
          streamUrl: formData.streamUrl,
          thumbnailUrl: formData.thumbnailUrl,
          logoUrl: formData.logoUrl,
          category: formData.category,
          description: formData.description
        });
        
        setChannels(updatedChannels);
        
        toast({
          title: "Canal atualizado",
          description: `${formData.name} foi atualizado com sucesso`,
          duration: 3000,
        });
      } else {
        // Add new channel
        const newChannel = {
          name: formData.name,
          streamUrl: formData.streamUrl,
          thumbnailUrl: formData.thumbnailUrl,
          logoUrl: formData.logoUrl,
          category: formData.category,
          description: formData.description
        };
        
        const updatedChannels = await addChannel(newChannel);
        setChannels(updatedChannels);
        
        toast({
          title: "Canal adicionado",
          description: `${formData.name} foi adicionado com sucesso`,
          duration: 3000,
        });
        
        // Notificar que os canais mudaram (isso já é feito em addChannel via saveChannels)
        // O syncService notificará outras partes do aplicativo
      }
    } catch (error) {
      console.error('Error processing channel:', error);
      toast({
        title: "Erro ao processar canal",
        description: "Não foi possível adicionar ou atualizar o canal",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      // Reset form
      resetForm();
    }
  };

  // Check if we've reached the channel limit
  const channelLimitReached = channels.length >= 1000 && !editMode;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border py-3">
        <div className="tv-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tv className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">TV Zebra - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voltar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        <div className="tv-container py-8">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Login de Administrador</h2>
                
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Usuário
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Senha
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Add/Edit channel form */}
              <div className="md:col-span-1">
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm sticky top-24">
                  <div className="flex items-center space-x-2 mb-4">
                    {editMode ? (
                      <Pencil size={20} className="text-primary" />
                    ) : (
                      <PlusCircle size={20} className="text-primary" />
                    )}
                    <h2 className="text-lg font-semibold">{formTitle}</h2>
                  </div>
                  
                  {channelLimitReached ? (
                    <div className="p-4 bg-destructive/10 rounded-md text-destructive text-sm">
                      Limite de 1000 canais atingido
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Nome do Canal *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="streamUrl" className="block text-sm font-medium mb-1">
                          URL do Stream *
                        </label>
                        <input
                          id="streamUrl"
                          type="url"
                          value={formData.streamUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="thumbnailUrl" className="block text-sm font-medium mb-1">
                          URL da Miniatura
                        </label>
                        <input
                          id="thumbnailUrl"
                          type="url"
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="logoUrl" className="block text-sm font-medium mb-1">
                          URL do Logo
                        </label>
                        <input
                          id="logoUrl"
                          type="url"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1">
                          Categoria *
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="news">Notícias</option>
                          <option value="entertainment">Entretenimento</option>
                          <option value="sports">Esportes</option>
                          <option value="music">Música</option>
                          <option value="documentary">Documentários</option>
                          <option value="movies">Filmes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
                        >
                          {isLoading ? 'Processando...' : (editMode ? 'Atualizar Canal' : 'Adicionar Canal')}
                        </button>
                        
                        {editMode && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
              
              {/* Channels list */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Canais ({channels.length}/1000)</h2>
                
                {isLoading && channels.length === 0 ? (
                  <div className="bg-card p-6 rounded-lg text-center">
                    Carregando canais...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {channels.map(channel => (
                      <div key={channel.id} className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 mr-4 relative flex-shrink-0 bg-white/30 rounded flex items-center justify-center overflow-hidden">
                              <img 
                                src={channel.logoUrl || channel.thumbnailUrl} 
                                alt={channel.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://placehold.co/120x120/beige/333333?text=${encodeURIComponent(channel.name[0])}`;
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {channel.channelNumber}. {channel.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{channel.description}</p>
                              <div className="mt-1 flex items-center">
                                <span className="inline-block px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                                  {channel.category}
                                </span>
                                {channel.isFavorite && (
                                  <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                                    Favorito
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditChannel(channel)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Editar canal"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteChannel(channel)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Excluir canal"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o canal "{channelToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="py-6 border-t border-border mt-auto">
        <div className="tv-container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TV Zebra - Painel de Administração</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
