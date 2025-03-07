
import React, { useState } from 'react';
import { categories } from '@/utils/channelData';
import { Star, Menu, X } from 'lucide-react';

interface NavigationProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isFixed?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeCategory, 
  onSelectCategory,
  isFixed = false
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
        nav-wrapper bg-[#F6F6F7] backdrop-blur-md border-b border-border py-3 w-full z-20
        ${mobileMenuOpen ? 'fixed inset-0 pt-20 px-4' : 'hidden md:block'}
      `}>
        <div className="tv-container">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  onSelectCategory(category.id);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className={`menu-item whitespace-nowrap ${activeCategory === category.id ? 'active' : ''}`}
              >
                {category.name}
              </button>
            ))}
            <button
              onClick={() => {
                onSelectCategory('favorites');
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`menu-item whitespace-nowrap ${activeCategory === 'favorites' ? 'active' : ''}`}
            >
              <Star size={16} className="mr-1" />
              Favoritos
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
