import { StyleSheet, View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useProfileData } from '@/src/hooks/useHomeData';

import { ProfileHeader } from '@/src/components/features/profile/ProfileHeader';
import { ProfileHero } from '@/src/components/features/profile/ProfileHero';
import { ProfileInfoCard } from '@/src/components/features/profile/ProfileInfoCard';
import { ProfileLogoutButton } from '@/src/components/features/profile/ProfileLogoutButton';

const GENDER_MAP: Record<string, string> = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};

export function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { data: profileData, isLoading } = useProfileData();

    const profile = profileData?.data || {};
    const account = profile?.account_id || {};

    const fullName = profile?.full_name || 'Chưa cập nhật';
    const email = account?.email || profile?.email || 'Chưa cập nhật';
    const phone = account?.phone_number || profile?.phone || 'Chưa cập nhật';
    const avatarUrl = profile?.avatar_url;
    const gender = GENDER_MAP[profile?.gender] || 'Chưa cập nhật';
    const address = profile?.address || 'Chưa cập nhật';

    let dobDisplay = 'Chưa cập nhật';
    try {
        if (profile?.dob) {
            const d = typeof profile.dob === 'string' ? parseISO(profile.dob) : new Date(profile.dob);
            dobDisplay = format(d, 'dd/MM/yyyy', { locale: vi });
        }
    } catch (_e) { }

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.skeletonHeader} />
                <View style={styles.skeletonBody} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <ProfileHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            >
                <ProfileHero fullName={fullName} email={email} avatarUrl={avatarUrl} />

                <ProfileInfoCard
                    title="Thông tin cá nhân"
                    items={[
                        { label: 'Họ và tên', value: fullName },
                        { label: 'Giới tính', value: gender },
                        { label: 'Ngày sinh', value: dobDisplay },
                        { label: 'Địa chỉ', value: address },
                    ]}
                />

                <ProfileInfoCard
                    title="Thông tin liên hệ"
                    items={[
                        { label: 'Số điện thoại', value: phone },
                        { label: 'Email', value: email },
                    ]}
                />

                <ProfileLogoutButton />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    skeletonHeader: {
        height: 72,
        backgroundColor: '#F3F4F6',
    },
    skeletonBody: {
        flex: 1,
        margin: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
});
