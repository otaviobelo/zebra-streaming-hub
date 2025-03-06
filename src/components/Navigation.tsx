
import React, { useState } from 'react';
import { categories } from '@/utils/channelData';
import { Star, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu toggle button - only visible on small screens */}
      <button 
        className="md:hidden fixed top-20 left-4 z-30 bg-primary text-white p-2 rounded-full shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation menu */}
      <div className={`
        ${isVertical ? 'md:sticky md:top-[161px] md:h-[calc(100vh-161px)] md:flex md:flex-col md:space-y-1' : ''}
        ${mobileMenuOpen ? 'fixed inset-0 z-20 bg-background/95 pt-20 px-4' : 'hidden md:block'}
      `}>
        <div className={`
          ${isVertical ? 'flex flex-col space-y-1' : 'flex items-center space-x-1 min-w-max'}
        `}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                onSelectCategory(category.id);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`menu-item ${activeCategory === category.id ? 'active' : ''} ${
                isVertical ? 'justify-start' : ''
              }`}
            >
              {category.name}
            </button>
          ))}
          <button
            onClick={() => {
              onSelectCategory('favorites');
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`menu-item ${activeCategory === 'favorites' ? 'active' : ''} ${
              isVertical ? 'justify-start' : ''
            }`}
          >
            <Star size={16} className="mr-1" />
            Favoritos
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;
