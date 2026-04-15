import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

const ActiveSpeakerAwareGrid = React.memo(
  ({ baseParticipantIds, isPresenting }) => {
    const { activeSpeakerId } = useMeeting();

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
      prevProps.baseParticipantIds.length !== nextProps.baseParticipantIds.length
    ) {
      return false;
    }
    return prevProps.baseParticipantIds.every(
      (id, i) => id === nextProps.baseParticipantIds[i]
    );
  }
);

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    localParticipant,
  } = useMeeting();

  const baseParticipantIds = useMemo(() => {
    const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
      (participantId) => {
        return participantId !== localParticipant.id;
      }
    );
    const regularParticipantIds = [...participants.keys()].filter(
      (participantId) => {
        return (
          ![...pinnedParticipants.keys()].includes(participantId) &&
          localParticipant.id !== participantId
        );
      }
    );

    const ids = [
      localParticipant.id,
      ...pinnedParticipantId,
      ...regularParticipantIds,
    ].slice(0, isPresenting ? 6 : 16);

    return ids;
  }, [participants, pinnedParticipants, isPresenting]);

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
  }
);

export default MemorizedParticipantView;
