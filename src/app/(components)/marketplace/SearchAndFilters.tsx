'use client';

import React from 'react';
import { Search, ChevronDown, Settings2, DollarSign, ListFilter } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
}

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  aiModels: FilterOption[];
  selectedModel: string; // This will be the ID
  setSelectedModel: (modelId: string) => void;
  priceRanges: FilterOption[];
  selectedPrice: string; // This will be the ID
  setSelectedPrice: (priceId: string) => void;
  sortOptions: FilterOption[];
  selectedSort: string; // This will be the ID
  setSelectedSort: (sortId: string) => void;
}

const FilterSelect: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string; // This will be the ID
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FilterOption[];
  idPrefix: string;
}> = ({ icon: Icon, label, value, onChange, options, idPrefix }) => (
  <div className="relative flex items-center">
    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    <select 
      id={`${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`}
      value={value} 
      onChange={onChange} 
      className="w-full appearance-none pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
      aria-label={label}
    >
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.id === 'all' || option.name.toLowerCase().includes('(all)') ? `${label} (All)` : option.name}
        </option>
      ))}
    </select>
    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  aiModels,
  selectedModel,
  setSelectedModel,
  priceRanges,
  selectedPrice,
  setSelectedPrice,
  sortOptions,
  selectedSort,
  setSelectedSort
}) => {
  return (
    <section className="py-6 sm:py-8 sticky top-16 bg-gray-50/95 backdrop-blur-sm z-30 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-grow w-full md:max-w-xs lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input 
              type="search" 
              placeholder="Search prompts..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search prompts"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center md:justify-start flex-grow md:flex-grow-0">
            <FilterSelect
              icon={Settings2}
              label="AI Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              options={aiModels}
              idPrefix="filter-model"
            />
            <FilterSelect
              icon={DollarSign}
              label="Price Range"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              options={priceRanges}
              idPrefix="filter-price"
            />
          </div>
          
          {/* Sort Select - often placed separately or to the right */}
          <div className="w-full md:w-auto md:ml-auto">
             <FilterSelect
              icon={ListFilter}
              label="Sort by"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              options={sortOptions}
              idPrefix="filter-sort"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchAndFilters; 