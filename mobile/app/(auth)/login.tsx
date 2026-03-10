import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { ThemedText } from '@/src/components/ui/themed-text';
import { useLogin } from '@/src/hooks/useAuth';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        if (!identifier || !password) {
            setErrorMsg('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg('');

            // Call real login API using mutation instead of useQuery directly
            const responseData = await loginMutation.mutateAsync({ identifier, password });

            // Extract tokens (adjust fields based on your backend response structure)
            const resData = responseData?.data as any;
            const accessToken = resData?.token;
            const refreshToken = resData?.refreshToken;

            if (accessToken) {
                await SecureStore.setItemAsync('access_token', accessToken);
                if (refreshToken) {
                    await SecureStore.setItemAsync('refresh_token', refreshToken);
                }

                // Invalidate profile query to refetch authenticated data
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });

                router.replace('/');
            } else {
                setErrorMsg('Không nhận được token từ máy chủ. Vui lòng thử lại.');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 40) + 40, paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <Link href="/" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Image
                            source={require('@/assets/images/back.png')}
                            style={styles.backButtonIcon}
                            contentFit="contain"
                        />
                        <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
                    </TouchableOpacity>
                </Link>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Đăng nhập</ThemedText>
                    <ThemedText style={styles.subtitle}>Vui lòng nhập thông tin để quản lý sức khỏe răng miệng của bạn.</ThemedText>
                    {errorMsg ? <ThemedText style={styles.errorText}>{errorMsg}</ThemedText> : null}
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>TÀI KHOẢN</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Email hoặc tên đăng nhập"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={identifier}
                            onChangeText={setIdentifier}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>MẬT KHẨU</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <ThemedText style={styles.forgotPasswordText}>Quên mật khẩu?</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Action Section */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <ThemedText style={styles.registerPrompt}>Chưa có tài khoản? </ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={styles.registerLink}>Đăng ký ngay</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    backButtonIcon: {
        width: 24,
        height: 24,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        color: '#111827',
        marginBottom: 12,
        paddingTop: 10,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '500',
    },
    formContainer: {
        gap: 24,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#4B5563',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#111827',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    actionContainer: {
        gap: 24,
    },
    loginButton: {
        backgroundColor: '#111827',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    loginButtonDisabled: {
        backgroundColor: '#4B5563',
        opacity: 0.8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerPrompt: {
        fontSize: 15,
        color: '#6B7280',
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    }
});
