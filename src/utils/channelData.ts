
import { Channel, Category, AdminCredentials } from '@/lib/types';
import { syncService } from './syncService';

// Add IndexedDB for persistent storage
const DB_NAME = 'tvzebra-db';
const DB_VERSION = 1;
const CHANNELS_STORE = 'channels';
const FAVORITES_STORE = 'favorites';

// Setup IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create channels store with channelNumber as key path
      if (!db.objectStoreNames.contains(CHANNELS_STORE)) {
        const channelsStore = db.createObjectStore(CHANNELS_STORE, { keyPath: 'id' });
        channelsStore.createIndex('channelNumber', 'channelNumber', { unique: true });
      }
      
      // Create favorites store
      if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
        db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const categories: Category[] = [
  { id: 'all', name: 'Todos' },
  { id: 'news', name: 'Notícias' },
  { id: 'entertainment', name: 'Entretenimento' },
  { id: 'sports', name: 'Esportes' },
  { id: 'music', name: 'Música' },
  { id: 'documentary', name: 'Documentários' },
  { id: 'movies', name: 'Filmes' },
];

export const adminCredentials: AdminCredentials = {
  username: "GOLFINHO",
  password: "ZEBRA"
};

// Default channels with correct logoUrl and channel numbers
const defaultChannels: Channel[] = [
  {
    id: '1',
    channelNumber: 1,
    name: 'TV Brasil',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://logodownload.org/wp-content/uploads/2017/11/tv-brasil-logo.png',
    logoUrl: 'https://seeklogo.com/images/S/sbt-logo-3D30D31294-seeklogo.com.png',
    category: 'news',
    description: 'Canal público nacional com programação educativa, cultural e jornalística.'
  },
  {
    id: '2',
    channelNumber: 2,
    name: 'Amazon Sat',
    streamUrl: 'https://amazonsat.brasilstream.com.br/hls/amazonsat/index.m3u8',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Amazon_sat_logo.png/640px-Amazon_sat_logo.png',
    logoUrl: 'https://portalamazonia.com/wp-content/uploads/2022/05/b2ap3_large_atual-logo.jpg',
    category: 'entertainment',
    description: 'Canal com foco em conteúdo da região amazônica e programação variada.'
  },
  {
    id: '3',
    channelNumber: 3,
    name: 'Rede Minas',
    streamUrl: 'https://8hzcavccys.zoeweb.tv/redeminas/ngrp:redeminas_all/chunklist_b2179072.m3u8',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Rede_Minas_logo.svg/500px-Rede_Minas_logo.svg.png',
    logoUrl: 'https://redeminas.tv/wp-content/uploads/2014/09/RedeMinas.png',
    category: 'entertainment',
    description: 'Canal regional de Minas Gerais com programação cultural e educativa.'
  },
  {
    id: '4',
    channelNumber: 4,
    name: 'ISTV',
    streamUrl: 'https://video08.logicahost.com.br/istvnacional/srt.stream/chunklist_w745016844.m3u8',
    thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvR1NdbW7iVqCKc5e5TFcZEJCIQxVcyWlmw30xsrNIB9E1GnfL8UiMPfnHzOGvXfpCq4Y&usqp=CAU',
    logoUrl: 'https://www.istv.com.br/static/media/Logo_ISTV_01.0b00a8e55712712e3890.png',
    category: 'entertainment',
    description: 'Canal independente com programação variada de entretenimento.'
  },
  // Additional placeholder channels
  {
    id: '5',
    channelNumber: 5,
    name: 'Sports Live',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/FFA07A/ffffff?text=Sports+Live',
    logoUrl: 'https://placehold.co/120x120/FFA07A/ffffff?text=SL',
    category: 'sports',
    description: 'Canal dedicado a transmissões esportivas ao vivo.'
  },
  {
    id: '6',
    channelNumber: 6,
    name: 'Music Hits',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/6495ED/ffffff?text=Music+Hits',
    logoUrl: 'https://placehold.co/120x120/6495ED/ffffff?text=MH',
    category: 'music',
    description: 'Os melhores clipes musicais e shows ao vivo.'
  },
  {
    id: '7',
    channelNumber: 7,
    name: 'Documentários HD',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/90EE90/333333?text=Documentários',
    logoUrl: 'https://placehold.co/120x120/90EE90/333333?text=DOC',
    category: 'documentary',
    description: 'Os melhores documentários em alta definição.'
  },
  {
    id: '8',
    channelNumber: 8,
    name: 'Cine Clássicos',
    streamUrl: 'https://cdn.live.br1.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8',
    thumbnailUrl: 'https://placehold.co/400x225/FFD700/333333?text=Cine+Clássicos',
    logoUrl: 'https://placehold.co/120x120/FFD700/333333?text=CC',
    category: 'movies',
    description: 'Filmes clássicos que marcaram época.'
  },
];

