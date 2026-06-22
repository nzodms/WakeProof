import { NavigatorScreenParams } from '@react-navigation/native';
import { MissionType } from '@/types/domain';

export type TabParamList = {
  Alarm: undefined;
  Missions: undefined;
  Crew: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  CreateAlarm: { alarmId?: string } | undefined;
  MissionSetup: { missionType?: MissionType } | undefined;
  ActiveAlarm: { alarmId: string };
  MissionExecution: { alarmId: string };
  WakeCheck: { alarmId: string };
  WakeResult: { score: number };
  CrewDetail: { crewId: string };
  WakeBlast: { targetId: string; crewId: string };
  GlobalLeaderboard: undefined;
  Challenges: undefined;
  Settings: undefined;
  PrivacySettings: undefined;
  Paywall: { reason?: string } | undefined;
};
