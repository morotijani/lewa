import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { merchantApi, orderApi } from '../services/api';
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuDetailsScreen = ({ route, navigation }: any) => {
    const { merchant } = route.params;
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [submitting, setSubmitting] = useState(false);

    const fetchMenu = async () => {
        try {
            const res = await merchantApi.getMenu(merchant.id);
            setMenu(res.data);
        } catch (err) {
            console.error('Failed to fetch menu', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const updateCart = (itemId: string, delta: number) => {
        const current = cart[itemId] || 0;
        const next = Math.max(0, current + delta);
        if (next === 0) {
            const { [itemId]: removed, ...rest } = cart;
            setCart(rest);
        } else {
            setCart({ ...cart, [itemId]: next });
        }
    };

    const cartTotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
        const item = menu.find(m => m.id === itemId);
        return sum + (item?.price || 0) * qty;
    }, 0);

    const handlePlaceOrder = async () => {
        if (Object.keys(cart).length === 0) return;

        setSubmitting(true);
        try {
            const userData = await AsyncStorage.getItem('userData');
            const user = JSON.parse(userData || '{}');

            const orderItems = Object.entries(cart).map(([itemId, qty]) => {
                const item = menu.find(m => m.id === itemId);
                return {
                    itemId,
                    name: item.name,
                    price: item.price,
                    quantity: qty
                };
            });

            const orderData = {
                customerId: user.id,
                merchantId: merchant.id,
                pickup: {
                    lat: merchant.location_lat || 5.6508,
                    lng: merchant.location_lng || -0.1870,
                    address: merchant.address_text,
                    phone: '0500000000' // Mock vendor phone
                },
                dropoff: {
                    lat: 5.6231,
                    lng: -0.1764,
                    address: 'User Delivery Address',
                    phone: user.phone_number
                },
                vehicleType: 'motorcycle',
                pricingDetails: { base: 10, distance: 5 },
                totalAmount: cartTotal + 15, // Total + Delivery Fee snapshot
                paymentMethod: 'cash',
                items: orderItems,
                notes: `Order from ${merchant.business_name}`
            };

            const response = await orderApi.create(orderData);
            Alert.alert('Success', 'Order placed successfully!');
            navigation.navigate('Home', { order: response.data });
        } catch (err: any) {
            console.error('Order failed', err);
            Alert.alert('Error', err.response?.data?.error || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const renderMenuItem = ({ item }: { item: any }) => (
        <View className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-slate-100 flex-row justify-between items-center">
            <View className="flex-1 pr-4">
                <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
                <Text className="text-slate-500 text-xs mb-1">{item.category}</Text>
                <Text className="text-slate-500 text-sm italic" numberOfLines={2}>{item.description}</Text>
                <Text className="text-orange-600 font-bold mt-2 text-lg">GHS {item.price}</Text>
            </View>

            <View className="flex-row items-center bg-slate-50 rounded-full p-1 border border-slate-100">
                <TouchableOpacity
                    onPress={() => updateCart(item.id, -1)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                >
                    <Minus color="#64748b" size={20} />
                </TouchableOpacity>
                <Text className="mx-4 font-bold text-slate-800 w-4 text-center">{cart[item.id] || 0}</Text>
                <TouchableOpacity
                    onPress={() => updateCart(item.id, 1)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-orange-600"
                >
                    <Plus color="white" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator color="#ea580c" size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 bg-white border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-800">{merchant.business_name}</Text>
                    <Text className="text-slate-500 text-xs">Menu Items</Text>
                </View>
            </View>

            <FlatList
                data={menu}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                contentContainerClassName="pt-4 pb-32"
                ListEmptyComponent={
                    <View className="mt-20 items-center">
                        <Text className="text-slate-400">No items available</Text>
                    </View>
                }
            />

            {Object.keys(cart).length > 0 && (
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-slate-500 text-xs uppercase font-bold tracking-wider">Subtotal</Text>
                            <Text className="text-2xl font-black text-slate-800">GHS {cartTotal.toFixed(2)}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-500 text-xs">Delivery: GHS 15.00</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={submitting}
                        className="bg-orange-600 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-orange-300"
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <ShoppingCart color="white" size={20} className="mr-2" />
                                <Text className="text-white font-black text-lg ml-2 uppercase">Checkout Items</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default MenuDetailsScreen;
