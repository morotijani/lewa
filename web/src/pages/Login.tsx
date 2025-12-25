import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { authApi } from '../services/api';

import { LogIn, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login(formData);
            const { token, user } = res.data;
            let merchant = res.data.merchant;

            // FALLBACK: If merchant role but no merchant data returned
            if (user.role === 'merchant' && !merchant) {
                try {
                    // Try to fetch by user specific route
                    const profileRes = await api.get(`/merchant/user/${user.id}`);
                    if (profileRes.data) {
                        const found = profileRes.data;
                        merchant = { id: found.id, status: found.status, business_name: found.business_name };
                    }
                } catch (e) {
                    console.error('Login fallback fetch failed', e);
                }
            }


            login(token, user, merchant);

            if (user.role === 'admin') {
                navigate('/');
            } else if (user.role === 'merchant') {
                if (!merchant) {
                    alert('Login successful, but we could not find your shop profile. Please contact support.');
                }
                navigate('/merchant');
            } else {

                alert('This portal is for Admins and Merchants only.');
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-emerald-100 rounded-3xl mb-4">
                        <ShieldCheck className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lewa Portal</h1>
                    <p className="text-slate-500 mt-2">Manage your delivery business with ease.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
                                    placeholder="Enter your phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-5 w-5" />
                                    Sign In to Portal
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            New business? {' '}
                            <Link to="/register-merchant" className="text-emerald-600 font-bold hover:underline">
                                Register as Merchant
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
