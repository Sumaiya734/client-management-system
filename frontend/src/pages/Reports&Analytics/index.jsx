import React from 'react';

const ReportsAnalytics = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Reports & Analytics</h1>
      <p className="text-gray-600 mb-6">Business insights and performance analytics</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium">Total Revenue</h2>
          <p className="text-2xl font-bold">$114,000 <span className="text-gray-500">(+18% from last period)</span></p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium">Total Clients</h2>
          <p className="text-2xl font-bold">52 <span className="text-gray-500">(+12% from last period)</span></p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium">Active Subscriptions</h2>
          <p className="text-2xl font-bold">95 <span className="text-gray-500">(+8% from last period)</span></p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium">Avg Revenue/Client</h2>
          <p className="text-2xl font-bold">$2,192 <span className="text-gray-500">(+5% from last period)</span></p>
        </div>
      </div>

      <h3 className="text-lg font-medium mb-4">Report Filters</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select className="border rounded-lg p-2 w-full">
            <option>Revenue Report</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select className="border rounded-lg p-2 w-full">
            <option>All Currencies</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input type="date" className="border rounded-lg p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input type="date" className="border rounded-lg p-2 w-full" />
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Generate Report</button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Export Data</button>
      </div>

      <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
      <div className="h-64 bg-gray-100 rounded-lg">
        {/* Placeholder for the chart */}
        <p className="text-center pt-20 text-gray-500">Chart will be rendered here</p>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
