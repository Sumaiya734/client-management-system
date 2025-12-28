import React, { useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const CreateTemplateModal = ({ isOpen, onRequestClose, onSave }) => {
  const [formData, setFormData] = useState({
    templateName: '',
    type: 'General',
    subject: '',
    message: '',
  });

  const availableVariables = [
    'CLIENT_NAME',
    'PRODUCT_NAME',
    'AMOUNT',
    'EXPIRY_DATE',
    'RENEWAL_LINK',
    'DAYS_OVERDUE',
  ];

  const typeOptions = [
    { value: 'General', label: 'General' },
    { value: 'Renewal Reminder', label: 'Renewal Reminder' },
    { value: 'Payment Reminder', label: 'Payment Reminder' },
    { value: 'Welcome', label: 'Welcome' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(formData);
    }
    // Reset form
    setFormData({
      templateName: '',
      type: 'General',
      subject: '',
      message: '',
    });
    onRequestClose();
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      templateName: '',
      type: 'General',
      subject: '',
      message: '',
    });
    onRequestClose();
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '0',
      maxWidth: '600px',
      width: '90%',
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Create Template"
      ariaHideApp={false}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create Template</h2>
            <p className="text-sm text-gray-600">Create a reusable notification template</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Template Name
            </label>
            <input
              type="text"
              value={formData.templateName}
              onChange={(e) => handleChange('templateName', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="Template name"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject
            </label>
            <textarea
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Subject template (use {VARIABLE} for dynamic content)"
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Message template (use {VARIABLE} for dynamic content)"
              rows={5}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          {/* Available Variables */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Available variables:</p>
            <div className="flex flex-wrap gap-1">
              {availableVariables.map((variable) => (
                <span
                  key={variable}
                  className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {`{${variable}}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="px-4"
          >
            Save Template
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTemplateModal;


