import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { merchantApi } from '../../services/api';

// For demo purposes, we use a fixed ID. 
// In a real app, this comes from auth context.
const DEMO_MERCHANT_ID = 'd187e383-7dad-44d3-8b7f-30bc221977d4';

const MenuManager = () => {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple Add/Edit Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main', description: '' });

    const fetchMenu = async () => {
        // ... existing fetch ...
        try {
            console.log('Fetching menu for:', DEMO_MERCHANT_ID);
            const res = await merchantApi.getMenu(DEMO_MERCHANT_ID);
            setMenuItems(res.data);
        } catch (err) {
            console.error('Failed to fetch menu', err);
        } finally {
            setLoading(false);
        }
    };

    // ... useEffect ...

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleSaveItem = async () => {
        if (!newItem.name || !newItem.price) return;
        try {
            if (editingId) {
                // Update
                await merchantApi.updateMenuItem(editingId, {
                    name: newItem.name,
                    price: parseFloat(newItem.price),
                    category: newItem.category,
                    description: newItem.description
                });
            } else {
                // Create
                await merchantApi.addMenuItem(DEMO_MERCHANT_ID, newItem);
            }
            setNewItem({ name: '', price: '', category: 'Main', description: '' });
            setShowAddForm(false);
            setEditingId(null);
            fetchMenu();
        } catch (err) {
            console.error(err);
        }
    };

    const startEdit = (item: any) => {
        setNewItem({
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description || ''
        });
        setEditingId(item.id);
        setShowAddForm(true);
    };

    const toggleAvailability = async (item: any) => {
        try {
            await merchantApi.updateMenuItem(item.id, { isAvailable: !item.is_available });
            fetchMenu();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await merchantApi.deleteMenuItem(itemId);
            fetchMenu();
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    return (
        <div>
            {/* ... Header ... */}
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Menu Items (Demo)</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your restaurant's offerings and availability.</p>
                </div>
                {/* ... Add Button ... */}
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setEditingId(null);
                            setNewItem({ name: '', price: '', category: 'Main', description: '' });
                        }}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add Item'}
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input
                            placeholder="Name"
                            className="p-2 border rounded"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <input
                            placeholder="Price"
                            type="number"
                            className="p-2 border rounded"
                            value={newItem.price}
                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        />
                        <select
                            className="p-2 border rounded"
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option>Main</option>
                            <option>Sides</option>
                            <option>Drinks</option>
                        </select>
                        <button onClick={handleSaveItem} className="bg-green-600 text-white rounded font-bold">
                            {editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

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
                                                <button
                                                    onClick={() => toggleAvailability(item)}
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {item.is_available ? 'Available' : 'Sold Out'}
                                                </button>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => startEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
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
