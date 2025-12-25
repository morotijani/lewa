import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, Loader2, Package, Check, X } from 'lucide-react';
import { merchantApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MenuManager = () => {
    const { merchant } = useAuth();
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main', description: '' });

    const fetchMenu = async () => {
        if (!merchant?.id) {
            setLoading(false);
            return;
        }
        try {
            const res = await merchantApi.getMenu(merchant.id);
            setMenuItems(res.data);
        } catch (err) {
            console.error('Failed to fetch menu', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMenu();
    }, [merchant?.id]);

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price || !merchant?.id) return;
        try {
            if (editingId) {
                await merchantApi.updateMenuItem(editingId, {
                    name: newItem.name,
                    price: parseFloat(newItem.price),
                    category: newItem.category,
                    description: newItem.description
                });
            } else {
                await merchantApi.addMenuItem(merchant.id, newItem);
            }
            setNewItem({ name: '', price: '', category: 'Main', description: '' });
            setShowAddForm(false);
            setEditingId(null);
            fetchMenu();
        } catch (err) {
            console.error(err);
            alert('Failed to save item');
        }
    };

    const startEdit = (item: any) => {
        setNewItem({
            name: item.name,
            price: item.price.toString(),
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
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await merchantApi.deleteMenuItem(itemId);
            fetchMenu();
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Menu Items</h1>
                    <p className="text-slate-500">Manage your restaurant offerings</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingId(null);
                        setNewItem({ name: '', price: '', category: 'Main', description: '' });
                    }}
                    className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold transition-all active:scale-[0.98] ${showAddForm ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white'
                        }`}
                >
                    {showAddForm ? (
                        <>
                            <X className="mr-2 h-5 w-5" /> Cancel
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-5 w-5" /> Add New Item
                        </>
                    )}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? 'Edit Item' : 'Create New Menu Item'}</h2>
                    <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Item Name</label>
                            <input
                                required
                                placeholder="e.g. Jollof Rice with Chicken"
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Price (GHS)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                                value={newItem.price}
                                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Category</label>
                            <select
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50 appearance-none"
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            >
                                <option>Main</option>
                                <option>Sides</option>
                                <option>Drinks</option>
                                <option>Dessert</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <input
                                placeholder="Brief description of the dish"
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all active:scale-[0.98] shadow-lg shadow-orange-200"
                            >
                                {editingId ? 'Update Item' : 'Save Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {menuItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                    No menu items found. Click 'Add New Item' to begin.
                                </td>
                            </tr>
                        ) : (
                            menuItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-orange-100 rounded-xl flex items-center justify-center">
                                                <Utensils className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.description || 'No description'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg italic">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                        GHS {item.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold transition-colors ${item.is_available
                                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                                }`}
                                        >
                                            {item.is_available ? <Check className="w-3 h-3 mr-1" /> : <Package className="w-3 h-3 mr-1" />}
                                            {item.is_available ? 'Available' : 'Sold Out'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Item"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuManager;