// Get all channels from IndexedDB or fallback to localStorage
export const getInitialChannels = async (): Promise<Channel[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(CHANNELS_STORE, 'readonly');
      const store = transaction.objectStore(CHANNELS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        if (request.result.length > 0) {
          resolve(request.result);
        } else {
          // Fallback to localStorage if no data in IndexedDB
          try {
            const storedChannels = localStorage.getItem('tvzebra-channels');
            const channels = storedChannels ? JSON.parse(storedChannels) : defaultChannels;
            
            // Initialize IndexedDB with channels from localStorage or defaults
            saveChannels(channels);
            resolve(channels);
          } catch (error) {
            console.error('Error getting channels from localStorage:', error);
            resolve(defaultChannels);
          }
        }
      };
      
      request.onerror = () => {
        console.error('Error reading channels from IndexedDB');
        resolve(defaultChannels);
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    
    // Fallback to localStorage
    try {
      const storedChannels = localStorage.getItem('tvzebra-channels');
      return storedChannels ? JSON.parse(storedChannels) : defaultChannels;
    } catch (error) {
      console.error('Error getting channels from localStorage:', error);
      return defaultChannels;
    }
  }
};

// Save channels to IndexedDB and localStorage as backup
export const saveChannels = async (channels: Channel[]): Promise<void> => {
  try {
    // Ensure all channels have channel numbers
    const channelsWithNumbers = channels.map((channel, index) => {
      if (!channel.channelNumber) {
        return { ...channel, channelNumber: index + 1 };
      }
      return channel;
    });
    
    // Save to localStorage as backup
    localStorage.setItem('tvzebra-channels', JSON.stringify(channelsWithNumbers));
    
    // Save to IndexedDB
    const db = await initDB();
    const transaction = db.transaction(CHANNELS_STORE, 'readwrite');
    const store = transaction.objectStore(CHANNELS_STORE);
    
    // Clear existing data
    store.clear();
    
    // Add all channels
    channelsWithNumbers.forEach(channel => {
      store.add(channel);
    });
    
    transaction.oncomplete = () => {
      console.log('Channels saved to IndexedDB successfully');
      // Notificar que os canais foram atualizados
      syncService.notifyChannelsUpdated();
    };
    
    transaction.onerror = (event) => {
      console.error('Error saving channels to IndexedDB:', transaction.error);
    };
  } catch (error) {
    console.error('Error saving channels:', error);
  }
};

