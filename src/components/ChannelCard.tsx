import React from 'react';
import { Channel } from '@/lib/types';
import { Star, StarOff } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  displayAsList?: boolean;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  channel, 
  onClick, 
  onToggleFavorite,
  displayAsList = false
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  if (displayAsList) {
    return (
      <div 
        className="channel-list-item cursor-pointer animate-scale-in"
        onClick={() => onClick(channel)}
      >
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
          <div className="flex-grow">
            <h3 className="font-medium">{channel.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
          </div>
          <button 
            className="ml-2 p-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
            onClick={handleFavoriteClick}
            aria-label={channel.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {channel.isFavorite ? (
              <Star size={20} className="fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff size={20} />
            )}
          </button>
        </div>
      </div>
    );
  }

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
