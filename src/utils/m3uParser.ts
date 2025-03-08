
/**
 * Utilitário para análise de arquivos M3U/IPTV
 */

import { Channel } from '@/lib/types';

interface M3UEntry {
  title: string;
  url: string;
  tvgLogo?: string;
  groupTitle?: string;
  attributes?: Record<string, string>;
}

/**
 * Analisa uma string contendo conteúdo M3U e extrai as entradas
 */
export const parseM3UContent = (content: string): M3UEntry[] => {
  const lines = content.split('\n');
  const entries: M3UEntry[] = [];
  
  // Verificar se o conteúdo começa com #EXTM3U (cabeçalho M3U)
  if (!lines[0].trim().startsWith('#EXTM3U')) {
    console.warn('O arquivo não parece ser um arquivo M3U válido');
  }
  
  let currentEntry: Partial<M3UEntry> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Linha de informação do canal
      currentEntry = {};
      
      // Extrair título
      const titleMatch = line.match(/,(.*)$/);
      if (titleMatch && titleMatch[1]) {
        currentEntry.title = titleMatch[1].trim();
      }
      
      // Extrair atributos (tvg-logo, group-title, etc)
      const attributes: Record<string, string> = {};
      
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      if (tvgLogoMatch && tvgLogoMatch[1]) {
        currentEntry.tvgLogo = tvgLogoMatch[1];
        attributes['tvg-logo'] = tvgLogoMatch[1];
      }
      
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);
      if (groupTitleMatch && groupTitleMatch[1]) {
        currentEntry.groupTitle = groupTitleMatch[1];
        attributes['group-title'] = groupTitleMatch[1];
      }
      
      currentEntry.attributes = attributes;
    } else if (line.startsWith('http') && currentEntry.title) {
      // URL do stream
      currentEntry.url = line;
      
      // Adiciona à lista de entradas
      entries.push(currentEntry as M3UEntry);
      currentEntry = {};
    }
  }
  
  return entries;
};

/**
 * Converte entradas M3U para o formato de canais da aplicação
 */
export const convertM3UEntriesToChannels = (entries: M3UEntry[]): Omit<Channel, "id" | "isFavorite" | "channelNumber">[] => {
  return entries.map(entry => {
    // Mapear categoria a partir do group-title
    let category = 'entertainment'; // categoria padrão
    
    if (entry.groupTitle) {
      const groupLower = entry.groupTitle.toLowerCase();
      
      // Mapeamento simples de categorias comuns
      if (groupLower.includes('news') || groupLower.includes('information') || groupLower.includes('info')) {
        category = 'news';
      } else if (groupLower.includes('sport')) {
        category = 'sports';
      } else if (groupLower.includes('movie') || groupLower.includes('film') || groupLower.includes('cinema')) {
        category = 'movies';
      } else if (groupLower.includes('music') || groupLower.includes('musique')) {
        category = 'music';
      } else if (groupLower.includes('doc')) {
        category = 'documentary';
      }
    }
    
    return {
      name: entry.title,
      streamUrl: entry.url,
      thumbnailUrl: entry.tvgLogo,
      logoUrl: entry.tvgLogo,
      category: category,
      description: `Canal importado de lista IPTV (${entry.groupTitle || 'Sem categoria'})`
    };
  });
};

/**
 * Processa o conteúdo M3U bruto e retorna canais formatados
 */
export const processM3UContent = (content: string): Omit<Channel, "id" | "isFavorite" | "channelNumber">[] => {
  const entries = parseM3UContent(content);
  return convertM3UEntriesToChannels(entries);
};
