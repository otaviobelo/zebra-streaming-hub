
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
  const { toast } = useToast();

  // Initialize with channels
  useEffect(() => {
    const initialChannels = getChannelsWithFavorites();
    setChannels(initialChannels);
    
    if (initialChannels.length > 0) {
      setActiveChannel(initialChannels[0]);
    }
  }, []);

  // Handle channel selection
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    
    toast({
      title: "Canal alterado",
      description: `Assistindo agora: ${channel.name}`,
      duration: 2000,
    });
  };

  // Handle category selection
  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (searchQuery) {
      setSearchQuery('');
      setChannels(filterChannelsByCategory(categoryId));
    } else {
      setChannels(filterChannelsByCategory(categoryId));
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setChannels(filterChannelsByCategory(activeCategory));
    } else {
      setChannels(searchChannels(query));
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId);
    
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
                  <div className="bg-card p-3 border-b border-border">
                    <h2 className="font-semibold text-lg">{activeChannel.name}</h2>
                    <p className="text-sm text-muted-foreground">{activeChannel.description}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhum canal selecionado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Space to push content below fixed player */}
        <div className="player-spacer"></div>

        {/* Scrollable channel grid section */}
        <div className="flex-grow overflow-y-auto channel-list-container">
          <div className="tv-container pb-20">
            <ChannelGrid
              channels={channels}
              activeCategory={activeCategory}
              onSelectChannel={handleSelectChannel}
              onToggleFavorite={handleToggleFavorite}
              displayAsList={true}
            />
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
