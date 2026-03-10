import { StyleSheet, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

import { HomeHeader } from '@/src/components/features/home/HomeHeader';
import { HomeSearchBar } from '@/src/components/features/home/HomeSearchBar';
import { PromoBanner } from '@/src/components/features/home/PromoBanner';
import { DentalServices } from '@/src/components/features/home/DentalServices';
import { UpcomingAppointmentCard } from '@/src/components/features/home/UpcomingAppointmentCard';

export function HomeScreenWrapper() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaProvider style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 100 }
                ]}
            >
                <HomeHeader />

                <View style={styles.sectionSpacer}>
                    <HomeSearchBar />
                </View>

                <View style={styles.sectionSpacer}>
                    <PromoBanner />
                </View>

                <View style={styles.sectionSpacer}>
                    <DentalServices />
                </View>

                <View style={styles.sectionSpacer}>
                    <UpcomingAppointmentCard />
                </View>

            </ScrollView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    sectionSpacer: {
        marginTop: 32,
    },
});
