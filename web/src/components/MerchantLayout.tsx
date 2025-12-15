import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, Settings, LogOut } from 'lucide-react';

const MerchantLayout = () => {
    const location = useLocation();

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
                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500">
                                <Settings className="h-6 w-6" />
                            </button>
                            <div className="ml-3 relative">
                                <span className="text-sm font-medium text-gray-500">Pizza Hut - Accra</span>
                            </div>
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
