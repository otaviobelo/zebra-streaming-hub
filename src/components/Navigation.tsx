
import React from 'react';
import { categories } from '@/utils/channelData';
import { Star } from 'lucide-react';

interface NavigationProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="overflow-x-auto scrollbar-none pb-2">
      <div className="flex items-center space-x-1 min-w-max">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`menu-item ${activeCategory === category.id ? 'active' : ''}`}
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory('favorites')}
          className={`menu-item ${activeCategory === 'favorites' ? 'active' : ''}`}
        >
          <Star size={16} className="mr-1" />
          Favoritos
        </button>
      </div>
    </div>
  );
};

export default Navigation;
