import React from 'react';
import { Search } from 'lucide-react';

export const SearchFilter = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  title = '',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white/40
        backdrop-blur-xl
        border border-white/30
        rounded-2xl
        p-6
        shadow-[0_20px_40px_rgba(0,0,0,0.15)]
        transition-all duration-300
        hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]
        ${className}
      `}
      {...props}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
         {title}
      </h3>

      <div className="flex flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full
              pl-11 pr-4 py-2.5
              rounded-xl
              bg-white/60
              backdrop-blur-md
              border border-white/40
              text-gray-800
              placeholder-gray-500
              focus:outline-none
              focus:ring-2 focus:ring-purple-300
              focus:border-transparent
              shadow-inner
            "
          />
        </div>

        {/* Filters */}
        {filters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="
              min-w-[140px]
              px-4 py-2.5
              rounded-xl
              bg-white/60
              backdrop-blur-md
              border border-white/40
              text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-purple-300
              focus:border-transparent
              shadow-inner
              cursor-pointer
            "
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
