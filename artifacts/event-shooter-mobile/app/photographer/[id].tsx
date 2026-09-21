import { Feather, Ionicons } from '@expo/vector-icons';
import { getGetPhotographerQueryKey, useGetPhotographer } from '@workspace/api-client-react';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ErrorState, LoadingState, PrimaryButton } from '@/components/AppPrimitives';

export default function PhotographerProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const photographerId = Number(id);
  const profile = useGetPhotographer(photographerId, { query: { enabled: Number.isFinite(photographerId), queryKey: getGetPhotographerQueryKey(photographerId) } });
  if (profile.isLoading) return <View style={[styles.stateScreen, { backgroundColor: colors.background }]}><LoadingState /></View>;
  if (profile.isError || !profile.data) return <View style={[styles.stateScreen, { backgroundColor: colors.background }]}><ErrorState onRetry={() => void profile.refetch()} /></View>;
  const data = profile.data;
  const screenStyle = StyleSheet.flatten([styles.screen, { backgroundColor: colors.background }]);
  return (
    <View style={screenStyle}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={styles.heroImage}>
          {data.coverImageUrl ? <Image source={{ uri: data.coverImageUrl }} contentFit="cover" style={styles.coverImage} /> : <View style={[styles.coverFallback, { backgroundColor: colors.secondary }]}><Feather name="camera" size={45} color={colors.accent} /></View>}
          <View style={[styles.heroShade, { backgroundColor: colors.primary }]} />
          <Pressable testID="profile-back" onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 12, backgroundColor: colors.card }]}><Ionicons name="arrow-back" size={20} color={colors.foreground} /></Pressable>
          <Pressable testID="profile-share" onPress={() => undefined} style={[styles.shareButton, { top: insets.top + 12, backgroundColor: colors.card }]}><Feather name="share-2" size={18} color={colors.foreground} /></Pressable>
          <View style={[styles.heroCopy, { paddingTop: insets.top + 92 }]}><View style={styles.verifiedLine}><Ionicons name="checkmark-circle" size={15} color={colors.accent} /><Text style={[styles.verified, { color: colors.primaryForeground }]}>VERIFIED ARTIST</Text></View><Text style={[styles.profileName, { color: colors.primaryForeground }]}>{data.displayName}</Text><Text style={[styles.profileMeta, { color: colors.primaryForeground }]}>{data.city} · {data.yearsOfExperience ?? 5}+ years experience</Text></View>
        </View>
        <View style={styles.body}>
          <View style={styles.statsRow}><ProfileStat value={data.rating.toFixed(1)} label="rating" icon="star" /><ProfileStat value={`${data.totalReviews}`} label="reviews" icon="message-circle" /><ProfileStat value={`${data.totalBookings ?? 0}`} label="bookings" icon="camera" /></View>
          {data.bio ? <Text style={[styles.bio, { color: colors.mutedForeground }]}>{data.bio}</Text> : null}
          <View style={styles.chips}>{(data.specializations ?? []).slice(0, 4).map((tag) => <View key={tag} style={[styles.chip, { backgroundColor: colors.secondary }]}><Text style={[styles.chipText, { color: colors.foreground }]}>{tag}</Text></View>)}</View>
          <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Portfolio</Text>{data.portfolio?.length ? <View style={styles.portfolioGrid}>{data.portfolio.slice(0, 6).map((item) => <View key={item.id} style={[styles.portfolioItem, { backgroundColor: colors.secondary }]}><Image source={{ uri: item.mediaUrl }} contentFit="cover" style={styles.portfolioImage} /><View style={[styles.portfolioLabel, { backgroundColor: colors.primary }]}><Text numberOfLines={1} style={[styles.portfolioTitle, { color: colors.primaryForeground }]}>{item.title || item.eventType || 'Featured work'}</Text></View></View>)}</View> : <View style={[styles.portfolioEmpty, { backgroundColor: colors.secondary }]}><Feather name="image" size={21} color={colors.accent} /><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Portfolio coming soon</Text></View>}</View>
          <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Packages</Text>{data.packages?.filter((item) => item.isActive !== false).map((item) => <View key={item.id} style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.packageTop}><View style={styles.packageCopy}><Text style={[styles.packageName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.packageMeta, { color: colors.mutedForeground }]}>{item.duration} hours · {item.description || 'Thoughtful coverage for your event'}</Text></View><Text style={[styles.packagePrice, { color: colors.accent }]}>₹{Math.round(item.price).toLocaleString('en-IN')}</Text></View><Text style={[styles.includes, { color: colors.mutedForeground }]}>{(item.includes ?? []).slice(0, 3).join(' · ')}</Text></View>)}</View>
        </View>
      </ScrollView>
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}><View><Text style={[styles.from, { color: colors.mutedForeground }]}>STARTING FROM</Text><Text style={[styles.fromPrice, { color: colors.foreground }]}>₹{Math.round(data.startingPrice).toLocaleString('en-IN')}</Text></View><PrimaryButton label="Book this artist" onPress={() => router.push(`/book/${data.id}`)} icon="arrow-forward" /></View>
    </View>
  );
}

function ProfileStat({ value, label, icon }: { value: string; label: string; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return <View style={styles.profileStat}><Feather name={icon} size={15} color={colors.accent} /><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stateScreen: { flex: 1, paddingHorizontal: 20 },
  heroImage: { height: 355, position: 'relative', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroShade: { ...StyleSheet.absoluteFill, opacity: 0.72 },
  backButton: { position: 'absolute', left: 20, width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shareButton: { position: 'absolute', right: 20, width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { position: 'absolute', left: 20, right: 20, bottom: 28, gap: 8 },
  verifiedLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verified: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1.2 },
  profileName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 35, letterSpacing: -0.7 },
  profileMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, opacity: 0.8 },
  body: { paddingHorizontal: 20, gap: 20, paddingTop: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  profileStat: { alignItems: 'center', gap: 3 },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10 },
  bio: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8 },
  chipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10 },
  section: { gap: 12 },
  sectionTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  portfolioItem: { width: '31.8%', height: 110, borderRadius: 11, overflow: 'hidden', position: 'relative' },
  portfolioImage: { width: '100%', height: '100%' },
  portfolioLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 5, paddingVertical: 5, opacity: 0.88 },
  portfolioTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 8 },
  portfolioEmpty: { minHeight: 108, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 },
  packageCard: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 9 },
  packageTop: { flexDirection: 'row', gap: 10 },
  packageCopy: { flex: 1, gap: 4 },
  packageName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18 },
  packageMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, lineHeight: 17 },
  packagePrice: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  includes: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  from: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, letterSpacing: 1 },
  fromPrice: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, marginTop: 2 },
});