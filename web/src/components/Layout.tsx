import { useState } from 'react';

import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Map, Users, Settings, Menu, X, Store } from 'lucide-react';


const Layout = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Merchants', path: '/merchants', icon: <Store size={20} /> },
        { name: 'Live Map', path: '/map', icon: <Map size={20} /> },
        { name: 'Orders', path: '/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Couriers', path: '/couriers', icon: <Users size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-slate-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between">
                    {isOpen && <h1 className="text-xl font-bold text-emerald-400">Lewa Admin</h1>}
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-800 rounded">
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 hover:bg-slate-800 transition-colors ${location.pathname === item.path ? 'bg-slate-800 border-r-4 border-emerald-500' : ''
                                }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {isOpen && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    {isOpen && <div className="text-xs text-slate-500">v1.0.0</div>}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        A
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
