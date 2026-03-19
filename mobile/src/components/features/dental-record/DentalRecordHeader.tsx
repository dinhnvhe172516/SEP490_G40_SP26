import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';

export function DentalRecordHeader() {
    return (
        <View style={styles.header}>
            <View>
                <ThemedText style={styles.label}>Phòng khám</ThemedText>
                <ThemedText style={styles.title}>Hồ sơ nha khoa</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 4,
    },
    label: {
        fontSize: 13,
        color: '#3b82f6',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1e3a8a',
        letterSpacing: -0.5,
        paddingTop: 10,
    },
});
