import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";
import { ParticipantAudio } from "../../components/ParticipantAudio";

const DECAY_RATE = 0.95;

const SCORE_UPDATE_INTERVAL = 1000; // Update scores every 500ms
const ACTIVE_SPEAKER_UPDATE_INTERVAL = 500; // Update scores every 500ms
const TILE_UPDATE_INTERVAL = 4000; // Update tiles/participantIds every 2.5 seconds

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
  } = useMeeting();

  const [participantIds, setParticipantIds] = useState([]);
  const [page, setPage] = useState(0);

  const scoresRef = useRef(new Map());
  const sortedIDsRef = useRef([]); // Store all sorted IDs
  const pageSize = 3;
  // isPresenting ? 6 : 16;

  useEffect(() => {
    setPage(0);
  }, [isPresenting]);

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

  const updateTiles = useCallback(() => {
    const { participants, pinnedParticipants, localParticipant, page } =
      latestPropsRef.current;

    const pageSize = 3;
    const currentScores = scoresRef.current;

    // Separate pinned and regular participants
    const pinnedKeys = new Set([...pinnedParticipants.keys()]);
    const pinnedIds = [...pinnedKeys].filter(
      (id) => id !== localParticipant.id,
    );

    // Get all regular participants sorted by score
    const regularSortedIds = [...participants.keys()]
      .filter((id) => id !== localParticipant.id && !pinnedKeys.has(id))
      .sort((a, b) => {
        const scoreA = currentScores.get(a) || 0;
        const scoreB = currentScores.get(b) || 0;
        return scoreB - scoreA;
      });

    // Build the complete ordered list
    const allSortedIds = [
      localParticipant.id,
      ...pinnedIds,
      ...regularSortedIds,
    ];
    const totalPages = Math.ceil(allSortedIds.length / pageSize);

    // Correct page if out of bounds (e.g. participants left)
    let invalidPage = false;
    if (page >= totalPages && page > 0) {
      setPage(totalPages - 1);
      invalidPage = true;
    }

    const safePage = invalidPage ? totalPages - 1 : page;

    // Page-stable sorting algorithm (optimized)
    const getPageParticipants = (
      pageIndex,
      allIds,
      pageSize,
      currentPageIds,
    ) => {
      const startIdx = pageIndex * pageSize;
      const endIdx = startIdx + pageSize;
      const idealPageIds = allIds.slice(startIdx, endIdx);

      // If this is not the current page or we don't have previous state, use ideal sorting
      if (
        pageIndex !== safePage ||
        !currentPageIds ||
        currentPageIds.length === 0
      ) {
        return idealPageIds;
      }

      // Create Sets for O(1) lookup instead of O(n) array operations
      const currentSet = new Set(currentPageIds);

      // Single pass: separate participants into keep vs add
      const toKeep = [];
      const toAdd = [];

      for (const id of idealPageIds) {
        if (currentSet.has(id)) {
          toKeep.push(id);
        } else {
          toAdd.push(id);
        }
      }
      // Build result: preserve existing order, fill gaps with new participants
      const toKeepSet = new Set(toKeep);
      const result = [];
      let addPointer = 0;

      for (const id of currentPageIds) {
        if (toKeepSet.has(id)) {
          result.push(id);
        } else if (addPointer < toAdd.length) {
          result.push(toAdd[addPointer++]);
        }
        if (result.length >= pageSize) break;
      }

      // Append remaining new participants if space available
      while (result.length < pageSize && addPointer < toAdd.length) {
        result.push(toAdd[addPointer++]);
      }

      return result;
    };

    setParticipantIds((prevIds) => {
      const newIds = getPageParticipants(
        safePage,
        allSortedIds,
        pageSize,
        prevIds,
      );
      return newIds;
    });

    sortedIDsRef.current = allSortedIds; // Store for immediate page switching
  }, []);

  useEffect(() => {
    updateTiles();
  }, [participants.size]);

  // Tile update interval - updates participantIds based on scores
  useEffect(() => {
    const tileUpdateInterval = setInterval(updateTiles, TILE_UPDATE_INTERVAL);
    return () => clearInterval(tileUpdateInterval);
  }, [updateTiles]); // Only depends on stable updateTiles function

  // Score update interval - updates scores based on participant state
  useEffect(() => {
    // Interval 1: Update scores based on activeSpeakerId
    const activeSpeakerInterval = setInterval(() => {
      const { participants, activeSpeakerId } = latestPropsRef.current;
      const currentScores = scoresRef.current;

      participants.forEach((participant, id) => {
        let score = currentScores.get(id) || 0;
        // Update score based on active speaker
        if (id === activeSpeakerId) {
          score += 30;
        }
        currentScores.set(id, Math.min(score, 100));
      });
    }, ACTIVE_SPEAKER_UPDATE_INTERVAL);

    // Interval 2: Update scores based on webcam, mic, and screen share
    const mediaStateInterval = setInterval(() => {
      const { participants } = latestPropsRef.current;
      const currentScores = scoresRef.current;

      // Garbage collection for left participants
      for (const id of currentScores.keys()) {
        if (!participants.has(id)) {
          currentScores.delete(id);
        }
      }

      participants.forEach((participant, id) => {
        let score = currentScores.get(id) || 0;

        // Apply decay to existing score
        score *= DECAY_RATE;

        // Update scores based on media state
        if (participant?.screenShareOn) score += 40;
        if (participant?.webcamOn) score += 10;
        if (participant?.micOn) score += 2;

        currentScores.set(id, Math.min(score, 100));
      });
    }, SCORE_UPDATE_INTERVAL);

    return () => {
      clearInterval(activeSpeakerInterval);
      clearInterval(mediaStateInterval);
    };
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
    <>
      <MemoizedParticipantGrid
        participantIds={participantIds}
        isPresenting={isPresenting}
        totalPages={totalPages}
        setPage={setPage}
        page={page}
      />
      <div className="rest-shared-audio">
        {[...participants.keys()]
          .filter((participantId) => !participantIds.includes(participantId))
          .map((participantId) => (
            <ParticipantAudio
              key={participantId}
              participantId={participantId}
            />
          ))}
      </div>
    </>
  );
}

const MemorizedParticipantView = React.memo(
  ParticipantsViewer,
  (prevProps, nextProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  },
);

export default MemorizedParticipantView;
