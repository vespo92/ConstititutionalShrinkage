import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
};

function MenuItem({ icon, title, subtitle, onPress, destructive }: MenuItemProps) {
  return (
    <Card style={styles.menuItem} pressable onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuItemIcon,
            destructive && styles.menuItemIconDestructive,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? colors.error : colors.primary[600]}
          />
        </View>
        <View>
          <Text
            style={[styles.menuItemTitle, destructive && styles.menuItemTitleDestructive]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </Card>
  );
}

/**
 * Profile Screen
 * User profile, settings, and account management
 */
export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'C'}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        </View>
        <Text style={styles.profileName}>{user?.displayName || 'Citizen'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{user?.stats?.votesCount || 0}</Text>
            <Text style={styles.profileStatLabel}>Votes Cast</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{user?.stats?.delegationsCount || 0}</Text>
            <Text style={styles.profileStatLabel}>Delegations</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{user?.region || 'N/A'}</Text>
            <Text style={styles.profileStatLabel}>Region</Text>
          </View>
        </View>
      </Card>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => {}}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Security"
          subtitle="Password, biometrics, and 2FA"
          onPress={() => {}}
        />
        <MenuItem
          icon="finger-print-outline"
          title="Biometric Login"
          subtitle="Face ID / Touch ID enabled"
          onPress={() => {}}
        />
        <MenuItem
          icon="key-outline"
          title="Vote Signing Key"
          subtitle="Manage your cryptographic keys"
          onPress={() => {}}
        />
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage push notification settings"
          onPress={() => {}}
        />
        <MenuItem
          icon="location-outline"
          title="Region Settings"
          subtitle="Update your regional preferences"
          onPress={() => {}}
        />
        <MenuItem
          icon="moon-outline"
          title="Appearance"
          subtitle="Dark mode and theme options"
          onPress={() => {}}
        />
        <MenuItem
          icon="language-outline"
          title="Language"
          subtitle="English (US)"
          onPress={() => {}}
        />
      </View>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="FAQs and guides"
          onPress={() => {}}
        />
        <MenuItem
          icon="chatbubble-outline"
          title="Contact Support"
          subtitle="Get help from our team"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          title="Terms of Service"
          onPress={() => {}}
        />
        <MenuItem
          icon="lock-closed-outline"
          title="Privacy Policy"
          onPress={() => {}}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="log-out-outline"
          title="Sign Out"
          onPress={handleLogout}
          destructive
        />
      </View>

      {/* App Version */}
      <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    width: '100%',
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  menuSection: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIconDestructive: {
    backgroundColor: `${colors.error}15`,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  menuItemTitleDestructive: {
    color: colors.error,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
  },
});
