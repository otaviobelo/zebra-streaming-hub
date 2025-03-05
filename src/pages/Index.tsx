
import React, { useState, useEffect } from 'react';
import { Tv } from 'lucide-react';
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

  // Initialize with first channel
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
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-3">
        <div className="tv-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tv className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">TV Zebra</h1>
            </div>
            <div className="w-full max-w-xs">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </header>

      <main className="tv-container py-6">
        {/* Video player */}
        <section className="mb-6">
          {activeChannel ? (
            <VideoPlayer channel={activeChannel} />
          ) : (
            <div className="w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum canal selecionado</p>
            </div>
          )}
        </section>

        {/* Categories & Navigation */}
        <section className="mb-6">
          <Navigation
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </section>

        {/* Channel grid */}
        <section>
          <ChannelGrid
            channels={channels}
            activeCategory={activeCategory}
            onSelectChannel={handleSelectChannel}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
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
