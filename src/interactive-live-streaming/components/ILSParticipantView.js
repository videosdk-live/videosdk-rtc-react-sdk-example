import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

function ILSParticipantView({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
    presenterId,
  } = useMeeting();

  // const participantIds = useMemo(() => {

  //   console.log("participants ==>", participants)
  //   const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
  //     (participantId) => {
  //       return participantId != localParticipant.id;
  //     }
  //   );
  //   const regularParticipantIds = [...participants.keys()].filter(
  //     (participantId) => {
  //       return (
  //         ![...pinnedParticipants.keys()].includes(participantId) &&
  //         localParticipant.id != participantId
  //       );
  //     }
  //   );

  //   const ids = [
  //     localParticipant.id,
  //     ...pinnedParticipantId,
  //     ...regularParticipantIds,
  //   ];

  //   console.log("ids", ids)

  //   const filteredParticipants = ids
  //     .filter((participantId) => {
  //       return participants?.get(participantId)?.mode === "SEND_AND_RECV";
  //     })
  //     .slice(0, 16);

  //   console.log("filtered Participantss", filteredParticipants)

  //   if (activeSpeakerId) {
  //     if (!ids.includes(activeSpeakerId)) {
  //       ids[ids.length - 1] = activeSpeakerId;
  //     }
  //   }
  //   return filteredParticipants;
  // }, [
  //   participants,
  //   activeSpeakerId,
  //   pinnedParticipants,
  //   presenterId,
  //   localScreenShareOn,
  // ]);

  const participantIds = useMemo(() => {
    if (!participants || !localParticipant) return [];


    const ids = [...participants.values()]
      .filter((p) => p.mode === "SEND_AND_RECV")
      .map((p) => p.id);

    // if (activeSpeakerId && !ids.includes(activeSpeakerId)) {
    //   ids.push(activeSpeakerId);
    // }

    return ids.slice(0, 16); // Limit to 16 participants
  }, [participants, activeSpeakerId, localParticipant]);

  return (
    <MemoizedParticipantGrid
      participantIds={participantIds}
      isPresenting={isPresenting}
    />
  );
}

const MemorizedILSParticipantView = React.memo(
  ILSParticipantView,
  (prevProps, nextProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  }
);

export default MemorizedILSParticipantView;
