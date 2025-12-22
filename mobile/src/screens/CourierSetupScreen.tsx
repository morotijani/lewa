import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courierApi } from '../services/api';

const CourierSetupScreen = ({ navigation, route }: any) => {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);

    // Default to 'motorcycle' for simplicity, could be a dropdown later
    const [vehicleType, setVehicleType] = useState('motorcycle');
    const [licensePlate, setLicensePlate] = useState('');

    const handleSubmit = async () => {
        if (!licensePlate) {
            Alert.alert('Error', 'Please enter your License Plate number');
            return;
        }

        setLoading(true);
        try {
            await courierApi.createProfile({
                userId: user.id,
                vehicleType,
                licensePlate
            });
            Alert.alert('Success', 'Profile Setup Complete!');
            navigation.replace('Home', { user });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <Text className="text-2xl font-bold text-slate-800 mb-2">Courier Setup</Text>
            <Text className="text-slate-500 mb-8">Tell us about your vehicle to start receiving orders.</Text>

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
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Complete Setup</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CourierSetupScreen;
