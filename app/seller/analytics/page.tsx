"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Package, Users, ShoppingCart, Calendar, Download } from "lucide-react";

export default function SellerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  const stats = [
    {
      title: "Total Revenue",
      value: "$24,580",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Total Orders",
      value: "1,247",
      change: "+8.2%",
      changeType: "positive",
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Products Sold",
      value: "3,842",
      change: "+15.3%",
      changeType: "positive",
      icon: Package,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Active Customers",
      value: "892",
      change: "+5.7%",
      changeType: "positive",
      icon: Users,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 245, revenue: "$12,250" },
    { name: "Smart Watch", sales: 189, revenue: "$9,450" },
    { name: "Laptop Stand", sales: 156, revenue: "$4,680" },
    { name: "USB-C Hub", sales: 134, revenue: "$2,680" },
    { name: "Phone Case", sales: 98, revenue: "$1,470" }
  ];

  const recentOrders = [
    { date: "2024-01-15", orders: 45, revenue: "$2,340" },
    { date: "2024-01-14", orders: 38, revenue: "$1,890" },
    { date: "2024-01-13", orders: 52, revenue: "$2,780" },
    { date: "2024-01-12", orders: 41, revenue: "$2,150" },
    { date: "2024-01-11", orders: 36, revenue: "$1,920" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-4 w-4" />
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Revenue chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Orders chart coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sold</p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.date}</p>
                    <p className="text-sm text-gray-500">{order.orders} orders</p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">{order.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
