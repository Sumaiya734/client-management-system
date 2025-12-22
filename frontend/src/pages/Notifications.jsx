import React from 'react';

const Notifications = () => {
  const notifications = [
    { type: 'Renewal Reminder', recipient: 'john@acmecorp.com', client: 'Acme Corp', subject: 'Subscription Renewal Due', method: 'Email', status: 'Sent', sentAt: '2025-01-15 10:30' },
    { type: 'Payment Reminder', recipient: 'sarah@techsolutions.com', client: 'Tech Solutions Inc', subject: 'Payment Overdue', method: 'Email', status: 'Sent', sentAt: '2025-01-18 09:15' },
    { type: 'Renewal Reminder', recipient: '+1-234-567-8902', client: 'Global Dynamics', subject: 'Renewal Due Soon', method: 'SMS', status: 'Scheduled', sentAt: '2025-01-25 08:00' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Notifications & Alerts</h1>
      <p className="text-gray-600 mb-6">Manage notifications, templates, and automated alerts</p>

      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2">Send Renewal Reminders</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg mr-2">Payment Reminders</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg">Bulk Notifications</button>
        </div>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">View History</button>
      </div>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search notifications..."
          className="border rounded-lg p-2 mr-2 flex-1"
        />
        <select className="border rounded-lg p-2">
          <option>All Types</option>
          <option>Renewal Reminder</option>
          <option>Payment Reminder</option>
        </select>
      </div>

      <h3 className="text-lg font-medium mb-2">Notification History ({notifications.length})</h3>
      <p className="text-gray-600 mb-4">Track all sent and scheduled notifications</p>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Recipient</th>
            <th className="py-2 px-4 border-b">Client</th>
            <th className="py-2 px-4 border-b">Subject</th>
            <th className="py-2 px-4 border-b">Method</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Sent At</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{notification.type}</td>
              <td className="py-2 px-4 border-b">{notification.recipient}</td>
              <td className="py-2 px-4 border-b">{notification.client}</td>
              <td className="py-2 px-4 border-b">{notification.subject}</td>
              <td className="py-2 px-4 border-b">{notification.method}</td>
              <td className="py-2 px-4 border-b">
                <span className={`inline-block px-2 py-1 text-white rounded-lg ${notification.status === 'Sent' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {notification.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{notification.sentAt}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Notifications;
