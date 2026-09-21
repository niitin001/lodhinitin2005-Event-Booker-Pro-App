import { Feather, Ionicons } from '@expo/vector-icons';
import { Booking, getListBookingsQueryKey, useListBookings } from '@workspace/api-client-react';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { ErrorState, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/AppPrimitives';

export default function BookingsScreen() {
  const colors = useColors();
  const { user, isLoading: authLoading } = useAuth();
  const bookings = useListBookings(undefined, { query: { enabled: Boolean(user), refetchOnMount: 'always', queryKey: getListBookingsQueryKey() } });

  if (!authLoading && !user) {
    return (
      <Screen scroll={false}>
        <View style={styles.authEmpty}>
          <View style={[styles.authIcon, { backgroundColor: colors.secondary }]}><Feather name="calendar" size={26} color={colors.accent} /></View>
          <Text style={[styles.authTitle, { color: colors.foreground }]}>Your bookings, all together</Text>
          <Text style={[styles.authBody, { color: colors.mutedForeground }]}>Sign in to track upcoming shoots, confirmations and event details.</Text>
          <PrimaryButton label="Sign in to continue" onPress={() => router.push('/auth/login')} icon="arrow-forward" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={bookings.isFetching} onRefresh={() => void bookings.refetch()}>
      <View style={styles.headerRow}><View><Text style={[styles.eyebrow, { color: colors.accent }]}>CUSTOMER SPACE</Text><Text style={[styles.title, { color: colors.foreground }]}>My bookings</Text></View><Pressable onPress={() => router.push('/(tabs)')} hitSlop={10}><Ionicons name="add-circle-outline" size={27} color={colors.accent} /></Pressable></View>
      {bookings.isLoading ? <LoadingState label="Loading your bookings..." /> : bookings.isError ? <ErrorState onRetry={() => void bookings.refetch()} /> : (
        bookings.data?.length ? bookings.data.map((booking) => <BookingCard key={booking.id} booking={booking} />) : (
          <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name="calendar" size={23} color={colors.accent} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No bookings yet</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Your next story starts with the right artist.</Text><PrimaryButton label="Explore photographers" onPress={() => router.push('/(tabs)')} variant="outline" /></View>
        )
      )}
    </Screen>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const colors = useColors();
  const statusColor = booking.status === 'confirmed' || booking.status === 'completed' ? colors.success : booking.status === 'cancelled' || booking.status === 'rejected' ? colors.destructive : colors.accent;
  return (
    <View style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bookingTop}><View style={[styles.dateBadge, { backgroundColor: colors.secondary }]}><Text style={[styles.dateMonth, { color: colors.accent }]}>{new Date(booking.eventDate).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</Text><Text style={[styles.dateDay, { color: colors.foreground }]}>{new Date(booking.eventDate).getDate()}</Text></View><View style={styles.bookingInfo}><Text style={[styles.bookingName, { color: colors.foreground }]}>{booking.photographer?.displayName ?? 'EventShooter artist'}</Text><Text style={[styles.bookingMeta, { color: colors.mutedForeground }]}>{booking.eventType} · {booking.city}</Text></View><View style={[styles.status, { backgroundColor: `${statusColor}22` }]}><Text style={[styles.statusText, { color: statusColor }]}>{booking.status.replace('_', ' ')}</Text></View></View>
      <View style={[styles.bookingDivider, { backgroundColor: colors.border }]} />
      <View style={styles.bookingBottom}><View><Text style={[styles.bookingLabel, { color: colors.mutedForeground }]}>TOTAL</Text><Text style={[styles.bookingAmount, { color: colors.foreground }]}>₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</Text></View><View style={styles.bookingVenue}><Feather name="map-pin" size={13} color={colors.mutedForeground} /><Text numberOfLines={1} style={[styles.bookingMeta, { color: colors.mutedForeground }]}>{booking.venue || 'Venue to be confirmed'}</Text></View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 7 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.6 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 31, letterSpacing: -0.6, marginTop: 3 },
  bookingCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 13 },
  bookingTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  dateBadge: { width: 47, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 1 },
  dateMonth: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 0.6 },
  dateDay: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
  bookingInfo: { flex: 1, gap: 4 },
  bookingName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17 },
  bookingMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11 },
  status: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, textTransform: 'capitalize' },
  bookingDivider: { height: 1 },
  bookingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bookingLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1 },
  bookingAmount: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, marginTop: 3 },
  bookingVenue: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 170 },
  authEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 13, paddingHorizontal: 20 },
  authIcon: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  authTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 27, textAlign: 'center' },
  authBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
  emptyBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, marginBottom: 4 },
});