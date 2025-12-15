import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Switch } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const [isCourier, setIsCourier] = useState(false); // Mock role switch
    const [isOnline, setIsOnline] = useState(false);

    const toggleOnline = () => {
        setIsOnline(!isOnline);
        if (!isOnline) {
            Alert.alert('You are now Online', 'Waiting for orders...');
        } else {
            Alert.alert('You are now Offline');
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
                    title={isCourier ? "Your Location" : "You are here"}
                    pinColor={isCourier ? "orange" : "red"}
                />
            </MapView>

            <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
                {/* Header Role Switch (Dev only) */}
                <View className="bg-white/90 mx-4 mt-2 p-3 rounded-xl shadow-lg flex-row justify-between items-center">
                    <Text className="font-bold text-gray-700">Mode: {isCourier ? 'Courier' : 'Customer'}</Text>
                    <Switch value={isCourier} onValueChange={setIsCourier} />
                </View>

                {isCourier ? (
                    // Courier UI
                    <View style={styles.bottomContainer}>
                        <View className="bg-white p-6 rounded-t-3xl shadow-xl items-center">
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
                        </View>
                    </View>
                ) : (
                    // Customer UI
                    <View style={styles.bottomContainer}>
                        <View className="bg-white p-6 rounded-t-3xl shadow-xl">
                            <Text className="text-lg font-bold text-slate-800 mb-4">Where to?</Text>
                            <View className="bg-slate-100 p-4 rounded-xl mb-4">
                                <Text className="text-slate-500">Search destination...</Text>
                            </View>
                            <TouchableOpacity className="bg-slate-900 py-3 rounded-xl items-center">
                                <Text className="text-white font-bold">Request Ride / Delivery</Text>
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
