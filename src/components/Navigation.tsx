
import React from 'react';
import { categories } from '@/utils/channelData';
import { Star } from 'lucide-react';

interface NavigationProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isVertical?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeCategory, 
  onSelectCategory, 
  isVertical = false 
}) => {
  return (
    <div className={`${isVertical 
        ? 'flex flex-col space-y-1' 
        : 'overflow-x-auto scrollbar-none pb-2 border-b border-border mb-4'
      }`}>
      <div className={`${isVertical 
          ? 'flex flex-col space-y-1' 
          : 'flex items-center space-x-1 min-w-max'
        }`}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`menu-item ${activeCategory === category.id ? 'active' : ''} ${
              isVertical ? 'justify-start' : ''
            }`}
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory('favorites')}
          className={`menu-item ${activeCategory === 'favorites' ? 'active' : ''} ${
            isVertical ? 'justify-start' : ''
          }`}
        >
          <Star size={16} className="mr-1" />
          Favoritos
        </button>
      </div>
    </div>
  );
};

export default Navigation;
