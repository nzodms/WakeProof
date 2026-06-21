import React from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useTheme } from '@/theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

interface SettingRowProps {
  icon?: IconName;
  label: string;
  description?: string;
  value?: string;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
  onPress?: () => void;
  chevron?: boolean;
}

export function SettingRow({ icon, label, description, value, toggle, onPress, chevron }: SettingRowProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: t.spacing.md,
        gap: t.spacing.md,
      }}
    >
      {icon && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: t.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} color={t.colors.accent} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{label}</Text>
        {description && (
          <Text variant="caption" color="secondary">
            {description}
          </Text>
        )}
      </View>
      {value && (
        <Text variant="body" color="secondary">
          {value}
        </Text>
      )}
      {toggle && (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ true: t.colors.accent, false: t.colors.glassBorder }}
          thumbColor="#fff"
        />
      )}
      {chevron && <Icon name="chevron" size={18} color={t.colors.textTertiary} />}
    </Pressable>
  );
}
