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
import { useNotification } from '../../components/Notifications';

export default function Products() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  
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
      
      // Use search endpoint if we have search term or category filter
      if (searchTerm || (categoryFilter && categoryFilter !== 'All Categories')) {
        const searchData = {};
        if (searchTerm) searchData.search = searchTerm;
        if (categoryFilter && categoryFilter !== 'All Categories') searchData.category = categoryFilter;
        
        const response = await api.post('/products-search', searchData);
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
          baseCurrency: product.base_currency || 'USD',
          profit: product.profit || product.profit_margin || 0,
          bdtPrice: `৳${product.bdt_price || 0}`,
          bdtLabel: 'BDT (final price)',
          currencies: product.multi_currency ? (typeof product.multi_currency === 'string' ? JSON.parse(product.multi_currency) : product.multi_currency) : [],
          status: product.status
        }));
        setProducts(transformedProducts);
      } else {
        // Use regular endpoint for all products
        const response = await api.get('/products');
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
          baseCurrency: product.base_currency || 'USD',
          profit: product.profit || product.profit_margin || 0,
          bdtPrice: `৳${product.bdt_price || 0}`,
          bdtLabel: 'BDT (final price)',
          currencies: product.multi_currency ? (typeof product.multi_currency === 'string' ? JSON.parse(product.multi_currency) : product.multi_currency) : [],
          status: product.status
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        showError('Error: ' + (error.response.data.message || 'API request failed') + ' (Status: ' + error.response.status + ')');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
        showError('Network error: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        showError('Error: ' + error.message);
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
    baseCurrency: 'USD',
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
          showError('Product ID is required for update');
          return;
        }
        
        const formattedData = {
          product_name: productData.name,
          subscription_type: productData.type,
          base_price: parseFloat(productData.basePrice),
          base_currency: productData.baseCurrency || 'USD',
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
              baseCurrency: response.data.base_currency || 'USD',
              profit: response.data.profit_margin || 0,
              bdtPrice: `৳${response.data.bdt_price || 0}`,
              bdtLabel: 'BDT (final price)',
              currencies: response.data.multi_currency ? (typeof response.data.multi_currency === 'string' ? JSON.parse(response.data.multi_currency) : response.data.multi_currency) : [],
              status: response.data.status
            } : product
          )
        );
        showSuccess('Product updated successfully');
      } else {
        // Add new product
        const formattedData = {
          product_name: productData.name,
          subscription_type: productData.type,
          base_price: parseFloat(productData.basePrice),
          base_currency: productData.baseCurrency || 'USD',
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
          baseCurrency: response.data.base_currency || 'USD',
          profit: response.data.profit_margin || 0,
          bdtPrice: `৳${response.data.bdt_price || 0}`,
          bdtLabel: 'BDT (final price)',
          currencies: response.data.multi_currency ? (typeof response.data.multi_currency === 'string' ? JSON.parse(response.data.multi_currency) : response.data.multi_currency) : [],
          status: response.data.status
        };
        
        // Add the new product to the local state
        setProducts(prevProducts => [...prevProducts, newProduct]);
        showSuccess('Product created successfully');
      }
      
      handleCloseProductPopup();
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showError('Validation errors: ' + errorMessages.join(', '));
      } else {
        showError('Error saving product: ' + error.response?.data?.message || error.message);
      }
    }
  };

  // Handle product deletion
  const handleDeleteProduct = (product) => {
    setConfirmDialog({
      isOpen: true,
      item: product,
      action: 'deleteProduct'
    });
  };

  // Confirm product deletion
  const confirmDeleteProduct = async () => {
    const product = confirmDialog.item;
    try {
      const productId = product.id;
      if (!productId) {
        showError('Product ID is required for deletion');
        return;
      }
      
      const response = await api.delete(`/products/${productId}`);
      // After response interceptor normalization, response.data contains the result
      // Remove the product from the local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      showSuccess('Product deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Error deleting product: ' + error.response?.data?.message || error.message);
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
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
                        <div className="font-medium text-gray-900">{product.basePrice} {product.baseCurrency}</div>
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
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{confirmDialog.item?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmDeleteProduct}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}