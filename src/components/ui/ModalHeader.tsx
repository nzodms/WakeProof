import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  right?: React.ReactNode;
}

export function ModalHeader({ title, onClose, right }: ModalHeaderProps) {
  const t = useTheme();
  const nav = useNavigation();
  const close = () => {
    haptics.selection();
    if (onClose) onClose();
    else nav.goBack();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.spacing.md,
      }}
    >
      <Text variant="h2">{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        {right}
        <Pressable
          onPress={close}
          hitSlop={10}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: t.colors.glass,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="close" size={18} color={t.colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}
