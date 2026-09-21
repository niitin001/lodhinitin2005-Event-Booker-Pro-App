import { Ionicons } from '@expo/vector-icons';
import { useLogin } from '@workspace/api-client-react';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field, PrimaryButton } from '@/components/AppPrimitives';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const { signIn } = useAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    loginMutation.mutate({ data: { email: email.trim(), password } }, {
      onSuccess: async (data) => {
        await signIn(data.token, data.user);
        if (returnTo?.startsWith('/book/')) {
          router.replace({
            pathname: '/book/[id]',
            params: { id: returnTo.replace('/book/', '') },
          });
        } else {
          router.replace('/(tabs)/bookings');
        }
      },
      onError: () => setError('Those details did not work. Check your email and password and try again.'),
    });
  }

  const screenStyle = StyleSheet.flatten([styles.screen, { backgroundColor: colors.background }]);
  return (
    <View style={screenStyle}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}><Pressable testID="login-close" onPress={() => router.back()} hitSlop={10}><Ionicons name="close" size={24} color={colors.foreground} /></Pressable></View>
        <View style={styles.heading}><View style={[styles.logo, { backgroundColor: colors.accent }]}><Ionicons name="aperture-outline" size={25} color={colors.accentForeground} /></View><Text style={[styles.eyebrow, { color: colors.accent }]}>WELCOME BACK</Text><Text style={[styles.title, { color: colors.foreground }]}>Keep your story{"\n"}moving forward.</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to manage your EventShooter bookings.</Text></View>
        <View style={styles.form}><Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" /><Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" /><Pressable onPress={() => setError('Password reset is available on the web app for now.')}><Text style={[styles.forgot, { color: colors.accent }]}>Forgot password?</Text></Pressable></View>
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        <PrimaryButton label="Sign in" onPress={submit} loading={loginMutation.isPending} icon="arrow-forward" />
        <Text style={[styles.seedHint, { color: colors.mutedForeground }]}>Demo customer: priya@example.com · password123</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 15, paddingBottom: 35, gap: 20 },
  topRow: { height: 34, justifyContent: 'center' },
  heading: { gap: 10, paddingTop: 12 },
  logo: { width: 57, height: 57, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, lineHeight: 40, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 20, maxWidth: 280 },
  form: { gap: 15, marginTop: 6 },
  forgot: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, alignSelf: 'flex-end' },
  error: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, lineHeight: 17 },
  seedHint: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15, textAlign: 'center' },
});