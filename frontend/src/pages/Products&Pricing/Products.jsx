import React, { useState } from 'react';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import MultiCurrencyPricingPopup from '../../components/Products/MultiCurrencyPricingPopup';
import EditProductPopup from '../../components/Products/EditProductPopup';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Multi-currency popup state
  const [isCurrencyPopupOpen, setIsCurrencyPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Unified product popup state
  const [isProductPopupOpen, setIsProductPopupOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Microsoft Teams',
      description: 'Business communication and collaboration platform',
      category: 'Communication',
      vendor: 'Microsoft',
      type: 'Per User',
      basePrice: '6.00 USD',
      profit: '25%',
      bdtPrice: '৳828.75',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '6.00' },
        { code: 'EUR', price: '5.50' },
        { code: 'GBP', price: '4.80' }
      ],
      status: 'Active'
    },
    {
      id: 2,
      name: 'Zoom Pro',
      description: 'Professional video conferencing solution',
      category: 'Communication',
      vendor: 'Zoom',
      type: 'Per License',
      basePrice: '14.99 USD',
      profit: '30%',
      bdtPrice: '৳2153.31',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '14.99' },
        { code: 'EUR', price: '13.50' },
        { code: 'GBP', price: '11.99' }
      ],
      status: 'Active'
    },
    {
      id: 3,
      name: 'Office 365 Business',
      description: 'Complete productivity suite with Office apps',
      category: 'Productivity',
      vendor: 'Microsoft',
      type: 'Per User',
      basePrice: '12.50 USD',
      profit: '20%',
      bdtPrice: '৳1657.50',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '12.50' },
        { code: 'EUR', price: '11.20' },
        { code: 'GBP', price: '9.80' }
      ],
      status: 'Active'
    },
    {
      id: 4,
      name: 'Figma Professional',
      description: 'Collaborative design and prototyping tool',
      category: 'Design',
      vendor: 'Figma',
      type: 'Per Editor',
      basePrice: '12.00 USD',
      profit: '35%',
      bdtPrice: '৳1790.10',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '12.00' },
        { code: 'EUR', price: '11.00' },
        { code: 'GBP', price: '9.50' }
      ],
      status: 'Active'
    },
    {
      id: 5,
      name: 'ChatGPT Plus',
      description: 'Advanced AI assistant with GPT-4 access',
      category: 'AI Tools',
      vendor: 'OpenAI',
      type: 'Per User',
      basePrice: '20.00 USD',
      profit: '40%',
      bdtPrice: '৳3094.00',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '20.00' },
        { code: 'EUR', price: '18.50' },
        { code: 'GBP', price: '16.00' }
      ],
      status: 'Active'
    },
    {
      id: 6,
      name: 'Economist Digital',
      description: 'Digital subscription to The Economist',
      category: 'Media',
      vendor: 'The Economist',
      type: 'Per Account',
      basePrice: '12.99 USD',
      profit: '15%',
      bdtPrice: '৳1650.70',
      bdtLabel: 'BDT (final price)',
      currencies: [
        { code: 'USD', price: '12.99' },
        { code: 'EUR', price: '11.50' },
        { code: 'GBP', price: '10.99' }
      ],
      status: 'Active'
    }
  ]);

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

  // Create empty product template for adding new products
  const createEmptyProduct = () => ({
    id: Date.now(), // Temporary ID for new products
    name: '',
    description: '',
    category: 'Communication',
    vendor: '',
    type: 'Per User',
    basePrice: '0.00 USD',
    profit: '0%',
    bdtPrice: '৳0.00',
    bdtLabel: 'BDT (final price)',
    currencies: [
      { code: 'USD', price: '0.00' }
    ],
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
  const handleProductSubmit = (productData) => {
    if (isEditMode) {
      // Update existing product
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productData.id ? productData : product
        )
      );
      console.log('Updated product:', productData);
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Date.now() // Generate new ID for the product
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      console.log('Added new product:', newProduct);
    }
    
    handleCloseProductPopup();
  };

  // Handle product deletion
  const handleDeleteProduct = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      setProducts(prevProducts => 
        prevProducts.filter(p => p.id !== product.id)
      );
      console.log('Deleted product:', product);
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
          <CardTitle>Products ({products.length})</CardTitle>
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
              {products.map((product) => (
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
                      {product.currencies.map((currency) => (
                        <Badge 
                          key={currency.code}
                          variant="default"
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          {currency.code}: {currency.price}
                        </Badge>
                      ))}
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
              ))}
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
