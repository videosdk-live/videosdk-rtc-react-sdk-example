import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

const DECAY_RATE = 0.95;
const UPDATE_INTERVAL = 2000;

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
    presenterId,
  } = useMeeting();

  // const participantIds = useMemo(() => {
  //   const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
  //     (participantId) => {
  //       return participantId !== localParticipant.id;
  //     }
  //   );
  //   const regularParticipantIds = [...participants.keys()].filter(
  //     (participantId) => {
  //       return (
  //         ![...pinnedParticipants.keys()].includes(participantId) &&
  //         localParticipant.id !== participantId
  //       );
  //     }
  //   );

  //   const ids = [
  //     localParticipant.id,
  //     ...pinnedParticipantId,
  //     ...regularParticipantIds,
  //   ].slice(0, isPresenting ? 6 : 16);

  //   if (activeSpeakerId) {
  //     if (!ids.includes(activeSpeakerId)) {
  //       ids[ids.length - 1] = activeSpeakerId;
  //     }
  //   }
  //   return ids;
  // }, [
  //   participants,
  //   activeSpeakerId,
  //   pinnedParticipants,
  //   presenterId,
  //   localScreenShareOn,
  // ]);

  const [participantIds, setParticipantIds] = useState([]);

  const scoresRef = useRef(new Map());
  const pageSize = isPresenting ? 6 : 16;


  // Store latest props in a ref to avoid resetting the interval
  const latestPropsRef = useRef({
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    isPresenting,
  });

  useEffect(() => {
    latestPropsRef.current = {
      participants,
      pinnedParticipants,
      activeSpeakerId,
      localParticipant,
      isPresenting,
    };
  }, [
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    isPresenting,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        participants,
        pinnedParticipants,
        activeSpeakerId,
        localParticipant,
        isPresenting,
      } = latestPropsRef.current;

      const currentScores = scoresRef.current;

      // Garbage collection for left participants
      for (const id of currentScores.keys()) {
        if (!participants.has(id)) {
          currentScores.delete(id);
        }
      }

      participants.forEach((participant, id) => {
        let score = currentScores.get(id) || 0; // Initialize at 0 if new

        // Dynamic Decay: fast decay for high scores (bursts), slow for low
        score *= DECAY_RATE;

        // Priority Calculations
        if (participant?.screenShareOn) score += 40;
        if (id === activeSpeakerId) score += 30;
        if (participant?.webcamOn) score += 10; // Increased from 2
        if (participant?.micOn) score += 5;     // Decreased from 20 to avoid noise dominance

        currentScores.set(id, Math.min(score, 100));
      });

      const pinnedKeys = new Set([...pinnedParticipants.keys()]);
      const pinnedIds = [...pinnedKeys].filter(
        (id) => id !== localParticipant.id
      );

      const regularSortedIds = [...participants.keys()]
        .filter((id) => id !== localParticipant.id && !pinnedKeys.has(id))
        .sort((a, b) => {
          const scoreA = currentScores.get(a) || 0;
          const scoreB = currentScores.get(b) || 0;
          return scoreB - scoreA;
        });



      const newIds = [
        localParticipant.id,
        ...pinnedIds,
        ...regularSortedIds,
      ].slice(0, pageSize);

      setParticipantIds((prev) => {
        if (prev.length !== newIds.length) return newIds;

        for (let i = 0; i < newIds.length; i++) {
          if (prev[i] !== newIds[i]) {
            return [
              localParticipant.id,
              ...pinnedIds,
              ...regularSortedIds,
            ];
          }
        }
        return prev;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <MemoizedParticipantGrid
      participantIds={participantIds}
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