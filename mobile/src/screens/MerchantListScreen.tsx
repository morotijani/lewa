import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { merchantApi } from '../services/api';
import { Store, Star, Clock, ChevronRight } from 'lucide-react-native';

const MerchantListScreen = ({ navigation }: any) => {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchants = async () => {
        try {
            const res = await merchantApi.getActive();
            setMerchants(res.data);
        } catch (err) {
            console.error('Failed to fetch merchants', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const renderMerchant = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100"
            onPress={() => navigation.navigate('MenuDetails', { merchant: item })}
        >
            <View className="flex-row p-4">
                <View className="bg-orange-100 p-3 rounded-xl mr-4">
                    <Store color="#ea580c" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-800">{item.business_name}</Text>
                    <Text className="text-slate-500 text-sm mb-2" numberOfLines={1}>{item.address_text}</Text>

                    <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center">
                            <Star color="#f59e0b" size={16} fill="#f59e0b" />
                            <Text className="text-slate-700 ml-1 font-medium">{item.rating || '5.0'}</Text>
                        </View>
                        <View className="flex-row items-center ml-3">
                            <Clock color="#64748b" size={16} />
                            <Text className="text-slate-500 ml-1 text-xs">{item.prep_time_minutes || 15} mins</Text>
                        </View>
                    </View>
                </View>
                <View className="justify-center">
                    <ChevronRight color="#cbd5e1" size={20} />
                </View>
            </View>
        </TouchableOpacity>
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
            <View className="p-4 border-b border-slate-200 bg-white">
                <Text className="text-2xl font-bold text-slate-800">Explore Restaurants</Text>
                <Text className="text-slate-500">Discover great food near you</Text>
            </View>

            <FlatList
                data={merchants}
                renderItem={renderMerchant}
                keyExtractor={(item) => item.id}
                contentContainerClassName="pt-4 pb-8"
                ListEmptyComponent={
                    <View className="mt-20 items-center">
                        <Store color="#cbd5e1" size={64} />
                        <Text className="text-slate-400 mt-4 text-lg">No active restaurants found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default MerchantListScreen;
