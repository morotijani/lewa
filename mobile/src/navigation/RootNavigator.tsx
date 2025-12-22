import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CourierSetupScreen from '../screens/CourierSetupScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const userData = await AsyncStorage.getItem('userData');

                if (userToken && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={user ? "Home" : "Auth"}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    initialParams={user ? { user: user } : undefined}
                />
                <Stack.Screen name="CourierSetup" component={CourierSetupScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
