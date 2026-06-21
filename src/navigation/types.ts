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
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  CreateAlarm: { alarmId?: string } | undefined;
  MissionSetup: { missionType?: MissionType } | undefined;
  ActiveAlarm: { alarmId: string };
  MissionExecution: { alarmId: string };
  CrewDetail: { crewId: string };
  WakeBlast: { targetId: string; crewId: string };
  GlobalLeaderboard: undefined;
  Challenges: undefined;
  Settings: undefined;
  PrivacySettings: undefined;
  Paywall: { reason?: string } | undefined;
};