// Local storage utility functions
export const getFavoriteChannels = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(FAVORITES_STORE, 'readonly');
      const store = transaction.objectStore(FAVORITES_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        if (request.result.length > 0) {
          resolve(request.result.map(item => item.id));
        } else {
          // Fallback to localStorage
          try {
            const favorites = localStorage.getItem('tvzebra-favorites');
            resolve(favorites ? JSON.parse(favorites) : []);
          } catch (error) {
            console.error('Error getting favorites from localStorage:', error);
            resolve([]);
          }
        }
      };
      
      request.onerror = () => {
        console.error('Error reading favorites from IndexedDB');
        resolve([]);
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB for favorites:', error);
    
    // Fallback to localStorage
    try {
      const favorites = localStorage.getItem('tvzebra-favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }
};

export const toggleFavoriteChannel = async (channelId: string): Promise<string[]> => {
  try {
    const favorites = await getFavoriteChannels();
    const updatedFavorites = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    
    // Update localStorage as backup
    localStorage.setItem('tvzebra-favorites', JSON.stringify(updatedFavorites));
    
    // Update IndexedDB
    const db = await initDB();
    const transaction = db.transaction(FAVORITES_STORE, 'readwrite');
    const store = transaction.objectStore(FAVORITES_STORE);
    
    // Clear existing data
    store.clear();
    
    // Add all favorites
    updatedFavorites.forEach(id => {
      store.add({ id });
    });
    
    // Notificar que as alterações de favoritos afetam os canais
    syncService.notifyChannelsUpdated();
    
    return updatedFavorites;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
};

// Add a new channel
export const addChannel = async (channel: Omit<Channel, "id" | "isFavorite" | "channelNumber">): Promise<Channel[]> => {
  try {
    const channels = await getChannelsWithFavorites();
    
    // Find the highest channel number
    const highestNumber = channels.reduce((highest, current) => 
      Math.max(highest, current.channelNumber || 0), 0);
    
    const newChannel: Channel = {
      ...channel,
      id: Date.now().toString(),
      channelNumber: highestNumber + 1,
      isFavorite: false
    };
    
    const updatedChannels = [...channels, newChannel];
    await saveChannels(updatedChannels);
    return updatedChannels;
  } catch (error) {
    console.error('Error adding channel:', error);
    return getChannelsWithFavorites();
  }
};

// Get channels with favorite status
export const getChannelsWithFavorites = async (): Promise<Channel[]> => {
  const [channels, favorites] = await Promise.all([
    getInitialChannels(),
    getFavoriteChannels()
  ]);
  
  return channels.map(channel => ({
    ...channel,
    isFavorite: favorites.includes(channel.id)
  }));
};

// Search channels
export const searchChannels = async (query: string): Promise<Channel[]> => {
  if (!query.trim()) return getChannelsWithFavorites();
  
  const normalizedQuery = query.toLowerCase().trim();
  const channelsWithFavorites = await getChannelsWithFavorites();
  
  return channelsWithFavorites.filter(channel => 
    channel.name.toLowerCase().includes(normalizedQuery) ||
    channel.description.toLowerCase().includes(normalizedQuery) ||
    channel.category.toLowerCase().includes(normalizedQuery) ||
    channel.channelNumber?.toString() === normalizedQuery
  );
};

// Filter channels by category
export const filterChannelsByCategory = async (categoryId: string): Promise<Channel[]> => {
  const channelsWithFavorites = await getChannelsWithFavorites();
  
  if (categoryId === 'all') return channelsWithFavorites;
  if (categoryId === 'favorites') return channelsWithFavorites.filter(channel => channel.isFavorite);
  
  return channelsWithFavorites.filter(channel => channel.category === categoryId);
};

// Delete a channel
export const deleteChannel = async (channelId: string): Promise<Channel[]> => {
  try {
    const channels = await getChannelsWithFavorites();
    const updatedChannels = channels.filter(channel => channel.id !== channelId);
    await saveChannels(updatedChannels);
    // Não precisamos notificar aqui porque saveChannels já fará isso
    return updatedChannels;
  } catch (error) {
    console.error('Error deleting channel:', error);
    return getChannelsWithFavorites();
  }
};

// Update an existing channel
export const updateChannel = async (
  channelId: string, 
  channelData: Omit<Channel, "id" | "isFavorite" | "channelNumber">
): Promise<Channel[]> => {
  try {
    const channels = await getChannelsWithFavorites();
    const channelIndex = channels.findIndex(ch => ch.id === channelId);
    
    if (channelIndex === -1) {
      console.error('Channel not found:', channelId);
      return channels;
    }
    
    const updatedChannel = {
      ...channels[channelIndex],
      ...channelData
    };
    
    const updatedChannels = [...channels];
    updatedChannels[channelIndex] = updatedChannel;
    
    await saveChannels(updatedChannels);
    // Não precisamos notificar aqui porque saveChannels já fará isso
    return updatedChannels;
  } catch (error) {
    console.error('Error updating channel:', error);
    return getChannelsWithFavorites();
  }
};
