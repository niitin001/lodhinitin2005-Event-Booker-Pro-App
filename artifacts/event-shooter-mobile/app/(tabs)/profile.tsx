import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { PrimaryButton, Screen } from '@/components/AppPrimitives';

export default function ProfileScreen() {
  const colors = useColors();
  const { user, signOut, isLoading } = useAuth();
  if (!user && !isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.guest}><View style={[styles.guestMark, { backgroundColor: colors.accent }]}><Feather name="user" size={26} color={colors.accentForeground} /></View><Text style={[styles.title, { color: colors.foreground }]}>Your EventShooter</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>Keep bookings, event details and your photography plans in one calm place.</Text><PrimaryButton label="Sign in" onPress={() => router.push('/auth/login')} icon="log-in-outline" /></View>
      </Screen>
    );
  }
  return (
    <Screen>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>ACCOUNT</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Your profile</Text>
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={[styles.avatarText, { color: colors.accentForeground }]}>{user?.name?.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.profileCopy}><Text style={[styles.name, { color: colors.primaryForeground }]}>{user?.name}</Text><Text style={[styles.email, { color: colors.primaryForeground }]}>{user?.email}</Text><View style={styles.verified}><Ionicons name="checkmark-circle" size={13} color={colors.accent} /><Text style={[styles.verifiedText, { color: colors.primaryForeground }]}>{user?.isVerified ? 'Verified customer' : 'Customer account'}</Text></View></View>
      </View>
      <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MenuRow icon="calendar" label="My bookings" onPress={() => router.push('/(tabs)/bookings')} />
        <MenuRow icon="compass" label="Explore artists" onPress={() => router.push('/(tabs)')} />
        <MenuRow icon="help-circle" label="Help & support" onPress={() => undefined} last />
      </View>
      <PrimaryButton label="Sign out" onPress={() => void signOut()} variant="outline" icon="log-out-outline" />
    </Screen>
  );
}

function MenuRow({ icon, label, onPress, last }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; last?: boolean }) {
  const colors = useColors();
  return <Pressable testID={`menu-${label.toLowerCase().replace(/\s+/g, '-')}`} onPress={onPress} style={[styles.menuRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Feather name={icon} size={18} color={colors.accent} /><Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.6, marginTop: 7 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 31, letterSpacing: -0.6, marginTop: 3 },
  profileCard: { borderRadius: 20, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 },
  avatar: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28 },
  profileCopy: { flex: 1, gap: 4 },
  name: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21 },
  email: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, opacity: 0.72 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  verifiedText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, opacity: 0.78 },
  menu: { borderRadius: 17, borderWidth: 1, overflow: 'hidden' },
  menuRow: { minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  guest: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 13, paddingHorizontal: 20 },
  guestMark: { width: 65, height: 65, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 310, marginBottom: 8 },
});