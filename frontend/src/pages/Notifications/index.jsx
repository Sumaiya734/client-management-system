import React, { useState } from 'react';
import { Bell, Mail, MessageCircle, Clock, ArrowRight, Settings, Send, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import CreateTemplateModal from '../../components/notifications/CreateTemplateModal';
import SendNotificationModal from '../../components/notifications/SendNotificationModal';
import { Switch } from '../../components/ui/Switch';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('Notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);

  const tabs = ['Notifications', 'Templates', 'Automation', 'Settings'];

  const actionCards = [
    {
      title: 'Send Renewal Reminders',
      description: 'Notify clients due for renewal',
      icon: Bell,
      color: 'text-gray-600',
    },
    {
      title: 'Payment Reminders',
      description: 'Alert overdue payments',
      icon: Mail,
      color: 'text-orange-500',
    },
    {
      title: 'Bulk Notifications',
      description: 'Send to multiple clients',
      icon: MessageCircle,
      color: 'text-green-500',
    },
    {
      title: 'View History',
      description: 'Check sent notifications',
      icon: Clock,
      color: 'text-purple-500',
      hasArrow: true,
    },
  ];

  const notifications = [
    { 
      type: 'Renewal Reminder', 
      recipient: 'john@acmecorp.com', 
      client: 'Acme Corp', 
      subject: 'Subscription Renewal Due', 
      method: 'Email', 
      status: 'Sent', 
      sentAt: '2025-01-15 10:30' 
    },
    { 
      type: 'Payment Reminder', 
      recipient: 'sarah@techsolutions.com', 
      client: 'Tech Solutions Inc', 
      subject: 'Payment Overdue', 
      method: 'Email', 
      status: 'Sent', 
      sentAt: '2025-01-18 09:15' 
    },
    { 
      type: 'Renewal Reminder', 
      recipient: '+1-234-567-8902', 
      client: 'Global Dynamics', 
      subject: 'Renewal Due Soon', 
      method: 'SMS', 
      status: 'Scheduled', 
      sentAt: '2025-01-25 08:00' 
    },
  ];

  const typeOptions = [
    { value: 'All Types', label: 'All Types' },
    { value: 'Renewal Reminder', label: 'Renewal Reminder' },
    { value: 'Payment Reminder', label: 'Payment Reminder' },
  ];

  const getStatusBadgeVariant = (status) => {
    return status === 'Sent' ? 'active' : 'inactive';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Manage notifications, templates, and automated alerts"
        actions={
          <>
            <Button 
              variant="outline" 
              icon={<Settings className="h-4 w-4" />}
              onClick={() => setIsCreateTemplateModalOpen(true)}
            >
              Templates
            </Button>
            <Button 
              variant="primary" 
              icon={<Send className="h-4 w-4" />}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setIsSendNotificationModalOpen(true)}
            >
              Send Notification
            </Button>
          </>
        }
      />

      {/* Tab Navigation */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications Tab Content */}
      {activeTab === 'Notifications' && (
        <>
          {/* Notification Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actionCards.map((card) => (
              <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gray-50 rounded-lg ${card.color}`}>
                      {card.hasArrow ? (
                        <div className="relative">
                          <card.icon className="h-5 w-5" />
                          <ArrowRight className={`h-3 w-3 absolute -top-1 -right-1 ${card.color}`} />
                        </div>
                      ) : (
                        <card.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{card.title}</h3>
                      <p className="text-xs text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm min-w-[140px]"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notification History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notification History ({notifications.length})</CardTitle>
              <CardDescription>Track all sent and scheduled notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification, index) => (
                    <TableRow key={index}>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell>{notification.recipient}</TableCell>
                      <TableCell className="font-medium">{notification.client}</TableCell>
                      <TableCell>{notification.subject}</TableCell>
                      <TableCell>{notification.method}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(notification.status)}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{notification.sentAt}</TableCell>
                      <TableCell>
                        <button
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Templates Tab Content */}
      {activeTab === 'Templates' && (
        <div className="space-y-6">
          {/* Message Templates Header */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Message Templates</h2>
            <p className="text-sm text-gray-600">Create and manage reusable notification templates</p>
          </div>

          {/* Template Cards */}
          <div className="space-y-4">
            {/* Subscription Renewal Reminder Template */}
            <Card>
              <CardContent className="p-5 relative">
                <button
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="pr-8">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Renewal Reminder
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">CLIENT_NAME</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">PRODUCT_NAME</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">EXPIRY_DATE</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">RENEWAL_LINK</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Subject:</p>
                    <p className="text-sm text-gray-900">Subscription Renewal Due {`{CLIENT_NAME}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      Dear {`{CLIENT_NAME}`}, Your {`{PRODUCT_NAME}`} subscription expires on [EXPIRY_DATE]. Please renew to continue enjoying our services. Click here to renew: [RENEWAL_LINK]{'\\\\\\\\n'}Best regards,{'\\\\\\\\n'}The Team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Overdue Notice Template */}
            <Card>
              <CardContent className="p-5 relative">
                <button
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="pr-8">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Payment Reminder
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">CLIENT_NAME</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">AMOUNT</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">PRODUCT_NAME</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">DAYS_OVERDUE</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Subject:</p>
                    <p className="text-sm text-gray-900">Payment Overdue {`{CLIENT_NAME}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      Dear {`{CLIENT_NAME}`}, Payment of {`{AMOUNT}`} for {`{PRODUCT_NAME}`} is now {`{DAYS_OVERDUE}`} days overdue. Please process payment immediately to avoid service interruption.{'\\\\\\\\n'}Best regards,{'\\\\\\\\n'}The Team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welcome New Client Template */}
            <Card>
              <CardContent className="p-5 relative">
                <button
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="pr-8">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                      Welcome
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">CLIENT_NAME</span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">PRODUCT_NAME</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Subject:</p>
                    <p className="text-sm text-gray-900">Welcome to our service {`{CLIENT_NAME}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      Dear {`{CLIENT_NAME}`}, Welcome to our service! Your {`{PRODUCT_NAME}`} subscription is now active. If you have any questions, please don't hesitate to contact us.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Automation Tab Content */}
      {activeTab === 'Automation' && (
        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>Configure automated notification rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Automated Notifications</h3>
                <p className="text-sm text-gray-600">Configure automatic notification triggers</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-md font-medium text-gray-800">Auto-send Renewal Reminders</h4>
                    <p className="text-sm text-gray-500">Automatically notify clients before subscription expires</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Renewal Reminder Schedule (days before expiry)</label>
                  <input
                    type="text"
                    placeholder="30, 7, 1"
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-md font-medium text-gray-800">Auto-send Payment Reminders</h4>
                    <p className="text-sm text-gray-500">Automatically notify clients about overdue payments</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Payment Reminder Schedule (days after due)</label>
                  <input
                    type="text"
                    placeholder="1, 5, 10"
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'Settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure notification methods and providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Email Notifications Section */}
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">Email Notifications</h4>
                <Switch
                  checked={true} // Set this based on your state management
                  onChange={() => {
                    // Handle toggle change for email notifications
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">Enable email notifications</p>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="SMTP Server"
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="SMTP Port"
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* SMS Notifications Section */}
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">SMS Notifications</h4>
                <Switch
                  checked={true} // Set this based on your state management
                  onChange={() => {
                    // Handle toggle change for SMS notifications
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">Enable SMS notifications</p>
              <div className="flex flex-col space-y-2">
                <select
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900"
                >
                  <option value="Twilio">Twilio</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onRequestClose={() => setIsCreateTemplateModalOpen(false)}
        onSave={(data) => {
          // Handle save template logic here
          console.log('Saving template:', data);
          // You can add API call or state update here
        }}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendNotificationModalOpen}
        onRequestClose={() => setIsSendNotificationModalOpen(false)}
        onSend={(data) => {
          // Handle send notification logic here
          console.log('Sending notification:', data);
          // You can add API call or state update here
        }}
      />
    </div>
  );
};

export default Notifications;
