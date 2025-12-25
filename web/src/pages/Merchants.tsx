import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { CheckCircle, XCircle, Clock, Store } from 'lucide-react';

const Merchants = () => {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchants = async () => {
        try {
            const res = await adminApi.getMerchants();
            setMerchants(res.data);
        } catch (err) {
            console.error('Failed to fetch merchants', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const handleVerify = async (id: string, status: string) => {
        try {
            await adminApi.verifyMerchant(id, status);
            // Optimistic update
            setMerchants(merchants.map(m => m.id === id ? { ...m, status } : m));
        } catch (err) {
            console.error('Failed to update merchant status', err);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-8">Loading merchants...</div>;

    return (
        <div className="p-6">
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Merchant Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View and verify all registered merchants. Only 'active' merchants will be visible to users.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {merchants.map((merchant) => (
                    <div key={merchant.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Store className="h-6 w-6 text-orange-600" />
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${merchant.status === 'active' ? 'bg-green-100 text-green-800' :
                                        merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {merchant.status.toUpperCase()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{merchant.business_name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{merchant.address_text || 'No address provided'}</p>

                            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400 uppercase text-[10px] tracking-wider">Owner</span>
                                    <span>{merchant.owner_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400 uppercase text-[10px] tracking-wider">Email</span>
                                    <span className="truncate ml-4">{merchant.owner_email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400 uppercase text-[10px] tracking-wider">Phone</span>
                                    <span>{merchant.phone_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                            {merchant.status !== 'active' && (
                                <button
                                    onClick={() => handleVerify(merchant.id, 'active')}
                                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </button>
                            )}
                            {merchant.status !== 'rejected' && (
                                <button
                                    onClick={() => handleVerify(merchant.id, 'rejected')}
                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {merchants.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Store className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No merchants found</h3>
                        <p className="mt-1 text-sm text-gray-500">New merchant registrations will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Merchants;
