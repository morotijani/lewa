import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const MenuManager = () => {
    const menuItems = [
        { id: 1, name: 'Jollof Rice with Chicken', price: '45.00', category: 'Main', available: true },
        { id: 2, name: 'Fried Rice with Beef', price: '50.00', category: 'Main', available: true },
        { id: 3, name: 'Coleslaw Side', price: '15.00', category: 'Sides', available: true },
        { id: 4, name: 'Coca Cola 500ml', price: '10.00', category: 'Drinks', available: false },
    ];

    return (
        <div>
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Menu Items</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your restaurant's offerings and availability.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price (GHS)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {menuItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.category}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.price}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.available ? 'Available' : 'Sold Out'}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 size={16} /></button>
                                                <button className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuManager;
