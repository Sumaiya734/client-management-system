import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';

const ClientReportsTab = ({ loading, clientData }) => {
  return (
    <Card>
      {loading.client ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading client data...</p>
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Client-wise Subscription Report</CardTitle>
            <CardDescription>Detailed breakdown by client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Subscriptions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Active Subscriptions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{client.totalSubscriptions || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{client.activeSubscriptions || 0}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">${client.totalRevenue?.toLocaleString() || '0'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{client.lastPayment || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default ClientReportsTab;