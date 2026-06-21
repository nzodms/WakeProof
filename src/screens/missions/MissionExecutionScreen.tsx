import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { generateCalcProblem, CalcProblem } from '@/features/missions/calcGenerator';
import { RootStackParamList } from '@/navigation/types';

export function MissionExecutionScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MissionExecution'>>();
  const { getAlarm, dismissAlarm } = useAlarmStore();
  const alarm = getAlarm(route.params.alarmId);

  if (!alarm) return null;
  const def = MissionEngine.get(alarm.missionType);

  const onComplete = () => {
    haptics.success();
    dismissAlarm();
    // Ici : enregistrer mission_attempts + wake_log, calculer le Wake Score,
    // émettre un wake_event au Crew. (cf. features/wakeScore + crewRealtime)
    nav.navigate('Tabs', { screen: 'Alarm' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient colors={[t.colors.gradientStart, t.colors.background]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Text variant="micro" color="accent">
              MISSION · {def.meta.title.toUpperCase()}
            </Text>
          </View>

          {alarm.missionType === 'calc' && (
            <CalcRunner config={alarm.missionConfig as never} onComplete={onComplete} />
          )}
          {(alarm.missionType === 'shake' ||
            alarm.missionType === 'steps' ||
            alarm.missionType === 'squats') && (
            <MotionRunner type={alarm.missionType} config={alarm.missionConfig as never} onComplete={onComplete} />
          )}
          {alarm.missionType === 'photo_proof' && (
            <PhotoRunner config={alarm.missionConfig as never} onComplete={onComplete} />
          )}
          {alarm.missionType === 'qr_code' && (
            <QrRunner config={alarm.missionConfig as never} onComplete={onComplete} />
          )}
          {alarm.missionType === 'wake_check' && (
            <WakeCheckRunner config={alarm.missionConfig as never} onComplete={onComplete} />
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ---------------------------------------------------------------------------
function ProgressBar({ ratio }: { ratio: number }) {
  const t = useTheme();
  const style = useAnimatedStyle(() => ({ width: withTiming(`${Math.min(1, ratio) * 100}%`, { duration: 240 }) }));
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.glass, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: t.colors.accent }, style]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
function CalcRunner({ config, onComplete }: { config: { count: number; digits: 1 | 2 | 3 }; onComplete: () => void }) {
  const t = useTheme();
  const [solved, setSolved] = useState(0);
  const [problem, setProblem] = useState<CalcProblem>(() => generateCalcProblem(config.digits));
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (Number(input) === problem.answer) {
      haptics.success();
      const next = solved + 1;
      setSolved(next);
      setInput('');
      setWrong(false);
      if (next >= config.count) return onComplete();
      setProblem(generateCalcProblem(config.digits));
    } else {
      haptics.error();
      setWrong(true);
      setInput('');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: t.spacing.xl }}>
      <ProgressBar ratio={solved / config.count} />
      <Text variant="caption" color="secondary" center>
        {solved}/{config.count} résolus
      </Text>
      <GlassCard radiusKey="xl">
        <Text variant="display" center style={{ fontSize: 52 }}>
          {problem.prompt}
        </Text>
      </GlassCard>
      <TextInput
        value={input}
        onChangeText={setInput}
        keyboardType="number-pad"
        autoFocus
        placeholder="?"
        placeholderTextColor={t.colors.textTertiary}
        onSubmitEditing={submit}
        style={{
          fontSize: 40,
          fontWeight: '300',
          textAlign: 'center',
          color: wrong ? t.colors.danger : t.colors.text,
          borderBottomWidth: 2,
          borderColor: wrong ? t.colors.danger : t.colors.accent,
          paddingVertical: 8,
        }}
      />
      <Button label="Valider" onPress={submit} disabled={input.length === 0} />
    </View>
  );
}

// ---------------------------------------------------------------------------
function MotionRunner({
  type,
  config,
  onComplete,
}: {
  type: 'shake' | 'steps' | 'squats';
  config: { target: number };
  onComplete: () => void;
}) {
  const t = useTheme();
  const def = MissionEngine.get(type);
  const [count, setCount] = useState(0);
  const lastPeak = useRef(0);
  const armed = useRef(true);

  useEffect(() => {
    Accelerometer.setUpdateInterval(80);
    // Seuils par type : shake = secousse forte ; steps/squats = oscillation.
    const threshold = type === 'shake' ? 1.8 : 1.35;
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > threshold && armed.current && now - lastPeak.current > 280) {
        armed.current = false;
        lastPeak.current = now;
        haptics.impact('light');
        setCount((c) => {
          const next = c + 1;
          if (next >= config.target) onComplete();
          return next;
        });
      }
      if (magnitude < 1.1) armed.current = true;
    });
    return () => sub.remove();
  }, [type, config.target, onComplete]);

  const ratio = count / config.target;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: t.spacing.xl }}>
      <Icon name={def.meta.icon as never} size={64} color={t.colors.accent} />
      <Text variant="display" style={{ fontSize: 72 }}>
        {count}
      </Text>
      <Text variant="h3" color="secondary">
        / {config.target} {type === 'shake' ? 'secousses' : type === 'steps' ? 'pas' : 'squats'}
      </Text>
      <View style={{ width: '80%' }}>
        <ProgressBar ratio={ratio} />
      </View>
      <Text variant="caption" color="tertiary" center>
        {type === 'shake' ? 'Secoue énergiquement le téléphone' : 'Garde le téléphone sur toi et bouge'}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
