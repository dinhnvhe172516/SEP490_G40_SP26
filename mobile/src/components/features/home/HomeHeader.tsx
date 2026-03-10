import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

export function HomeHeader() {
    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.greeting}>Xin chào,</ThemedText>
                <ThemedText type="title" style={styles.userName}>Nguyễn Văn A.</ThemedText>
            </View>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={styles.notificationBadge} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    greeting: {
        fontSize: 16,
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E5E7EB',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
});
