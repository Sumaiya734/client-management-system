import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import MultiCurrencyPricingPopup from '../../components/Products/MultiCurrencyPricingPopup';
import EditProductPopup from '../../components/Products/EditProductPopup';
import api from '../../api';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Multi-currency popup state
  const [isCurrencyPopupOpen, setIsCurrencyPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Unified product popup state
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const categoryOptions = [
    { value: 'All Categories', label: 'All Categories' },
    { value: 'Communication', label: 'Communication' },
    { value: 'Productivity', label: 'Productivity' },
    { value: 'Design', label: 'Design' },
    { value: 'AI Tools', label: 'AI Tools' },
    { value: 'Media', label: 'Media' },
  ];

  const filters = [
    {
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: categoryOptions,
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Communication': 'bg-blue-100 text-blue-800',
      'Productivity': 'bg-green-100 text-green-800',
      'Design': 'bg-purple-100 text-purple-800',
      'AI Tools': 'bg-orange-100 text-orange-800',
      'Media': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products';
      
      // Build query parameters
      const params = {};
      if (categoryFilter !== 'All Categories') {
        params.category = categoryFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }
      
      const response = await api.get(url);
      // After response interceptor normalization, response.data is the array of products
      // Transform the API response to match the expected format
      const transformedProducts = response.data.map(product => ({
        id: product.id,
        name: product.product_name || product.name,
        description: product.description,
        category: product.category,
        vendor: product.vendor,
        vendorWebsite: product.vendor_website,
        type: product.subscription_type || product.type,
        basePrice: product.base_price || 0,
        profit: product.profit_margin || 0,
        bdtPrice: `৳${product.bdt_price || 0}`,
        bdtLabel: 'BDT (final price)',
        currencies: product.multi_currency ? JSON.parse(product.multi_currency) : [],
        status: product.status
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert('Error: ' + (error.response.data.message || 'API request failed') + ' (Status: ' + error.response.status + ')');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
        alert('Network error: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create empty product template for adding new products
  const createEmptyProduct = () => ({
    id: null,
    name: '',
    description: '',
    category: 'Communication',
    vendor: '',
    type: 'Per User',
    basePrice: 0,
    profit: 0,
    bdtPrice: 0,
    bdtLabel: 'BDT (final price)',
    currencies: [],
    status: 'Active'
  });

  // Handle opening currency popup
  const handleCurrencySettings = (product) => {
    setSelectedProduct(product);
    setIsCurrencyPopupOpen(true);
  };

  // Handle closing currency popup
  const handleCloseCurrencyPopup = () => {
    setIsCurrencyPopupOpen(false);
    setSelectedProduct(null);
  };

  // Handle updating currency prices
  const handleUpdateCurrencyPrices = (productId, prices) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          // Update currencies array with new prices
          const updatedCurrencies = [
            { code: 'USD', price: prices.USD },
            { code: 'EUR', price: prices.EUR },
            { code: 'GBP', price: prices.GBP },
            { code: 'CAD', price: prices.CAD },
            { code: 'AUD', price: prices.AUD }
          ].filter(currency => currency.price && currency.price !== '0.00');

          return {
            ...product,
            currencies: updatedCurrencies
          };
        }
        return product;
      })
    );
    
    console.log('Updated currency prices for product:', productId, prices);
  };

  // Handle opening popup for adding new product
  const handleAddProduct = () => {
    setEditingProduct(createEmptyProduct());
    setIsEditMode(false);
    setIsProductPopupOpen(true);
  };

  // Handle opening popup for editing existing product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditMode(true);
    setIsProductPopupOpen(true);
  };

  // Handle closing product popup
  const handleCloseProductPopup = () => {
    setIsProductPopupOpen(false);
    setEditingProduct(null);
    setIsEditMode(false);
  };

  // Handle product submit (both create and update)
  const handleProductSubmit = async (productData) => {
    try {
      if (isEditMode) {
        // Update existing product
        const productId = productData.id;
        if (!productId) {
          alert('Product ID is required for update');
          return;
        }
        
        const formattedData = {
          product_name: productData.name,
          subscription_type: productData.type,
          base_price: parseFloat(productData.basePrice),
          bdt_price: parseFloat(productData.bdtPrice.replace('৳', '')),
          multi_currency: JSON.stringify(productData.currencies),
          status: productData.status,
          category: productData.category,
          vendor: productData.vendor,
          vendor_website: productData.vendorWebsite,
          profit_margin: parseFloat(productData.profit),
          description: productData.description
        };
        
        const response = await api.put(`/products/${productId}`, formattedData);
        // After response interceptor normalization, response.data contains the updated product
        // Update the product in the local state
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId ? {
              ...product,
              id: response.data.id,
              name: response.data.product_name || response.data.name,
              description: response.data.description,
              category: response.data.category,
              vendor: response.data.vendor,
              vendorWebsite: response.data.vendor_website,
              type: response.data.subscription_type || response.data.type,
              basePrice: response.data.base_price || 0,
              profit: response.data.profit_margin || 0,
              bdtPrice: `৳${response.data.bdt_price || 0}`,
              bdtLabel: 'BDT (final price)',
              currencies: response.data.multi_currency ? JSON.parse(response.data.multi_currency) : [],
              status: response.data.status
            } : product
          )
        );
        alert('Product updated successfully');
      } else {
        // Add new product
        const formattedData = {
          product_name: productData.name,
          subscription_type: productData.type,
          base_price: parseFloat(productData.basePrice),
          bdt_price: parseFloat(productData.bdtPrice.replace('৳', '')),
          multi_currency: JSON.stringify(productData.currencies),
          status: productData.status,
          category: productData.category,
          vendor: productData.vendor,
          vendor_website: productData.vendorWebsite,
          profit_margin: parseFloat(productData.profit),
          description: productData.description
        };
        
        const response = await api.post('/products', formattedData);
        // After response interceptor normalization, response.data contains the created product
        const newProduct = {
          id: response.data.id,
          name: response.data.product_name || response.data.name,
          description: response.data.description,
          category: response.data.category,
          vendor: response.data.vendor,
          vendorWebsite: response.data.vendor_website,
          type: response.data.subscription_type || response.data.type,
          basePrice: response.data.base_price || 0,
          profit: response.data.profit_margin || 0,
          bdtPrice: `৳${response.data.bdt_price || 0}`,
          bdtLabel: 'BDT (final price)',
          currencies: response.data.multi_currency ? JSON.parse(response.data.multi_currency) : [],
          status: response.data.status
        };
        
        // Add the new product to the local state
        setProducts(prevProducts => [...prevProducts, newProduct]);
        alert('Product created successfully');
      }
      
      handleCloseProductPopup();
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        alert('Validation errors: ' + errorMessages.join(', '));
      } else {
        alert('Error saving product: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        const productId = product.id;
        if (!productId) {
          alert('Product ID is required for deletion');
          return;
        }
        
        const response = await api.delete(`/products/${productId}`);
        // After response interceptor normalization, response.data contains the result
        // Remove the product from the local state
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        alert('Product deleted successfully');
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.response?.data?.message || error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Pricing"
        subtitle="Manage your product catalog and pricing"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        }
      />

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products by name or description..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Products ({loading ? '...' : products.length})</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Vendor & Type</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>BDT Price (with profit)</TableHead>
                <TableHead>Multi-Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{product.description}</div>
                        <Badge 
                          variant="default" 
                          className={`text-xs ${getCategoryColor(product.category)}`}
                        >
                          {product.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.vendor}</div>
                        <div className="text-sm text-gray-600">{product.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.basePrice}</div>
                        <div className="text-sm text-gray-600">Profit: {product.profit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.bdtPrice}</div>
                        <div className="text-sm text-gray-600">{product.bdtLabel}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.currencies && product.currencies.length > 0 ? (
                          product.currencies.map((currency) => (
                            <Badge 
                              key={currency.code}
                              variant="default"
                              className="text-xs bg-gray-100 text-gray-700"
                            >
                              {currency.code}: {currency.price}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No currencies</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="active">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Currency settings"
                          onClick={() => handleCurrencySettings(product)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Edit product"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Delete product"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Multi-Currency Pricing Popup */}
      <MultiCurrencyPricingPopup
        product={selectedProduct}
        isOpen={isCurrencyPopupOpen}
        onClose={handleCloseCurrencyPopup}
        onUpdate={handleUpdateCurrencyPrices}
      />

      {/* Unified Edit/Add Product Popup */}
      {editingProduct && (
        <EditProductPopup
          product={editingProduct}
          isOpen={isProductPopupOpen}
          onClose={handleCloseProductPopup}
          onUpdate={handleProductSubmit}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
