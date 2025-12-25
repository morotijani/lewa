import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { merchantApi } from '../../services/api';

import { useAuth } from '../../context/AuthContext';
import { LayoutGrid, Loader2, RefreshCcw } from 'lucide-react';

const MerchantDashboard = () => {
    const { merchant, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);

    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    const toggleStoreStatus = async () => {
        if (!merchant?.id) return;
        try {
            const newStatus = !isStoreOpen;
            await merchantApi.updateMerchant(merchant.id, { is_open: newStatus });
            setIsStoreOpen(newStatus);
        } catch (err) {
            alert('Failed to update store status');
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await merchantApi.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update order status');
        }
    };

    const fetchOrders = async () => {
        if (!merchant?.id) {
            setLoading(false);
            return;
        }
        try {
            const res = await merchantApi.getOrders(merchant.id);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantProfile = async () => {
        if (!merchant?.id) return;
        try {
            const profileRes = await api.get(`/merchant/${merchant.id}`);
            if (profileRes.data) {
                setIsStoreOpen(profileRes.data.is_open);
                // Update session memory if it was missing something
                const updatedMerchant = {
                    id: profileRes.data.id,
                    status: profileRes.data.status,
                    business_name: profileRes.data.business_name
                };
                localStorage.setItem('merchant', JSON.stringify(updatedMerchant));
            }
        } catch (err) {
            console.error('Failed to fetch merchant profile', err);
        }
    };



    useEffect(() => {
        fetchMerchantProfile();
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [merchant?.id]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!merchant?.id && (
                <div className="bg-orange-600 p-6 rounded-3xl shadow-xl shadow-orange-200 border border-orange-500 animate-pulse">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-2xl mr-4">
                            <RefreshCcw className="h-6 w-6 text-white animate-spin" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-black text-lg">Incomplete Merchant Profile</h3>
                            <p className="text-orange-100 text-sm">
                                We're having trouble linking your account to your shop. This usually happens after an update.
                            </p>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black shadow-sm hover:bg-orange-50 active:scale-95 transition-all"
                        >
                            Re-Sync Now
                        </button>
                    </div>
                </div>
            )}


            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">

                <div>
                    <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Manage your incoming orders</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right mr-2">
                        <div className={`text-sm font-bold ${isStoreOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Store is {isStoreOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {merchant?.id?.slice(0, 8) || 'NONE'}</div>
                    </div>

                    <button
                        onClick={toggleStoreStatus}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isStoreOpen ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isStoreOpen ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                        title="Refresh Orders"
                    >
                        <RefreshCcw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                        <LayoutGrid className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Orders Yet</h3>
                    <p className="text-slate-500">When customers order from you, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white overflow-hidden shadow-sm rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="px-5 py-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Order #{order.id.slice(0, 8)}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'created' ? 'bg-orange-100 text-orange-600' :
                                        ['accepted', 'confirmed'].includes(order.status) ? 'bg-blue-100 text-blue-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</div>
                                    <div className="border-l-2 border-orange-100 pl-3 py-1 bg-orange-50/30 rounded-r-lg">
                                        {order.items && Array.isArray(order.items) ? (
                                            order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="text-sm flex justify-between text-slate-700 py-0.5">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span className="text-slate-500 text-xs">GHS {item.price}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-slate-400 italic">No specific items listed</div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer & Notes</div>
                                        <div className="text-sm font-medium text-slate-700">{order.customer_name}</div>
                                        {order.notes && (
                                            <div className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                "{order.notes}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <div className="text-lg font-black text-slate-900">GHS {order.total_amount_ghs}</div>
                                    <div className="flex space-x-2">
                                        {order.status === 'created' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'accepted')}
                                                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        )}
                                        {['accepted', 'confirmed', 'assigned'].includes(order.status) && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'ready_for_pickup')}
                                                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors"
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
            )}
        </div>
    );
};

export default MerchantDashboard;
