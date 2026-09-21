import { Feather, Ionicons } from '@expo/vector-icons';
import { getGetPhotographerQueryKey, useCreateBooking, useGetPhotographer } from '@workspace/api-client-react';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field, LoadingState, PrimaryButton } from '@/components/AppPrimitives';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function BookingScreen() {
  const colors = useColors();
  const { user, isLoading: authLoading } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const photographerId = Number(id);
  const profile = useGetPhotographer(photographerId, { query: { enabled: Number.isFinite(photographerId), queryKey: getGetPhotographerQueryKey(photographerId) } });
  const createBooking = useCreateBooking();
  const [packageId, setPackageId] = useState<number | null>(null);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const selectedPackage = profile.data?.packages?.find((item) => item.id === packageId);
  const eventTypes = useMemo(() => {
    const values = profile.data?.packages?.flatMap((item) => item.eventTypes ?? []) ?? [];
    return Array.from(new Set(values.length ? values : profile.data?.specializations ?? ['Wedding', 'Birthday', 'Corporate']));
  }, [profile.data]);

  if (authLoading || profile.isLoading) return <View style={[styles.state, { backgroundColor: colors.background }]}><LoadingState label="Preparing your booking..." /></View>;
  if (!user) {
    return <View style={[styles.state, { backgroundColor: colors.background }]}><View style={[styles.authIcon, { backgroundColor: colors.secondary }]}><Feather name="lock" size={24} color={colors.accent} /></View><Text style={[styles.authTitle, { color: colors.foreground }]}>Sign in to book</Text><Text style={[styles.authBody, { color: colors.mutedForeground }]}>Create a customer account or sign in to send your event details to {profile.data?.displayName ?? 'this artist'}.</Text><PrimaryButton label="Sign in to continue" onPress={() => router.push(`/auth/login?returnTo=/book/${photographerId}`)} icon="arrow-forward" /></View>;
  }
  if (profile.isError || !profile.data) return <View style={[styles.state, { backgroundColor: colors.background }]}><Text style={[styles.authTitle, { color: colors.foreground }]}>Artist not found</Text><PrimaryButton label="Go back" onPress={() => router.back()} variant="outline" /></View>;

  function submit() {
    const parsedDate = new Date(eventDate);
    if (!packageId || !eventType || !eventDate || !city) {
      setError('Choose a package and complete the required event details.');
      return;
    }
    if (Number.isNaN(parsedDate.getTime()) || eventDate.length < 8) {
      setError('Enter the event date as YYYY-MM-DD.');
      return;
    }
    setError('');
    createBooking.mutate({
      data: {
        photographerId,
        packageId,
        eventType,
        eventDate: parsedDate.toISOString(),
        city: city.trim(),
        venue: venue.trim() || undefined,
        notes: notes.trim() || undefined,
      },
    }, {
      onSuccess: () => {
        Alert.alert('Booking request sent', `${profile.data?.displayName} will review your event details and get back to you.`, [{ text: 'View bookings', onPress: () => router.replace('/(tabs)/bookings') }]);
      },
      onError: () => setError('We could not send your booking. Please check your details and try again.'),
    });
  }

  const screenStyle = StyleSheet.flatten([styles.screen, { backgroundColor: colors.background }]);
  return (
    <View style={screenStyle}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><Pressable testID="booking-back" onPress={() => router.back()} hitSlop={10}><Ionicons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.accent }]}>BOOK AN ARTIST</Text><Text style={[styles.title, { color: colors.foreground }]}>Tell us about your event</Text></View></View>
        <View style={[styles.artistMini, { backgroundColor: colors.secondary }]}><View style={[styles.artistDot, { backgroundColor: colors.accent }]}><Feather name="aperture" size={16} color={colors.accentForeground} /></View><View style={styles.artistCopy}><Text style={[styles.artistName, { color: colors.foreground }]}>{profile.data.displayName}</Text><Text style={[styles.artistMeta, { color: colors.mutedForeground }]}>{profile.data.city} · From ₹{Math.round(profile.data.startingPrice).toLocaleString('en-IN')}</Text></View></View>
        <View style={styles.formSection}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose a package</Text>{profile.data.packages?.filter((item) => item.isActive !== false).map((item) => <Pressable key={item.id} testID={`package-${item.id}`} onPress={() => setPackageId(item.id)} style={[styles.packageOption, { backgroundColor: colors.card, borderColor: packageId === item.id ? colors.accent : colors.border }]}><View style={[styles.radio, { borderColor: packageId === item.id ? colors.accent : colors.input }]}>{packageId === item.id ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}</View><View style={styles.packageCopy}><Text style={[styles.packageName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.packageMeta, { color: colors.mutedForeground }]}>{item.duration} hours · {item.description || 'Complete event coverage'}</Text></View><Text style={[styles.packagePrice, { color: colors.accent }]}>₹{Math.round(item.price).toLocaleString('en-IN')}</Text></Pressable>)}</View>
        <View style={styles.formSection}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Event details</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>What are we capturing?</Text><View style={styles.eventTypes}>{eventTypes.slice(0, 5).map((type) => <Pressable key={type} onPress={() => setEventType(type)} style={[styles.eventType, { backgroundColor: eventType === type ? colors.accent : colors.secondary }]}><Text style={[styles.eventTypeText, { color: eventType === type ? colors.accentForeground : colors.foreground }]}>{type}</Text></Pressable>)}</View><Field label="Event date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" /><Field label="City" value={city} onChangeText={setCity} placeholder="e.g. Mumbai" /><Field label="Venue (optional)" value={venue} onChangeText={setVenue} placeholder="Venue or neighbourhood" /><Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Tell the artist anything helpful" multiline /></View>
        {selectedPackage ? <View style={[styles.summary, { backgroundColor: colors.secondary }]}><View><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>ESTIMATED STARTING TOTAL</Text><Text style={[styles.summaryPrice, { color: colors.foreground }]}>₹{Math.round(selectedPackage.price).toLocaleString('en-IN')}</Text></View><Text style={[styles.summaryNote, { color: colors.mutedForeground }]}>Final details are confirmed by your artist.</Text></View> : null}
        {error ? <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}18` }]}><Feather name="alert-circle" size={16} color={colors.destructive} /><Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text></View> : null}
        <PrimaryButton label="Send booking request" onPress={submit} loading={createBooking.isPending} disabled={!packageId || !eventType || !eventDate || !city} icon="arrow-forward" />
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>No payment is collected yet. Your request is sent to the artist for confirmation.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25, gap: 12 },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.4 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 29, lineHeight: 35, letterSpacing: -0.6 },
  artistMini: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  artistDot: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  artistCopy: { gap: 3 },
  artistName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17 },
  artistMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11 },
  formSection: { gap: 12 },
  sectionTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23 },
  helper: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, marginTop: -5 },
  packageOption: { minHeight: 78, borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  packageCopy: { flex: 1, gap: 4 },
  packageName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  packageMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15 },
  packagePrice: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  eventTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  eventType: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9 },
  eventTypeText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 },
  summary: { padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, letterSpacing: 0.8 },
  summaryPrice: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, marginTop: 3 },
  summaryNote: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15, textAlign: 'right' },
  errorBox: { padding: 12, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, lineHeight: 16 },
  disclaimer: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 18 },
  authIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  authTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 27, textAlign: 'center' },
  authBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 310, marginBottom: 7 },
});