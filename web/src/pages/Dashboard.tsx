import React from 'react';

const Dashboard = () => {
    return (
        <div>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Orders', value: '1,240', color: 'bg-blue-500' },
                    { label: 'Active Couriers', value: '18', color: 'bg-emerald-500' },
                    { label: 'Pending Deliveries', value: '5', color: 'bg-amber-500' },
                    { label: 'Total Revenue', value: 'GHS 45,200', color: 'bg-purple-500' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                        <div className={`w-12 h-12 rounded-lg ${kpi.color} text-white flex items-center justify-center mr-4 shadow-lg opacity-90`}>
                            {/* Icon placeholder */}
                            <div className="font-bold text-xl">#</div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Orders</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#ORD-202{i}</td>
                                    <td className="px-6 py-4">John Doe</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Delivered</span>
                                    </td>
                                    <td className="px-6 py-4">GHS 25.00</td>
                                    <td className="px-6 py-4">Dec {10 + i}, 2024</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
