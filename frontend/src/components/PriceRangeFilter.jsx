import React from 'react';

const PriceRangeFilter = ({ filters, onFilterChange }) => {
  const handlePriceRangeChange = (value) => {
    onFilterChange('priceRange', value);
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Price Range</h3>
      <div className="space-y-2">
        {[
          { value: '0-25', label: '$0 - $25' },
          { value: '25-50', label: '$25 - $50' },
          { value: '50-100', label: '$50 - $100' },
          { value: '100+', label: 'Over $100' }
        ].map((range) => (
          <label key={range.value} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="checkbox checkbox-sm md:checkbox-md"
              checked={filters.priceRange.includes(range.value)}
              onChange={() => handlePriceRangeChange(range.value)}
            />
            <span>{range.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeFilter;