import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MerchantLayout = () => {
    const location = useLocation();
    const { logout, user, merchant } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="font-bold text-xl text-orange-600">Lewa Partner</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/merchant"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/merchant'
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/merchant/menu"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/merchant/menu'
                                        ? 'border-orange-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                                    Menu
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-4 text-right">
                                <div className="text-sm font-bold text-gray-900">{user?.name}</div>
                                <div className="text-xs text-orange-600">{merchant?.status}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};


export default MerchantLayout;
