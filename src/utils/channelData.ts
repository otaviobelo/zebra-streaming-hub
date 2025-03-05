
import { Channel, Category } from '@/lib/types';

export const categories: Category[] = [
  { id: 'all', name: 'Todos' },
  { id: 'news', name: 'Notícias' },
  { id: 'entertainment', name: 'Entretenimento' },
  { id: 'sports', name: 'Esportes' },
  { id: 'music', name: 'Música' },
  { id: 'documentary', name: 'Documentários' },
  { id: 'movies', name: 'Filmes' },
];

export const channels: Channel[] = [
  {
    id: '1',
    name: 'TV Brasil',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://logodownload.org/wp-content/uploads/2017/11/tv-brasil-logo.png',
    category: 'news',
    description: 'Canal público nacional com programação educativa, cultural e jornalística.'
  },
  {
    id: '2',
    name: 'Amazon Sat',
    streamUrl: 'https://amazonsat.brasilstream.com.br/hls/amazonsat/index.m3u8',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Amazon_sat_logo.png/640px-Amazon_sat_logo.png',
    category: 'entertainment',
    description: 'Canal com foco em conteúdo da região amazônica e programação variada.'
  },
  {
    id: '3',
    name: 'Rede Minas',
    streamUrl: 'https://8hzcavccys.zoeweb.tv/redeminas/ngrp:redeminas_all/chunklist_b2179072.m3u8',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Rede_Minas_logo.svg/500px-Rede_Minas_logo.svg.png',
    category: 'entertainment',
    description: 'Canal regional de Minas Gerais com programação cultural e educativa.'
  },
  {
    id: '4',
    name: 'ISTV',
    streamUrl: 'https://video08.logicahost.com.br/istvnacional/srt.stream/chunklist_w745016844.m3u8',
    thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvR1NdbW7iVqCKc5e5TFcZEJCIQxVcyWlmw30xsrNIB9E1GnfL8UiMPfnHzOGvXfpCq4Y&usqp=CAU',
    category: 'entertainment',
    description: 'Canal independente com programação variada de entretenimento.'
  },
  // Adding additional placeholder channels for a better UI demo
  {
    id: '5',
    name: 'Sports Live',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/FFA07A/ffffff?text=Sports+Live',
    category: 'sports',
    description: 'Canal dedicado a transmissões esportivas ao vivo.'
  },
  {
    id: '6',
    name: 'Music Hits',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/6495ED/ffffff?text=Music+Hits',
    category: 'music',
    description: 'Os melhores clipes musicais e shows ao vivo.'
  },
  {
    id: '7',
    name: 'Documentários HD',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/90EE90/333333?text=Documentários',
    category: 'documentary',
    description: 'Os melhores documentários em alta definição.'
  },
  {
    id: '8',
    name: 'Cine Clássicos',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/FFD700/333333?text=Cine+Clássicos',
    category: 'movies',
    description: 'Filmes clássicos que marcaram época.'
  },
];

// Local storage utility functions
export const getFavoriteChannels = (): string[] => {
  try {
    const favorites = localStorage.getItem('tvzebra-favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const toggleFavoriteChannel = (channelId: string): string[] => {
  try {
    const favorites = getFavoriteChannels();
    const updatedFavorites = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    
    localStorage.setItem('tvzebra-favorites', JSON.stringify(updatedFavorites));
    return updatedFavorites;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
};

// Get channels with favorite status
export const getChannelsWithFavorites = (): Channel[] => {
  const favorites = getFavoriteChannels();
  return channels.map(channel => ({
    ...channel,
    isFavorite: favorites.includes(channel.id)
  }));
};

// Search channels
export const searchChannels = (query: string): Channel[] => {
  if (!query.trim()) return getChannelsWithFavorites();
  
  const normalizedQuery = query.toLowerCase().trim();
  const channelsWithFavorites = getChannelsWithFavorites();
  
  return channelsWithFavorites.filter(channel => 
    channel.name.toLowerCase().includes(normalizedQuery) ||
    channel.description.toLowerCase().includes(normalizedQuery) ||
    channel.category.toLowerCase().includes(normalizedQuery)
  );
};

// Filter channels by category
export const filterChannelsByCategory = (categoryId: string): Channel[] => {
  const channelsWithFavorites = getChannelsWithFavorites();
  
  if (categoryId === 'all') return channelsWithFavorites;
  if (categoryId === 'favorites') return channelsWithFavorites.filter(channel => channel.isFavorite);
  
  return channelsWithFavorites.filter(channel => channel.category === categoryId);
};
