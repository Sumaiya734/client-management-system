import React, { useState, useEffect } from "react";
import api from '../../api';

interface CreatePurchaseOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (orderData: any) => void;
}

interface ProductItem {
  id: string;
  productId: string;
  quantity: number;
  subscriptionStart: string;
  subscriptionEnd: string;
}

interface FormData {
  status: string;
  clientId: string;
  products: ProductItem[];
  subscriptionActive: boolean;
  attachment: File | null;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderPopupProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<FormData>({
    status: 'Pending',
    clientId: '',
    products: [{
      id: Date.now().toString(),
      productId: '',
      quantity: 1,
      subscriptionStart: '',
      subscriptionEnd: '',
    }],
    subscriptionActive: false,
    attachment: null,
  });
  
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type if needed
      setFormData({ ...formData, attachment: file });
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchClientsAndProducts();
    }
  }, [isOpen]);
  
  const fetchClientsAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch clients
      const clientsResponse = await api.get('/clients');
      setClients(clientsResponse.data || []);
      
      // Fetch products
      const productsResponse = await api.get('/products');
      setProducts(productsResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching clients and products:', error);
      alert('Failed to load clients and products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    
    // Validate that client ID is valid
    const clientId = parseInt(formData.clientId);
    if (isNaN(clientId) || clientId <= 0) {
      alert('Please select a valid client');
      return;
    }
    
    // Validate products - at least one product must be selected
    if (formData.products.length === 0 || formData.products.every(product => !product.productId)) {
      alert('Please add at least one product');
      return;
    }
    
    // Validate each product
    for (const product of formData.products) {
      const productId = parseInt(product.productId);
      if (isNaN(productId) || productId <= 0) {
        alert('Please select a valid product for each entry');
        return;
      }
      
      if (!product.subscriptionStart || !product.subscriptionEnd) {
        alert('Please fill in subscription start and end dates for all products');
        return;
      }
      
      if (new Date(product.subscriptionStart) >= new Date(product.subscriptionEnd)) {
        alert('Subscription end date must be after subscription start date for all products');
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API submission
      const orderData = {
        status: formData.status,
        clientId: clientId,
        products: formData.products.map(product => ({
          productId: parseInt(product.productId),
          quantity: product.quantity,
          subscriptionStart: product.subscriptionStart,
          subscriptionEnd: product.subscriptionEnd,
        })),
        subscriptionActive: formData.subscriptionActive,
        total_amount: 0, // Backend will calculate this
        attachment: formData.attachment, // Include attachment file
      };
      
      await onCreate(orderData);
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-4">
          {/* Header */}
          <div className="modal-header border-0">
            <div>
              <h5 className="modal-title fw-bold">
                Create New Purchase Order
              </h5>
              <small className="text-muted">
                Enter purchase order information below
              </small>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Basic Information */}
            <h6 className="fw-bold mb-3">Basic Information</h6>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">PO Number</label>
                <input
                  type="text"
                  className="form-control"
                  value="Auto-generated"
                  readOnly
                  placeholder="Will be auto-generated"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label">Client</label>
                <select 
                  className="form-select"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company || client.name} ({client.contact || client.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products & Subscriptions */}
            <h6 className="fw-bold mb-3">Products & Subscriptions</h6>
            
            {formData.products.map((product, index) => (
              <div key={product.id} className="row g-3 mb-3 p-3 border rounded">
                <div className="col-md-6">
                  <label className="form-label">Product {index + 1}</label>
                  <select 
                    className="form-select"
                    value={product.productId}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], productId: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  >
                    <option value="">Select product</option>
                    {products.map((productOption) => (
                      <option key={productOption.id} value={productOption.id}>
                        {productOption.product_name || productOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={product.quantity} 
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], quantity: parseInt(e.target.value) || 1 };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subscription Start</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={product.subscriptionStart}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], subscriptionStart: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subscription End</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={product.subscriptionEnd}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], subscriptionEnd: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>
                
                {formData.products.length > 1 && (
                  <div className="col-md-12 mt-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        const updatedProducts = formData.products.filter((_, i) => i !== index);
                        setFormData({ ...formData, products: updatedProducts });
                      }}
                    >
                      Remove Product
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Product Button */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  const newProduct: ProductItem = {
                    id: Date.now().toString(),
                    productId: '',
                    quantity: 1,
                    subscriptionStart: '',
                    subscriptionEnd: '',
                  };
                  setFormData({
                    ...formData,
                    products: [...formData.products, newProduct]
                  });
                }}
              >
                + Add Product
              </button>
            </div>
            
            {/* Subscription Active */}
            <div className="d-flex align-items-center gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="active"
                  checked={formData.subscriptionActive}
                  onChange={(e) => setFormData({...formData, subscriptionActive: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="active">
                  Subscription Active
                </label>
              </div>
            </div>
            
            {/* Attachment Section */}
            <div className="mt-4">
              <label className="form-label fw-bold">Attachment</label>
              <div className="d-flex align-items-center gap-2">
                <input 
                  type="file" 
                  className="form-control" 
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                {formData.attachment && (
                  <div className="text-success">
                    <small>{formData.attachment.name}</small>
                  </div>
                )}
              </div>
              <div className="form-text">
                Upload supporting documents (images, PDFs, DOC, XLS)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button className="btn btn-light" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark px-4" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;