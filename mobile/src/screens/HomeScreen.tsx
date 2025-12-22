import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Switch } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { courierApi, orderApi } from '../services/api';
import SocketService from '../services/socket';

const HomeScreen = ({ route }: any) => {
    const user = route.params?.user || {};
    const [isCourier, setIsCourier] = useState(user.role === 'courier');
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeOrder, setActiveOrder] = useState<any>(null);

    // Socket Connection
    React.useEffect(() => {
        if (user.id) {
            SocketService.connect(user.id);
        }
        return () => SocketService.disconnect();
    }, [user.id]);

    // Courier: Listen for New Orders
    React.useEffect(() => {
        if (isCourier) {
            SocketService.on('newOrder', (data) => {
                Alert.alert(
                    'New Order!',
                    `Pickup: ${data.order.pickup_address}\nDropoff: ${data.order.dropoff_address}\nTotal: GHS ${data.order.total_amount_ghs}`,
                    [
                        { text: 'Decline', style: 'cancel' },
                        {
                            text: 'Accept',
                            onPress: () => {
                                setActiveOrder({ ...data.order, status: 'accepted' }); // Optimistic
                                handleAcceptOrder(data.order.id);
                            }
                        }
                    ]
                );
            });
        }
    }, [isCourier]);

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await orderApi.updateStatus(orderId, 'accepted', user.id);
            // activeOrder set in alert for speed, but good to refresh here if needed
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to accept order: ' + (error.response?.data?.error || error.message));
        }
    };

    const updateOrderStatus = async (status: string) => {
        if (!activeOrder) return;
        try {
            const updated = await orderApi.updateStatus(activeOrder.id, status, user.id);
            setActiveOrder(updated.data);
            if (status === 'delivered') {
                Alert.alert('Great Job!', 'Order Completed.');
                setActiveOrder(null);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    // Customer Form State
    const [pickupAddress, setPickupAddress] = useState('Legon Campus');
    const [dropoffAddress, setDropoffAddress] = useState('Accra Mall');

    const toggleOnline = async () => {
        try {
            const newStatus = !isOnline;
            const lat = 5.6508;
            const lng = -0.1870;

            if (isCourier) {
                await courierApi.updateStatus({
                    userId: user.id,
                    isOnline: newStatus,
                    lat,
                    lng
                });
            }

            setIsOnline(newStatus);
            Alert.alert(newStatus ? 'You are now Online' : 'You are now Offline');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to update status: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleCreateOrder = async () => {
        if (!pickupAddress || !dropoffAddress) {
            Alert.alert('Error', 'Please enter pickup and dropoff');
            return;
        }

        setLoading(true);
        try {
            // Mock coordinates and pricing for demo
            const orderData = {
                customerId: user.id,
                pickup: {
                    lat: 5.6508,
                    lng: -0.1870,
                    address: pickupAddress,
                    phone: user.phone_number
                },
                dropoff: {
                    lat: 5.6231, // Slightly different location
                    lng: -0.1764,
                    address: dropoffAddress,
                    phone: '0500000000'
                },
                vehicleType: 'motorcycle',
                pricingDetails: { base: 10, distance: 5 },
                totalAmount: 15.00,
                paymentMethod: 'cash', // Default to cash/cod for testing
                notes: 'Test order from mobile'
            };

            const response = await orderApi.create(orderData);
            Alert.alert('Success', `Order Created! ID: ${response.data.id}`);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to create order: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 5.6037,
                    longitude: -0.1870,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{ latitude: 5.6037, longitude: -0.1870 }}
                    title={isCourier ? "Your Location" : "Pickup Location"}
                    pinColor={isCourier ? "orange" : "blue"}
                />
            </MapView>

            <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
                <View className="bg-white/90 mx-4 mt-2 p-3 rounded-xl shadow-lg flex-row justify-between items-center">
                    <Text className="font-bold text-gray-700">Mode: {isCourier ? 'Courier' : 'Customer'}</Text>
                    {/* Role switching disabled in UI to rely on real Auth role */}
                </View>

                {isCourier ? (
                    <View style={styles.bottomContainer}>
                        <View className="bg-white p-6 rounded-t-3xl shadow-xl items-center">
                            {activeOrder ? (
                                <View className="w-full">
                                    <Text className="text-xl font-bold mb-4 text-slate-800 text-center">
                                        Active Order ({activeOrder.status})
                                    </Text>

                                    <View className="bg-slate-100 p-4 rounded-xl mb-2">
                                        <Text className="text-xs text-gray-500 mb-1">Pickup</Text>
                                        <Text className="font-semibold">{activeOrder.pickup_address}</Text>
                                    </View>

                                    <View className="bg-slate-100 p-4 rounded-xl mb-4">
                                        <Text className="text-xs text-gray-500 mb-1">Dropoff</Text>
                                        <Text className="font-semibold">{activeOrder.dropoff_address}</Text>
                                    </View>

                                    {activeOrder.status === 'assigned' || activeOrder.status === 'accepted' ? (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus('picked_up')}
                                            className="bg-blue-600 w-full py-4 rounded-xl items-center mb-2"
                                        >
                                            <Text className="text-white font-bold text-lg">Confirm Pickup</Text>
                                        </TouchableOpacity>
                                    ) : activeOrder.status === 'picked_up' ? (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus('delivered')}
                                            className="bg-green-600 w-full py-4 rounded-xl items-center mb-2"
                                        >
                                            <Text className="text-white font-bold text-lg">Confirm Delivery</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => setActiveOrder(null)}
                                            className="bg-gray-800 w-full py-4 rounded-xl items-center mb-2"
                                        >
                                            <Text className="text-white font-bold text-lg">Complete</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <>
                                    <Text className="text-xl font-bold mb-2 text-slate-800">
                                        {isOnline ? 'You are Online' : 'You are Offline'}
                                    </Text>
                                    <Text className="text-slate-500 mb-6">
                                        {isOnline ? 'Looking for nearby delivery requests...' : 'Go online to start receiving orders.'}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={toggleOnline}
                                        className={`w-full py-4 rounded-xl items-center ${isOnline ? 'bg-red-500' : 'bg-green-600'}`}
                                    >
                                        <Text className="text-white font-bold text-lg">
                                            {isOnline ? 'Go Offline' : 'Go Online'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.bottomContainer}>
                        <View className="bg-white p-6 rounded-t-3xl shadow-xl">
                            <Text className="text-lg font-bold text-slate-800 mb-4">Where to?</Text>

                            <View className="bg-slate-100 p-4 rounded-xl mb-2">
                                <Text className="text-xs text-gray-500 mb-1">Pickup</Text>
                                <Text className="font-semibold">{pickupAddress}</Text>
                            </View>

                            <View className="bg-slate-100 p-4 rounded-xl mb-4">
                                <Text className="text-xs text-gray-500 mb-1">Dropoff</Text>
                                <Text className="font-semibold">{dropoffAddress}</Text>
                            </View>

                            <TouchableOpacity
                                className="bg-slate-900 py-3 rounded-xl items-center"
                                onPress={handleCreateOrder}
                                disabled={loading}
                            >
                                <Text className="text-white font-bold">
                                    {loading ? 'Requesting...' : 'Request Ride / Delivery'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        justifyContent: 'flex-end',
    }
});

export default HomeScreen;
