import React, { useMemo } from "react";
import { Constants } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";
import { useMeetingStore } from "../../store/meetingStore";

const ActiveSpeakerAwareGrid = React.memo(
  ({ baseParticipantIds, isPresenting }) => {
    const activeSpeakerId = useMeetingStore((s) => s.activeSpeakerId);

    const participantIds = useMemo(() => {
      const ids = [...baseParticipantIds];
      if (activeSpeakerId) {
        if (!ids.includes(activeSpeakerId)) {
          ids[ids.length - 1] = activeSpeakerId;
        }
      }
      return ids;
    }, [baseParticipantIds, activeSpeakerId]);

    return (
      <MemoizedParticipantGrid
        participantIds={participantIds}
        isPresenting={isPresenting}
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.isPresenting !== nextProps.isPresenting) return false;
    if (
      prevProps.baseParticipantIds.length !==
      nextProps.baseParticipantIds.length
    ) {
      return false;
    }
    return prevProps.baseParticipantIds.every(
      (id, i) => id === nextProps.baseParticipantIds[i],
    );
  },
);

function ParticipantsViewer({ isPresenting }) {
  const participants = useMeetingStore((s) => s.participants);
  const pinnedParticipants = useMeetingStore((s) => s.pinnedParticipants);
  const localParticipant = useMeetingStore((s) => s.localParticipant);

  const baseParticipantIds = useMemo(() => {
    if (!localParticipant) return [];

    const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
      (participantId) => participantId !== localParticipant.id,
    );
    const regularParticipantIds = [...participants.keys()].filter(
      (participantId) =>
        ![...pinnedParticipants.keys()].includes(participantId) &&
        localParticipant.id !== participantId,
    );

    return [
      localParticipant.id,
      ...pinnedParticipantId,
      ...regularParticipantIds,
    ].slice(0, isPresenting ? 6 : 16);
  }, [participants, pinnedParticipants, localParticipant, isPresenting]);

  return (
    <ActiveSpeakerAwareGrid
      baseParticipantIds={baseParticipantIds}
      isPresenting={isPresenting}
    />
  );
}

const MemorizedParticipantView = React.memo(
  ParticipantsViewer,
  (prevProps, nextProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  },
);

export default MemorizedParticipantView;
