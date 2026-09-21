import { Feather, Ionicons } from '@expo/vector-icons';
import { useGetPhotographerStats, useGetTrendingPhotographers, useListPhotographers } from '@workspace/api-client-react';
import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { ErrorState, LoadingState, PhotographerCard, Screen, SectionTitle } from '@/components/AppPrimitives';

export default function DiscoverScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const searchParams = useMemo(() => ({ search: activeSearch || undefined, page: 1, limit: 12 }), [activeSearch]);
  const photographers = useListPhotographers(searchParams);
  const trending = useGetTrendingPhotographers();
  const stats = useGetPhotographerStats();
  const list = photographers.data?.photographers ?? [];

  function submitSearch() {
    setActiveSearch(search.trim());
  }

  return (
    <Screen refreshing={photographers.isFetching} onRefresh={() => void photographers.refetch()}>
      <View style={styles.topRow}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>EVENTSHOOTER</Text>
        <Pressable testID="profile-shortcut" onPress={() => router.push(user ? '/(tabs)/profile' : '/auth/login')} style={[styles.profileButton, { backgroundColor: colors.secondary }]}>
          <Ionicons name={user ? 'person' : 'log-in-outline'} size={17} color={colors.foreground} />
        </Pressable>
      </View>
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>Your moments,{"\n"}beautifully told.</Text>
        <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>Find an artist who sees your story the way you do.</Text>
      </View>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={19} color={colors.accent} />
        <TextInput
          testID="photographer-search"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          placeholder="Search by name, city or style"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {search ? (
          <Pressable testID="clear-search" onPress={() => { setSearch(''); setActiveSearch(''); }} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {stats.data ? (
        <View style={[styles.statsStrip, { backgroundColor: colors.primary }]}>
          <StatValue value={`${stats.data.totalPhotographers}+`} label="artists" />
          <View style={[styles.statDivider, { backgroundColor: colors.primaryForeground }]} />
          <StatValue value={`${stats.data.citiesCovered}`} label="cities" />
          <View style={[styles.statDivider, { backgroundColor: colors.primaryForeground }]} />
          <StatValue value={`${stats.data.averageRating?.toFixed(1) ?? '4.9'}`} label="avg rating" />
        </View>
      ) : null}
      {photographers.isLoading ? <LoadingState /> : photographers.isError ? <ErrorState onRetry={() => void photographers.refetch()} /> : (
        <>
          <SectionTitle eyebrow={activeSearch ? 'Search results' : 'Explore'} title={activeSearch ? `Artists for “${activeSearch}”` : 'Find your photographer'} />
          {list.length ? list.map((photographer) => <PhotographerCard key={photographer.id} photographer={photographer} />) : (
            <View style={styles.empty}><Feather name="search" size={22} color={colors.accent} /><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No photographers found. Try another search.</Text></View>
          )}
        </>
      )}
      {!activeSearch && trending.data?.length ? (
        <>
          <SectionTitle eyebrow="Curated for you" title="Trending artists" action="See all" onAction={() => { setSearch(''); setActiveSearch(''); }} />
          {trending.data.slice(0, 3).map((photographer) => <PhotographerCard key={`trending-${photographer.id}`} photographer={photographer} />)}
        </>
      ) : null}
      {!user ? (
        <Link href="/auth/login" asChild>
          <Pressable style={StyleSheet.flatten([styles.signInHint, { backgroundColor: colors.secondary }])}>
            <View style={[styles.signInIcon, { backgroundColor: colors.accent }]}><Feather name="lock" size={16} color={colors.accentForeground} /></View>
            <View style={styles.signInCopy}><Text style={[styles.signInTitle, { color: colors.foreground }]}>Sign in to book faster</Text><Text style={[styles.signInBody, { color: colors.mutedForeground }]}>Save your details and keep every booking in one place.</Text></View>
            <Feather name="arrow-up-right" size={18} color={colors.accent} />
          </Pressable>
        </Link>
      ) : null}
    </Screen>
  );
}

function StatValue({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return <View style={styles.stat}><Text style={[styles.statValue, { color: colors.primaryForeground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.primaryForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 2 },
  profileButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  hero: { gap: 9, paddingTop: 8, paddingBottom: 2 },
  heroTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 38, lineHeight: 42, letterSpacing: -1 },
  heroBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 21, maxWidth: 300 },
  searchBox: { minHeight: 55, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 },
  statsStrip: { borderRadius: 17, minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 8 },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
  statLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, opacity: 0.7 },
  statDivider: { width: 1, height: 28, opacity: 0.25 },
  empty: { minHeight: 130, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, textAlign: 'center' },
  signInHint: { borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  signInIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  signInCopy: { flex: 1, gap: 3 },
  signInTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  signInBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15 },
});