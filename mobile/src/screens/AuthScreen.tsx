import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

const AuthScreen = ({ navigation }: any) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'customer' | 'courier' | 'merchant'>('customer');
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');

    const handleAuth = async () => {
        if (!phone || !password || (!isLogin && !fullName)) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        if (!isLogin && role === 'merchant' && (!businessName || !address)) {
            Alert.alert('Error', 'Please fill in business details');
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isLogin) {
                response = await authApi.login({ phone, password });
            } else if (role === 'merchant') {
                response = await authApi.registerMerchant({
                    phone,
                    email: `${phone}@lewa.com`, // Mock email for now if not provided
                    fullName,
                    password,
                    businessName,
                    address
                });
            } else {
                response = await authApi.register({
                    phone,
                    password,
                    fullName,
                    role
                });
            }

            Alert.alert('Success', `Welcome ${isLogin ? '' : 'to Lewa'}!`);

            // For merchants registering, they might not get a token immediately or they need verification
            if (!isLogin && role === 'merchant') {
                Alert.alert('Success', 'Registered! Please wait for admin verification.');
                setIsLogin(true);
                setRole('customer');
                return;
            }

            const userData = response.data.user || response.data;
            const token = response.data.token;
            const hasProfile = response.data.hasCourierProfile;

            if (token) {
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
            }

            if (userData.role === 'courier' && !hasProfile) {
                navigation.replace('CourierSetup', { user: userData });
            } else {
                navigation.replace('Home', { user: userData });
            }

        } catch (error: any) {
            console.error('Auth Error:', error);
            const message = error.response?.data?.error || error.message || 'Authentication failed';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View>
                <Text className="text-3xl font-bold text-slate-800 mb-2">Lewa</Text>
                <Text className="text-slate-500 mb-8">{isLogin ? 'Welcome back! Login to continue.' : 'Create an account to get started.'}</Text>

                {!isLogin && (
                    <>
                        <TextInput
                            placeholder="Full Name"
                            className="w-full bg-slate-100 p-4 rounded-xl mb-4 text-slate-800"
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <View className="mb-4">
                            <Text className="text-slate-600 mb-2">Sign up as:</Text>
                            <View className="flex-row">
                                <TouchableOpacity
                                    onPress={() => setRole('customer')}
                                    className={`flex-1 px-4 py-3 rounded-l-lg border border-slate-200 ${role === 'customer' ? 'bg-orange-100 border-orange-500' : 'bg-white'}`}
                                >
                                    <Text className={`text-center ${role === 'customer' ? 'text-orange-700 font-bold' : 'text-slate-500'}`}>Customer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setRole('courier')}
                                    className={`flex-1 px-4 py-3 border-y border-slate-200 ${role === 'courier' ? 'bg-orange-100 border-orange-500' : 'bg-white'}`}
                                >
                                    <Text className={`text-center ${role === 'courier' ? 'text-orange-700 font-bold' : 'text-slate-500'}`}>Courier</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setRole('merchant')}
                                    className={`flex-1 px-4 py-3 rounded-r-lg border border-slate-200 ${role === 'merchant' ? 'bg-orange-100 border-orange-500' : 'bg-white'}`}
                                >
                                    <Text className={`text-center ${role === 'merchant' ? 'text-orange-700 font-bold' : 'text-slate-500'}`}>Merchant</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {role === 'merchant' && (
                            <>
                                <TextInput
                                    placeholder="Business Name"
                                    className="w-full bg-slate-100 p-4 rounded-xl mb-4 text-slate-800"
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                />
                                <TextInput
                                    placeholder="Business Address"
                                    multiline
                                    className="w-full bg-slate-100 p-4 rounded-xl mb-4 text-slate-800 h-24"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </>
                        )}
                    </>
                )}

                <TextInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    className="w-full bg-slate-100 p-4 rounded-xl mb-4 text-slate-800"
                    value={phone}
                    onChangeText={setPhone}
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    className="w-full bg-slate-100 p-4 rounded-xl mb-6 text-slate-800"
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    className="w-full bg-orange-600 p-4 rounded-xl items-center"
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">{isLogin ? 'Login' : 'Sign Up'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-6 items-center"
                    onPress={() => setIsLogin(!isLogin)}
                >
                    <Text className="text-slate-500">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default AuthScreen;
