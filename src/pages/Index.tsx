
import React, { useState, useEffect } from 'react';
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
import { Channel } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize with channels
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

  // Handle channel selection
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    
    toast({
      title: "Canal alterado",
      description: `Assistindo agora: ${channel.name} (${channel.channelNumber})`,
      duration: 2000,
    });
  };

  // Handle category selection
  const handleSelectCategory = async (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsLoading(true);
    
    try {
      if (searchQuery) {
        setSearchQuery('');
        const filteredChannels = await filterChannelsByCategory(categoryId);
        setChannels(filteredChannels);
      } else {
        const filteredChannels = await filterChannelsByCategory(categoryId);
        setChannels(filteredChannels);
      }
    } catch (error) {
      console.error('Error filtering channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    try {
      if (query.trim() === '') {
        const filteredChannels = await filterChannelsByCategory(activeCategory);
        setChannels(filteredChannels);
      } else {
        const searchResults = await searchChannels(query);
        setChannels(searchResults);
      }
    } catch (error) {
      console.error('Error searching channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (channelId: string) => {
    try {
      await toggleFavoriteChannel(channelId);
      
      // Update channels with new favorite status
      setChannels(prev => 
        prev.map(ch => 
          ch.id === channelId 
            ? { ...ch, isFavorite: !ch.isFavorite } 
            : ch
        )
      );
      
      // Update active channel if it's the same
      if (activeChannel && activeChannel.id === channelId) {
        setActiveChannel(prev => 
          prev ? { ...prev, isFavorite: !prev.isFavorite } : null
        );
      }
      
      // Show toast
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

  // Handle navigation between channels
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
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border py-3">
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

      <div className="flex flex-col">
        {/* Fixed navigation above the player */}
        <div className="fixed-nav-area w-full">
          <Navigation
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            isFixed={true}
          />
        </div>

        {/* Space to push content below fixed navigation */}
        <div className="nav-spacer"></div>

        {/* Fixed video player area */}
        <div className="fixed-player-area w-full bg-black">
          <div className="tv-container py-3">
            <div className="max-w-4xl mx-auto">
              {activeChannel ? (
                <div className="w-full">
                  <VideoPlayer 
                    channel={activeChannel} 
                    onPrevChannel={handlePrevChannel}
                    onNextChannel={handleNextChannel}
                  />
                  <div className="channel-description">
                    <h2 className="font-semibold text-lg">
                      {activeChannel.channelNumber}. {activeChannel.name}
                    </h2>
                    <p className="text-sm text-white/80">{activeChannel.description}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando...' : 'Nenhum canal selecionado'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Space to push content below fixed player */}
        <div className="player-spacer"></div>

        {/* Scrollable channel grid section */}
        <div className="channel-list-container">
          <div className="tv-container">
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

      {/* Footer */}
      <footer className="py-6 border-t border-border mt-auto">
        <div className="tv-container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TV Zebra. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
