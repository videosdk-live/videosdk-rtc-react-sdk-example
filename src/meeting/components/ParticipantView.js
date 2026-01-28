import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

const DECAY_RATE = 0.95;
const UPDATE_INTERVAL = 500;

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    // localScreenShareOn,
    // presenterId,
  } = useMeeting();

  const [participantIds, setParticipantIds] = useState([]);
  const [page, setPage] = useState(0);

  const scoresRef = useRef(new Map());
  const sortedIDsRef = useRef([]); // Store all sorted IDs
  const pageSize = isPresenting ? 6 : 16;

  // Store latest props in a ref to avoid resetting the interval
  const latestPropsRef = useRef({
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    isPresenting,
    page,
  });

  useEffect(() => {
    latestPropsRef.current = {
      participants,
      pinnedParticipants,
      activeSpeakerId,
      localParticipant,
      isPresenting,
      page,
    };
  }, [
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    isPresenting,
    page,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        participants,
        pinnedParticipants,
        activeSpeakerId,
        localParticipant,
        isPresenting,
        page,
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

        score *= DECAY_RATE;

        // Priority Calculations
        if (participant?.screenShareOn) score += 40;
        if (id === activeSpeakerId) score += 30;
        if (participant?.webcamOn) score += 5;
        if (participant?.micOn) score += 20;

        currentScores.set(id, Math.min(score, 100));
      });

      const pinnedKeys = new Set([...pinnedParticipants.keys()]);
      const pinnedIds = [...pinnedKeys].filter(
        (id) => id !== localParticipant.id,
      );

      const regularSortedIds = [...participants.keys()]
        .filter((id) => id !== localParticipant.id && !pinnedKeys.has(id))
        .sort((a, b) => {
          const scoreA = currentScores.get(a) || 0;
          const scoreB = currentScores.get(b) || 0;
          return scoreB - scoreA;
        });

      // Validating Page Index
      const totalIDs = [localParticipant.id, ...pinnedIds, ...regularSortedIds];
      const totalPages = Math.ceil(totalIDs.length / pageSize);

      // Correct page if out of bounds (e.g. participants left)
      let invalidPage = false;
      if (page >= totalPages && page > 0) {
        setPage(totalPages - 1);
        invalidPage = true;
      }

      // If we adjusted the page, we'll let the next tick handle the slice to avoid race conditions
      // or we can just compute it now with the new page index logic generally,
      // but modifying state inside interval is tricky.
      // Ideally, we just compute the slice safely.

      const safePage = invalidPage ? totalPages - 1 : page; // Use safe temporary page for this render

      const startIndex = safePage * pageSize;
      const endIndex = startIndex + pageSize;
      const newIds = totalIDs.slice(startIndex, endIndex);

      sortedIDsRef.current = totalIDs; // Store for immediate page switching

      setParticipantIds((prev) => {
        if (prev.length !== newIds.length) {
          return newIds;
        }

        for (let i = 0; i < newIds.length; i++) {
          if (prev[i] !== newIds[i]) {
            return newIds;
          }
        }
        return prev;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Immediate update when page changes
  useEffect(() => {
    const totalIDs = sortedIDsRef.current;
    if (totalIDs.length > 0) {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const newIds = totalIDs.slice(startIndex, endIndex);

      setParticipantIds(newIds);
    }
  }, [page, pageSize]);

  const totalParticipants =
    sortedIDsRef.current.length || participantIds.length; // Fallback
  const totalPages = Math.ceil(totalParticipants / pageSize);

  return (
    <MemoizedParticipantGrid
      participantIds={participantIds}
      isPresenting={isPresenting}
      totalPages={totalPages}
      setPage={setPage}
      page={page}
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