function PhotoRunner({
  config,
  onComplete,
}: {
  config: { target: string };
  onComplete: () => void;
}) {
  const t = useTheme();
  const [perm, requestPerm] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  if (!perm?.granted) {
    return (
      <PermissionGate label="Accès caméra requis pour la photo proof" onPress={requestPerm} />
    );
  }

  const capture = async () => {
    setBusy(true);
    haptics.impact('medium');
    try {
      await camRef.current?.takePictureAsync({ quality: 0.6 });
      // Ici : upload Supabase Storage + horodatage + respect du share mode.
      onComplete();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
      <Text variant="h2" center>
        Photographie : {config.target}
      </Text>
      <View style={{ flex: 1, borderRadius: t.radius.xl, overflow: 'hidden' }}>
        <CameraView ref={camRef} style={{ flex: 1 }} facing="back" />
      </View>
      <Text variant="caption" color="tertiary" center>
        Photo prise en direct uniquement · horodatée · pas depuis la galerie
      </Text>
      <Button label="Prendre la photo" onPress={capture} loading={busy} />
    </View>
  );
}

// ---------------------------------------------------------------------------
function QrRunner({
  config,
  onComplete,
}: {
  config: { expectedValue: string };
  onComplete: () => void;
}) {
  const t = useTheme();
  const [perm, requestPerm] = useCameraPermissions();
  const done = useRef(false);

  if (!perm?.granted) {
    return <PermissionGate label="Accès caméra requis pour scanner le QR" onPress={requestPerm} />;
  }

  return (
    <View style={{ flex: 1, gap: t.spacing.md, paddingBottom: t.spacing.lg }}>
      <Text variant="h2" center>
        Scanne le QR
      </Text>
      <Text variant="caption" color="secondary" center>
        Place-le dans une autre pièce pour être obligé de te lever.
      </Text>
      <View style={{ flex: 1, borderRadius: t.radius.xl, overflow: 'hidden' }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (done.current) return;
            // En démo, tout QR valide. En prod : data === config.expectedValue.
            done.current = true;
            haptics.success();
            onComplete();
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
function WakeCheckRunner({ config, onComplete }: { config: { delayMin: 5 | 10 }; onComplete: () => void }) {
  const t = useTheme();
  // En démo on raccourcit ; en prod on programme une notif à +delayMin.
  const [secondsLeft, setSecondsLeft] = useState(8);
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: t.spacing.xl }}>
      <Icon name="check" size={64} color={t.colors.accent} />
      <Text variant="h2" center>
        Wake Check dans {config.delayMin} min
      </Text>
      <Text variant="body" color="secondary" center>
        On te demandera de confirmer que tu es toujours debout. Ne te rendors pas.
      </Text>
      <Button
        label={secondsLeft > 0 ? `Patiente (${secondsLeft}s)` : 'Je suis réveillé ✅'}
        onPress={onComplete}
        disabled={secondsLeft > 0}
      />
    </View>
  );
}

function PermissionGate({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
      <Text variant="h3" center>
        {label}
      </Text>
      <Button label="Autoriser la caméra" onPress={onPress} />
    </View>
  );
}
