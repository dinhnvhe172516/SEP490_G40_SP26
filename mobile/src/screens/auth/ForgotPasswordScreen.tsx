import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useForgotPassword, useResetPassword } from '@/src/hooks/useAuth';
import { AuthHeader } from '@/src/components/features/auth/AuthHeader';
import { ThemedText } from '@/src/components/ui/themed-text';
import { requestOtpSchema, resetPasswordSchema } from '@/src/schemas/auth.schema';
import { errorMapper } from '@/src/utils/errorMapper';

export function ForgotPasswordScreen() {
    const insets = useSafeAreaInsets();
    const forgotMutation = useForgotPassword();
    const resetMutation = useResetPassword();

    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1
    const [email, setEmail] = useState('');
    
    // Step 2
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [localError, setLocalError] = useState<string | null>(null);

    const handleRequestOTP = async () => {
        setLocalError(null);
        
        // 1. Client-side Validation
        const validation = requestOtpSchema.safeParse({ email });
        if (!validation.success) {
            setLocalError(validation.error.issues[0].message);
            return;
        }

        try {
            // 2. Trigger Mutation
            await forgotMutation.mutateAsync(email);
            setStep(2);
        } catch (err: any) {
            console.error('Forgot password screen error:', err);
        }
    };
    
    const handleResetPassword = async () => {
        setLocalError(null);
        
        // 1. Client-side Validation
        const validation = resetPasswordSchema.safeParse({ email, otp, newPassword });
        if (!validation.success) {
            setLocalError(validation.error.issues[0].message);
            return;
        }

        try {
            // 2. Trigger Mutation
            await resetMutation.mutateAsync({ email, otp, newPassword });
            
            // 3. Navigation side effect
            router.replace('/(auth)/login');
        } catch (err: any) {
            console.error('Reset password screen error:', err);
        }
    }

    // Derive active mutation and error
    const activeMutation = step === 1 ? forgotMutation : resetMutation;
    const errorMsg = localError || (activeMutation.error ? errorMapper(activeMutation.error).message : '');

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
                <AuthHeader 
                    title="Quên mật khẩu" 
                    subtitle={
                        step === 1 
                        ? "Nhập email của bạn để nhận mã xác nhận đổi mật khẩu."
                        : "Vui lòng kiểm tra email để lấy mã OTP và tạo mật khẩu mới."
                    } 
                    errorMsg={errorMsg} 
                />

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>EMAIL</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập địa chỉ email"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            editable={!activeMutation.isPending && step === 1}
                        />
                    </View>

                    {step === 2 && (
                        <>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>MÃ XÁC NHẬN (OTP)</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã OTP"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={otp}
                                    onChangeText={setOtp}
                                    editable={!activeMutation.isPending}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>MẬT KHẨU MỚI</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="8+ ký tự (Chữ hoa, số, đặc biệt)"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={true}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    editable={!activeMutation.isPending}
                                />
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, activeMutation.isPending && styles.loginButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={step === 1 ? handleRequestOTP : handleResetPassword}
                        disabled={activeMutation.isPending}
                    >
                        {activeMutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <ThemedText style={styles.loginButtonText}>
                                {step === 1 ? "Nhận mã OTP" : "Đổi mật khẩu"}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.registerLink}>Quay lại đăng nhập</ThemedText>
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
        color: '#2563eb',
    },
    input: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1e3a8a',
    },
    actionContainer: {
        gap: 24,
    },
    loginButton: {
        backgroundColor: '#2563eb',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    loginButtonDisabled: {
        backgroundColor: '#2563eb',
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
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e3a8a',
    }
});
