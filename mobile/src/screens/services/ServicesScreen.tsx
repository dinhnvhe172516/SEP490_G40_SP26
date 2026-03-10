import { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useServicesData } from '@/src/hooks/useHomeData';

import { ServicesHeader } from '@/src/components/features/services/ServicesHeader';
import { ServicesSearchBar } from '@/src/components/features/services/ServicesSearchBar';
import { ServiceList } from '@/src/components/features/services/ServiceList';

export function ServicesScreen() {
    const insets = useSafeAreaInsets();
    const { data: rawData, isLoading, isError } = useServicesData();
    const [searchQuery, setSearchQuery] = useState('');

    // Backend may wrap list inside data or metadata
    const services = Array.isArray(rawData) ? rawData : (rawData?.data || []);

    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return services;
        const lowerQuery = searchQuery.toLowerCase();
        return services.filter((s: any) => s.service_name.toLowerCase().includes(lowerQuery));
    }, [services, searchQuery]);

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <ServicesHeader />

            <ServicesSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <ServiceList
                data={filteredServices}
                isLoading={isLoading}
                isError={isError}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
