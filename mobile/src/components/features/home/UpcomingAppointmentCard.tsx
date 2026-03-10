import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

export function UpcomingAppointmentCard() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Lịch hẹn sắp tới</ThemedText>
            </View>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                {/* Top: Doctor Info */}
                <View style={styles.doctorSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80' }}
                        style={styles.avatar}
                    />
                    <View style={styles.doctorInfo}>
                        <ThemedText style={styles.doctorName}>BS. Trần Văn Bình</ThemedText>
                        <ThemedText style={styles.specialty}>Chuyên khoa Chỉnh nha</ThemedText>
                    </View>
                    <View style={styles.statusBadge}>
                        <ThemedText style={styles.statusText}>Đã xác nhận</ThemedText>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Bottom: Date & Time */}
                <View style={styles.timeSection}>
                    <View style={styles.timeBlock}>
                        <ThemedText style={styles.timeLabel}>NGÀY</ThemedText>
                        <ThemedText style={styles.timeValue}>Thứ 2, 10 Thg 11</ThemedText>
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.timeBlock}>
                        <ThemedText style={styles.timeLabel}>GIỜ</ThemedText>
                        <ThemedText style={styles.timeValue}>09:00 - 10:00</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: '#111827',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
    },
    doctorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
    },
    doctorInfo: {
        flex: 1,
        marginLeft: 16,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeBlock: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 6,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    verticalDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
});
