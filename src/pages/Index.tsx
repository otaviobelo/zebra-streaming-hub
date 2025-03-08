
import React, { useState, useEffect, useCallback } from 'react';
import { Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelGrid from '@/components/ChannelGrid';
import SearchBar from '@/components/SearchBar';
import Navigation from '@/components/Navigation';
import { 
  getChannelsWithFavorites, 
  searchChannels, 
  filterChannelsByCategory, 
  toggleFavoriteChannel 
} from '@/utils/channelData';
import { syncService } from '@/utils/syncService';
import { Channel } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(0);
  const { toast } = useToast();

  // Função para carregar canais com base na categoria ativa
  const loadChannelsByCategory = useCallback(async () => {
    setIsLoading(true);
    try {
      let filteredChannels;
      if (searchQuery) {
        filteredChannels = await searchChannels(searchQuery);
      } else {
        filteredChannels = await filterChannelsByCategory(activeCategory);
      }
      setChannels(filteredChannels);
      
      // Se não tivermos um canal ativo ou o canal ativo não existir mais, selecione o primeiro
      if (filteredChannels.length > 0 && 
          (!activeChannel || !filteredChannels.some(ch => ch.id === activeChannel.id))) {
        setActiveChannel(filteredChannels[0]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      toast({
        title: "Erro ao carregar canais",
        description: "Não foi possível atualizar a lista de canais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery, activeChannel, toast]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const initialChannels = await getChannelsWithFavorites();
        setChannels(initialChannels);
        
        if (initialChannels.length > 0) {
          setActiveChannel(initialChannels[0]);
        }
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
    
    fetchInitialData();
  }, [toast]);

  // Efeito para atualizar canais quando houver mudanças
  useEffect(() => {
    // Registrar listener para atualizações de canais
    const unsubscribe = syncService.onChannelsUpdated(() => {
      console.log('Channels updated notification received');
      // Atualizar o timestamp para forçar uma atualização
      setLastUpdate(syncService.getLastChannelUpdateTime());
      
      // Mostrar notificação de atualização
      toast({
        title: "Canais atualizados",
        description: "A lista de canais foi atualizada com as últimas alterações",
        duration: 3000,
      });
      
      // Carregar canais atualizados
      loadChannelsByCategory();
    });
    
    // Configurar intervalo de polling para verificar atualizações a cada 5 segundos
    const pollingInterval = setInterval(() => {
      // Verificar se há atualizações comparando o timestamp atual com o último conhecido
      const currentUpdateTime = syncService.getLastChannelUpdateTime();
      if (currentUpdateTime > lastUpdate) {
        console.log('Update detected via polling:', currentUpdateTime, 'vs', lastUpdate);
        setLastUpdate(currentUpdateTime);
        loadChannelsByCategory();
      }
    }, 5000);
    
    // Limpar recursos ao desmontar
    return () => {
      unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [lastUpdate, loadChannelsByCategory, toast]);

  // Efeito para recarregar quando a categoria ou busca mudar
  useEffect(() => {
    loadChannelsByCategory();
  }, [activeCategory, searchQuery, loadChannelsByCategory]);

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    
    toast({
      title: "Canal alterado",
      description: `Assistindo agora: ${channel.name} (${channel.channelNumber})`,
      duration: 2000,
    });
  };

  const handleSelectCategory = async (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleToggleFavorite = async (channelId: string) => {
    try {
      await toggleFavoriteChannel(channelId);
      
      setChannels(prev => 
        prev.map(ch => 
          ch.id === channelId 
            ? { ...ch, isFavorite: !ch.isFavorite } 
            : ch
        )
      );
      
      if (activeChannel && activeChannel.id === channelId) {
        setActiveChannel(prev => 
          prev ? { ...prev, isFavorite: !prev.isFavorite } : null
        );
      }
      
      const channel = channels.find(ch => ch.id === channelId);
      if (channel) {
        const isFavorite = !channel.isFavorite;
        toast({
          title: isFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos",
          description: `${channel.name} foi ${isFavorite ? 'adicionado aos' : 'removido dos'} favoritos`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePrevChannel = () => {
    if (!activeChannel || channels.length <= 1) return;
    
    const currentIndex = channels.findIndex(ch => ch.id === activeChannel.id);
    const prevIndex = currentIndex <= 0 ? channels.length - 1 : currentIndex - 1;
    handleSelectChannel(channels[prevIndex]);
  };

  const handleNextChannel = () => {
    if (!activeChannel || channels.length <= 1) return;
    
    const currentIndex = channels.findIndex(ch => ch.id === activeChannel.id);
    const nextIndex = currentIndex >= channels.length - 1 ? 0 : currentIndex + 1;
    handleSelectChannel(channels[nextIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header fixo */}
      <header className="sticky-header py-3">
        <div className="tv-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tv className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">TV Zebra</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-full max-w-xs">
                <SearchBar onSearch={handleSearch} />
              </div>
              <Link 
                to="/admin" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu de navegação */}
      <Navigation
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        isFixed={true}
      />

      {/* Player de vídeo */}
      <div className="sticky-player">
        <div className="player-wrapper">
          {activeChannel ? (
            <VideoPlayer 
              channel={activeChannel} 
              onPrevChannel={handlePrevChannel}
              onNextChannel={handleNextChannel}
            />
          ) : (
            <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">
                {isLoading ? 'Carregando...' : 'Nenhum canal selecionado'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de canais */}
      <div className="flex-grow">
        <div className="tv-container">
          <div className="channel-list-container">
            {isLoading ? (
              <div className="w-full py-16 text-center">
                <p className="text-muted-foreground">Carregando canais...</p>
              </div>
            ) : (
              <ChannelGrid
                channels={channels}
                activeCategory={activeCategory}
                onSelectChannel={handleSelectChannel}
                onToggleFavorite={handleToggleFavorite}
                displayAsList={true}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 border-t border-border mt-auto">
        <div className="tv-container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TV Zebra. Todos os direitos reservados.</p>
            <div className="mt-2">
              <Link 
                to="/admin" 
                className="text-primary hover:underline transition-colors"
              >
                Acessar Painel Administrativo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
