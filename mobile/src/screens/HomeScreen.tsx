import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Switch } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { courierApi, orderApi } from '../services/api';
import SocketService from '../services/socket';

const HomeScreen = ({ route, navigation }: any) => {
    const user = route.params?.user || {};
    const [isCourier, setIsCourier] = useState(user.role === 'courier');
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [courierLocation, setCourierLocation] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    // Initial Location Permission & Get Location
    React.useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
        })();
    }, []);

    // Courier: Emit Live Location
    React.useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            if (isCourier && isOnline && user.id) {
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 1 // Update heavily for testing
                    },
                    (loc) => {
                        console.log('Emitting location:', loc.coords);
                        SocketService.emit('updateLocation', {
                            courierId: user.id,
                            lat: loc.coords.latitude,
                            lng: loc.coords.longitude
                        });
                        setUserLocation(loc); // Keep local state updated too
                    }
                );
            }
        };

        startTracking();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [isCourier, isOnline, user.id]);

    // Customer: Listen for Courier Location
    React.useEffect(() => {
        if (!isCourier && activeOrder) {
            const handleLocationUpdate = (data: any) => {
                console.log('Courier moved:', data);
                setCourierLocation({
                    latitude: data.lat,
                    longitude: data.lng,
                });
            };

            SocketService.on('courierLocationUpdate', handleLocationUpdate);

            return () => {
                SocketService.off('courierLocationUpdate', handleLocationUpdate);
            };
        }
    }, [!isCourier, activeOrder]);

    // Socket Connection
    const [socketConnected, setSocketConnected] = useState(false);

    React.useEffect(() => {
        if (user.id) {
            SocketService.connect(user.id);

            // Listen for connection changes
            const onConnect = () => {
                console.log('Socket Connected');
                setSocketConnected(true);
            };
            const onDisconnect = () => {
                console.log('Socket Disconnected');
                setSocketConnected(false);
            };

            // We need access to the socket instance to listen to standard events
            // Ideally SocketService exposes an onConnect/onDisconnect, or we listen to the socket directly
            // Current SocketService wrapper hides the socket but exposes .on() which proxies to socket.on()
            // So we can listen to 'connect' and 'disconnect' directly through the wrapper!
            SocketService.on('connect', onConnect);
            SocketService.on('disconnect', onDisconnect);

            return () => {
                SocketService.off('connect', onConnect);
                SocketService.off('disconnect', onDisconnect);
                SocketService.disconnect();
            };
        }
    }, [user.id]);

    // Courier: Listen for New Orders
    React.useEffect(() => {
        if (isCourier) {
            const handleNewOrder = (data: any) => {
                // Prevent duplicate alerts if already viewing this order
                if (activeOrder && activeOrder.id === data.order.id) {
                    return;
                }

                Alert.alert(
                    'New Order!',
                    `Pickup: ${data.order.pickup_address}\nDropoff: ${data.order.dropoff_address}\nTotal: GHS ${data.order.total_amount_ghs}`,
                    [
                        {
                            text: 'Decline',
                            style: 'cancel',
                            onPress: () => handleDeclineOrder(data.order.id)
                        },
                        {
                            text: 'Accept',
                            onPress: () => {
                                setActiveOrder({ ...data.order, status: 'confirmed' }); // Optimistic
                                handleAcceptOrder(data.order.id);
                            }
                        }
                    ]
                );
            };

            SocketService.on('newOrder', handleNewOrder);

            return () => {
                SocketService.off('newOrder', handleNewOrder);
            };
        }
    }, [isCourier, activeOrder]);

    const handleDeclineOrder = async (orderId: string) => {
        try {
            await orderApi.decline(orderId, user.id);
            setActiveOrder(null);
            Alert.alert('Declined', 'You have declined this order.');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to decline order');
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await orderApi.updateStatus(orderId, 'confirmed', user.id);
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
            // Use real location or current userLocation state
            let currentLoc = userLocation;
            if (!currentLoc) {
                try {
                    currentLoc = await Location.getCurrentPositionAsync({});
                    setUserLocation(currentLoc);
                } catch (e) {
                    console.log('Error getting location for online toggle:', e);
                }
            }

            const lat = currentLoc?.coords.latitude || 5.6508;
            const lng = currentLoc?.coords.longitude || -0.1870;

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

    // Customer: Listen for Status Updates
    React.useEffect(() => {
        if (!isCourier && activeOrder) {
            const handleStatusUpdate = (data: any) => {
                if (data.orderId === activeOrder.id) {
                    setActiveOrder(data.order);
                    if (data.status === 'delivered') {
                        Alert.alert('Order Delivered', 'Your order has arrived!');
                        setActiveOrder(null);
                    }
                }
            };

            SocketService.on('orderStatusUpdated', handleStatusUpdate);

            return () => {
                SocketService.off('orderStatusUpdated', handleStatusUpdate);
            };
        }
    }, [!isCourier, activeOrder]);

    const handleCreateOrder = async () => {
        if (!pickupAddress || !dropoffAddress) {
            Alert.alert('Error', 'Please enter pickup and dropoff');
            return;
        }

        setLoading(true);
        try {
            // Use Real Location if available, else fallback to Legon
            const pickupLat = userLocation?.coords.latitude || 5.6508;
            const pickupLng = userLocation?.coords.longitude || -0.1870;

            const orderData = {
                customerId: user.id,
                pickup: {
                    lat: pickupLat,
                    lng: pickupLng,
                    address: pickupAddress, // In real app, reverse geocode here
                    phone: user.phone_number
                },
                dropoff: {
                    lat: 5.6231, // Still hardcoded dropoff for demo until we add Place Picker
                    lng: -0.1764,
                    address: dropoffAddress,
                    phone: '0500000000'
                },
                vehicleType: 'motorcycle',
                pricingDetails: { base: 10, distance: 5 },
                totalAmount: 15.00,
                paymentMethod: 'cash',
                notes: 'Order from mobile (GPS)'
            };

            const response = await orderApi.create(orderData);
            Alert.alert('Success', `Order Created! ID: ${response.data.id}`);
            setActiveOrder(response.data);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to create order: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Map Reference
    const mapRef = React.useRef<MapView>(null);

    // Animate to user location when found
    React.useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.01, // Zoom in closer
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [userLocation]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 5.6037, // Default fallback
                    longitude: -0.1870,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >

                {/* Show Courier Marker if assigned */}
                {(activeOrder?.status === 'assigned' || activeOrder?.status === 'accepted' || activeOrder?.status === 'confirmed' || activeOrder?.status === 'picked_up') && (
                    <Marker
                        coordinate={courierLocation || {
                            latitude: 5.6508,
                            longitude: -0.1870
                        }}
                        title="Courier"
                        pinColor="orange"
                    >
                        <View style={{ backgroundColor: 'white', padding: 5, borderRadius: 10 }}>
                            <Text>🚴</Text>
                        </View>
                    </Marker>
                )}
            </MapView>

            <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
                <View className="bg-white/90 mx-4 mt-2 p-3 rounded-xl shadow-lg flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="font-bold text-gray-700">Mode: {isCourier ? 'Courier' : 'Customer'}</Text>
                    </View>
                    {isCourier && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CourierProfile', { user })}
                            className="bg-slate-200 px-3 py-1 rounded-full"
                        >
                            <Text className="text-xs font-bold text-slate-700">Profile</Text>
                        </TouchableOpacity>
                    )}
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

                                    {activeOrder.status === 'assigned' || activeOrder.status === 'accepted' || activeOrder.status === 'confirmed' ? (
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
                            {activeOrder ? (
                                <View className="w-full">
                                    <Text className="text-xl font-bold mb-2 text-slate-800 text-center">
                                        {activeOrder.status === 'created' ? 'Finding Courier...' :
                                            activeOrder.status === 'assigned' ? 'Courier Assigned!' :
                                                (activeOrder.status === 'accepted' || activeOrder.status === 'confirmed') ? 'Courier is coming' :
                                                    activeOrder.status === 'picked_up' ? 'Heading to destination' :
                                                        activeOrder.status}
                                    </Text>

                                    <View className="bg-slate-100 p-4 rounded-xl mb-4">
                                        <Text className="font-semibold text-center mb-2">ETA: 10 mins</Text>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500">Total</Text>
                                            <Text className="font-bold">GHS {activeOrder.total_amount_ghs}</Text>
                                        </View>
                                    </View>

                                    {/* Cancel Button if needed */}
                                </View>
                            ) : (
                                <>
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
                                </>
                            )}
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
