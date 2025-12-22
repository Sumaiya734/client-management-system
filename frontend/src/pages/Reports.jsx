import React from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analytics and insights for your client management</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">$124,500</div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Growth</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">248</div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+8.2%</span>
            <span className="text-gray-500 ml-1">new clients</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">32</div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500">18 completed this month</span>
          </div>
        </div>
      </div>

      {/* Placeholder for charts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
}
