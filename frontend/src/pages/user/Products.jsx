import ProductCard from "@/components/ProductCard";
import ProductContext from "@/context/ProductContext";
import Pagination from "@/components/Pagination";
import React, { useState, useContext, useEffect } from "react";

const Products = () => {
  const { products: productsData, loading, error, refreshProducts } = useContext(ProductContext);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('featured');
  const productsPerPage = 8;

  const minPrice = Math.min(...productsData?.map(p => p.price) || [0]);
  const maxPrice = Math.max(...productsData?.map(p => p.price) || [1000]);

  useEffect(() => {
    if (productsData?.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [productsData, minPrice, maxPrice]);

  const products = Array.isArray(productsData) 
    ? productsData 
    : productsData?.products || [];
  
  // Filter products
  let filteredProducts = products.filter(product => {
    if (!product) return false;
    
    const price = product.price || 0;
    const priceMatch = price >= priceRange[0] && price <= priceRange[1];
    
    
    
    return priceMatch;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low-high':
        return (a.price || 0) - (b.price || 0);
      case 'price-high-low':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0; // Default or 'featured' - no sorting
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePriceChange = (values) => {
    setPriceRange(values);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };
 const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setCategories([]);
    setCurrentPage(1);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error m-4">Error loading products: {error}</div>;
  if (!loading && products.length === 0) return <div className="alert alert-warning m-4">No products available</div>;

  // Get unique categories for filter
  const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold">All Products</h1>
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="btn btn-sm"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Section - Sidebar */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-72 bg-gray-100 p-4 border-r border-gray-200`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={handleClearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Price Range Slider */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="px-2">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
              className="range range-primary range-xs mb-2"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
              className="range range-primary range-xs"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Categories Filter */}
        {allCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {allCategories.map(category => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="checkbox checkbox-primary checkbox-sm mr-2"
                  />
                  <label htmlFor={`category-${category}`} className="text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-4 md:p-6">
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Products ({filteredProducts.length})</h1>
          <div>
            <select 
              className="select select-bordered select-sm md:select-md"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {currentProducts.map((product) => (
              <ProductCard 
                key={product._id}
                id={product._id} 
                title={product.name}
                image={product.images}
                stock={product.stock}
                description={product.description}
                price={product.price}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg">No products match your filters</p>
            <button 
              onClick={handleClearFilters}
              className="btn btn-link mt-2"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > productsPerPage && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Products;