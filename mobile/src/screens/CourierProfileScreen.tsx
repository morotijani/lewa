import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courierApi } from '../services/api';

const CourierProfileScreen = ({ navigation, route }: any) => {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [vehicleType, setVehicleType] = useState('motorcycle');
    const [licensePlate, setLicensePlate] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await courierApi.getProfile(user.id);
            if (res.data) {
                setVehicleType(res.data.vehicle_type);
                setLicensePlate(res.data.license_plate);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!licensePlate) {
            Alert.alert('Error', 'Please enter your License Plate number');
            return;
        }

        setLoading(true);
        try {
            // Optimistic update local for immediate feedback if we were using context, 
            // but here we just rely on API success
            await courierApi.updateProfile({
                userId: user.id,
                vehicleType,
                licensePlate
            });
            Alert.alert('Success', 'Profile Updated!');
            navigation.goBack();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Text className="text-2xl text-slate-800">←</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-slate-800">Edit Profile</Text>
            </View>

            <View className="bg-slate-50 p-4 rounded-xl mb-4">
                <Text className="text-xs text-gray-500 mb-1">Vehicle Type</Text>
                <View className="flex-row">
                    {['motorcycle', 'car'].map(type => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setVehicleType(type)}
                            className={`mr-3 px-4 py-2 rounded-full border ${vehicleType === type ? 'bg-orange-100 border-orange-500' : 'border-gray-200'}`}
                        >
                            <Text className={`capitalize ${vehicleType === type ? 'text-orange-700 font-bold' : 'text-gray-500'}`}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-slate-700 font-semibold mb-2">License Plate Number</Text>
                <TextInput
                    placeholder="e.g. GH-1234-24"
                    className="w-full bg-slate-100 p-4 rounded-xl text-slate-800 font-bold text-lg"
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    autoCapitalize="characters"
                />
            </View>

            <TouchableOpacity
                className="w-full bg-orange-600 p-4 rounded-xl items-center mt-auto"
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CourierProfileScreen;
