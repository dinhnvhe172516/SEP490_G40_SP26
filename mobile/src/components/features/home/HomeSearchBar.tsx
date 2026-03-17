import { StyleSheet, TextInput, View } from 'react-native';

export function HomeSearchBar() {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Tìm kiếm bác sĩ, dịch vụ..."
                placeholderTextColor="#9CA3AF"
            />
            <View style={styles.searchButton}>
                <View style={styles.searchTextWrapper}>
                    <TextInput editable={false} style={styles.searchText}>Tìm kiếm</TextInput>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e3a8a',
    },
    searchButton: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchTextWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});
