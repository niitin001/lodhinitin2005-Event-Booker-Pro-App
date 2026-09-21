import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Photographer } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View style={StyleSheet.flatten([styles.screenInner, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 88 }])}>
      {children}
    </View>
  );
  const screenStyle = StyleSheet.flatten([styles.screen, { backgroundColor: colors.background }]);
  if (!scroll) return <View style={screenStyle}>{content}</View>;
  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined
      }
    >
      {content}
    </ScrollView>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <Pressable testID="brand-mark" onPress={() => router.replace('/(tabs)')} style={styles.brand}>
      <View style={[styles.brandIcon, { backgroundColor: colors.accent }]}>
        <Feather name="aperture" size={compact ? 17 : 20} color={colors.accentForeground} />
      </View>
      <Text style={[styles.brandText, { color: colors.foreground, fontSize: compact ? 17 : 20 }]}>EventShooter</Text>
    </Pressable>
  );
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action ? (
        <Pressable testID="section-action" onPress={onAction} hitSlop={10}>
          <Text style={[styles.actionText, { color: colors.accent }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  variant = 'filled',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outline';
}) {
  const colors = useColors();
  const filled = variant === 'filled';
  return (
    <Pressable
      testID={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: filled ? colors.primary : 'transparent',
          borderColor: filled ? colors.primary : colors.border,
          opacity: disabled || loading ? 0.5 : pressed ? 0.78 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={filled ? colors.primaryForeground : colors.foreground} /> : null}
      {!loading && icon ? <Ionicons name={icon} size={18} color={filled ? colors.primaryForeground : colors.foreground} /> : null}
      <Text style={[styles.primaryButtonText, { color: filled ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        testID={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[
          styles.input,
          { color: colors.foreground, borderColor: error ? colors.destructive : colors.input, backgroundColor: colors.card },
          multiline && styles.multilineInput,
        ]}
      />
      {error ? <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

export function PhotographerCard({ photographer }: { photographer: Photographer }) {
  const colors = useColors();
  return (
    <Link href={`/photographer/${photographer.id}`} asChild>
      <Pressable testID={`photographer-card-${photographer.id}`} style={({ pressed }) => [styles.photographerCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
        <View style={styles.cardImageWrap}>
          {photographer.coverImageUrl ? (
            <Image source={{ uri: photographer.coverImageUrl }} contentFit="cover" style={styles.cardImage} transition={250} />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: colors.secondary }]}>
              <Feather name="camera" size={27} color={colors.accent} />
            </View>
          )}
          <View style={[styles.availableBadge, { backgroundColor: photographer.isAvailable ? colors.success : colors.mutedForeground }]}>
            <Text style={[styles.availableText, { color: colors.primaryForeground }]}>{photographer.isAvailable ? 'AVAILABLE' : 'BUSY'}</Text>
          </View>
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.cardTitleRow}>
            <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.foreground }]}>{photographer.displayName}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.accent} />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{photographer.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>{photographer.city} · {photographer.totalReviews} reviews</Text>
          <View style={styles.cardBottomRow}>
            <Text style={[styles.specialization, { color: colors.mutedForeground }]} numberOfLines={1}>
              {(photographer.specializations ?? ['Event photography']).slice(0, 2).join(' · ')}
            </Text>
            <Text style={[styles.price, { color: colors.accent }]}>From ₹{Math.round(photographer.startingPrice).toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export function LoadingState({ label = 'Finding the right frames...' }: { label?: string }) {
  const colors = useColors();
  return (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message = 'We could not load this right now.', onRetry }: { message?: string; onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.centerState}>
      <View style={[styles.stateIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="wifi-off" size={22} color={colors.accent} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>Something went wrong</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{message}</Text>
      <PrimaryButton label="Try again" onPress={onRetry} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenInner: { paddingHorizontal: 20, gap: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: -0.25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  sectionTitleCopy: { flex: 1, gap: 3 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.4 },
  heading: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, letterSpacing: -0.5 },
  actionText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 },
  primaryButton: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, letterSpacing: 0.15 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, letterSpacing: 0.2 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 },
  multilineInput: { minHeight: 110, paddingTop: 14, textAlignVertical: 'top' },
  errorText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11 },
  photographerCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  cardImageWrap: { height: 164, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  availableBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  availableText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1 },
  cardCopy: { padding: 14, gap: 7 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  cardMeta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  specialization: { flex: 1, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11 },
  price: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 },
  centerState: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
  stateIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
  stateText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});