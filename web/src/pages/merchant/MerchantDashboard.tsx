import React, { useEffect, useState } from 'react';
import { merchantApi } from '../../services/api';

const DEMO_MERCHANT_ID = 'd187e383-7dad-44d3-8b7f-30bc221977d4';

const MerchantDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await merchantApi.updateOrderStatus(orderId, newStatus);
            // Optimistic update or refetch
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update order status');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await merchantApi.getOrders(DEMO_MERCHANT_ID);
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Incoming Orders
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Store Open
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'created' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}`
                                }>
                                    {order.status}
                                </span>
                            </div>
                            <div className="space-y-2 mb-4">
                                {/* Items logic placehoder */}
                                <div className="text-sm text-gray-700">Customer: {order.customer_name}</div>
                                <div className="text-sm text-gray-500 italic">{order.notes || 'No notes'}</div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <span className="font-bold text-gray-900">GHS {order.total_amount_ghs}</span>
                                <div className="space-x-2">
                                    {order.status === 'created' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'accepted')}
                                            className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                                        >
                                            Accept
                                        </button>
                                    )}
                                    {['accepted', 'confirmed', 'assigned'].includes(order.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'ready_for_pickup')}
                                            className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MerchantDashboard;
