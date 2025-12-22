import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';

const AuthScreen = ({ navigation }: any) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isCourierRole, setIsCourierRole] = useState(false); // New state for role selection
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleAuth = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isLogin) {
                response = await authApi.login({ phone, password });
            } else {
                response = await authApi.register({
                    phone,
                    password,
                    fullName,
                    role: isCourierRole ? 'courier' : 'customer'
                });
            }

            Alert.alert('Success', `Welcome ${isLogin ? '' : 'to Lewa'}!`);

            const userData = response.data.user || response.data;
            const hasProfile = response.data.hasCourierProfile;

            // Logic: If Courier AND No Profile -> Go to Setup
            // Otherwise -> Home
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

                        <View className="flex-row items-center mb-4">
                            <Text className="text-slate-600 mr-2">Sign up as:</Text>
                            <TouchableOpacity
                                onPress={() => setIsCourierRole(false)}
                                className={`px-4 py-2 rounded-l-lg border border-slate-200 ${!isCourierRole ? 'bg-orange-100 border-orange-500' : 'bg-white'}`}
                            >
                                <Text className={!isCourierRole ? 'text-orange-700 font-bold' : 'text-slate-500'}>Customer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsCourierRole(true)}
                                className={`px-4 py-2 rounded-r-lg border border-slate-200 ${isCourierRole ? 'bg-orange-100 border-orange-500' : 'bg-white'}`}
                            >
                                <Text className={isCourierRole ? 'text-orange-700 font-bold' : 'text-slate-500'}>Courier</Text>
                            </TouchableOpacity>
                        </View>
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
