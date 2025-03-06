
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, PlusCircle, LogOut } from 'lucide-react';
import { adminCredentials, addChannel, getChannelsWithFavorites } from '@/utils/channelData';
import { AdminCredentials, Channel } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<AdminCredentials>({ username: '', password: '' });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannel, setNewChannel] = useState({
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
    setChannels(getChannelsWithFavorites());
  }, []);

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

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newChannel.name || !newChannel.streamUrl || !newChannel.category) {
      toast({
        title: "Erro ao adicionar canal",
        description: "Nome, URL de transmissão e categoria são obrigatórios",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Add channel
    const updatedChannels = addChannel(newChannel);
    setChannels(updatedChannels);
    
    // Reset form
    setNewChannel({
      name: '',
      streamUrl: '',
      thumbnailUrl: '',
      logoUrl: '',
      category: 'entertainment',
      description: ''
    });
    
    toast({
      title: "Canal adicionado",
      description: `${newChannel.name} foi adicionado com sucesso`,
      duration: 3000,
    });
  };

  // Check if we've reached the channel limit
  const channelLimitReached = channels.length >= 1000;

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
              {/* Add new channel form */}
              <div className="md:col-span-1">
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm sticky top-24">
                  <div className="flex items-center space-x-2 mb-4">
                    <PlusCircle size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Adicionar Canal</h2>
                  </div>
                  
                  {channelLimitReached ? (
                    <div className="p-4 bg-destructive/10 rounded-md text-destructive text-sm">
                      Limite de 1000 canais atingido
                    </div>
                  ) : (
                    <form onSubmit={handleAddChannel} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Nome do Canal *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={newChannel.name}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
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
                          value={newChannel.streamUrl}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, streamUrl: e.target.value }))}
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
                          value={newChannel.thumbnailUrl}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
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
                          value={newChannel.logoUrl}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, logoUrl: e.target.value }))}
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
                          value={newChannel.category}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, category: e.target.value }))}
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
                          value={newChannel.description}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Adicionar Canal
                      </button>
                    </form>
                  )}
                </div>
              </div>
              
              {/* Channels list */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Canais ({channels.length}/1000)</h2>
                
                <div className="space-y-4">
                  {channels.map(channel => (
                    <div key={channel.id} className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
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
                          <h3 className="font-medium">{channel.name}</h3>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
