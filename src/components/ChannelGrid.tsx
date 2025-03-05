
import React, { useEffect, useRef } from 'react';
import { Channel } from '@/lib/types';
import ChannelCard from './ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  activeCategory: string;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  displayAsList?: boolean;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ 
  channels, 
  activeCategory, 
  onSelectChannel, 
  onToggleFavorite,
  displayAsList = false
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to top when category changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  if (channels.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <p className="text-muted-foreground">Nenhum canal encontrado</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="w-full overflow-y-auto pb-6">
      {displayAsList ? (
        <div className="flex flex-col space-y-4">
          {channels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onClick={onSelectChannel}
              onToggleFavorite={onToggleFavorite}
              displayAsList={true}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {channels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onClick={onSelectChannel}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelGrid;
