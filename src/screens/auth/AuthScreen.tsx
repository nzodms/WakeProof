import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAuth } from '@/features/auth/AuthProvider';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const t = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const res = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      haptics.error();
      setError(res.error ?? 'Erreur');
    } else {
      haptics.success();
    }
  };

  const inputStyle = {
    color: t.colors.text,
    fontSize: 16,
    paddingVertical: 14,
  };

  return (
    <Screen withHalos>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', gap: t.spacing.lg }}
      >
        <View style={{ gap: 6 }}>
          <Text variant="display" style={{ fontSize: 40 }}>
            WakeProof
          </Text>
          <Text variant="body" color="secondary">
            {mode === 'signup' ? 'Crée ton compte et lève-toi pour de vrai.' : 'Content de te revoir. On se lève ?'}
          </Text>
        </View>

        <GlassCard radiusKey="xl">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={t.colors.textTertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={inputStyle}
          />
          <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            placeholderTextColor={t.colors.textTertiary}
            secureTextEntry
            style={inputStyle}
          />
        </GlassCard>

        {error && (
          <Text variant="caption" color="danger" center>
            {error}
          </Text>
        )}

        <Button
          label={mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          onPress={submit}
          loading={loading}
          disabled={email.length < 3 || password.length < 6}
        />
        <Button
          label={mode === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte'}
          variant="ghost"
          haptic={false}
          onPress={() => {
            setError(null);
            setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
          }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
