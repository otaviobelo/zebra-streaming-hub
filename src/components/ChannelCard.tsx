
import React from 'react';
import { Channel } from '@/lib/types';
import { Star, StarOff } from 'lucide-react';
import { toggleFavoriteChannel } from '@/utils/channelData';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  return (
    <div 
      className="channel-card cursor-pointer animate-scale-in"
      onClick={() => onClick(channel)}
    >
      <div className="aspect-video bg-muted/30 relative">
        <img 
          src={channel.thumbnailUrl} 
          alt={channel.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/400x225/beige/333333?text=${encodeURIComponent(channel.name)}`;
          }}
        />
        <div className="channel-info">
          <h3 className="text-sm font-medium">{channel.name}</h3>
          <p className="text-xs opacity-80 mt-1 line-clamp-2">{channel.description}</p>
        </div>
        <button 
          className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/50 transition-colors"
          onClick={handleFavoriteClick}
          aria-label={channel.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {channel.isFavorite ? (
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChannelCard;
