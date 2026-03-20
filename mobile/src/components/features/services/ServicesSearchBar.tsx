import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/src/components/ui/themed-text';

type Props = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
};

export function ServicesSearchBar({ searchQuery, setSearchQuery }: Props) {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Image
                    source={require('@/assets/images/search.png')}
                    style={styles.searchIcon}
                    contentFit="contain"
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm dịch vụ nha khoa..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ThemedText style={styles.clearSearchIcon}>✕</ThemedText>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
    },
    searchIcon: {
        width: 20,
        height: 20,
        tintColor: '#60a5fa',
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e3a8a',
        height: '100%',
    },
    clearSearchIcon: {
        fontSize: 16,
        color: '#60a5fa',
        fontWeight: '600',
        paddingLeft: 12,
    },
});
