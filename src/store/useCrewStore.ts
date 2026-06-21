import { create } from 'zustand';
import { CrewMemberStatus } from '@/types/domain';
import { DEMO_CREW, DEMO_CREW_MEMBERS, DEMO_FEED, DemoFeedItem } from '@/constants/demoData';

interface Crew {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
  category: string;
}

interface CrewState {
  crews: Crew[];
  activeCrewId: string | null;
  members: CrewMemberStatus[];
  feed: DemoFeedItem[];
  setActiveCrew: (id: string) => void;
  setMembers: (members: CrewMemberStatus[]) => void;
  upsertMember: (member: CrewMemberStatus) => void;
  prependFeed: (item: DemoFeedItem) => void;
}

export const useCrewStore = create<CrewState>((set) => ({
  crews: [DEMO_CREW],
  activeCrewId: DEMO_CREW.id,
  members: DEMO_CREW_MEMBERS,
  feed: DEMO_FEED,
  setActiveCrew: (id) => set({ activeCrewId: id }),
  setMembers: (members) => set({ members }),
  upsertMember: (member) =>
    set((s) => {
      const exists = s.members.some((m) => m.userId === member.userId);
      return {
        members: exists
          ? s.members.map((m) => (m.userId === member.userId ? member : m))
          : [...s.members, member],
      };
    }),
  prependFeed: (item) => set((s) => ({ feed: [item, ...s.feed] })),
}));
