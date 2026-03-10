import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

const SERVICES = [
    { id: '1', name: 'Khám\nTổng Quát', color: '#F3F4F6' },
    { id: '2', name: 'Tẩy Trắng\nRăng', color: '#FDF2F8' },
    { id: '3', name: 'Chỉnh Nha\nNiềng Răng', color: '#EFF6FF' },
    { id: '4', name: 'Nhổ Răng\nKhôn', color: '#FEF2F2' },
];

export function DentalServices() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>Dịch vụ nha khoa</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {SERVICES.map((service) => (
                    <TouchableOpacity
                        key={service.id}
                        style={[styles.serviceCard, { backgroundColor: service.color }]}
                        activeOpacity={0.7}
                    >
                        <View style={styles.dot} />
                        <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: '#111827',
    },
    seeAllText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },
    scrollContent: {
        gap: 16,
    },
    serviceCard: {
        width: 140,
        height: 140,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#111827',
        opacity: 0.2,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
        color: '#111827',
    },
});
