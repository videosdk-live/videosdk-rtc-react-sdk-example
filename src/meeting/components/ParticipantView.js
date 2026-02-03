import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";
import { ParticipantAudio } from "../../components/ParticipantAudio";
import { activeSpeakerBasedMainTileAlgoConfig } from "../../constants";

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
  } = useMeeting();

  const {
    SAMPLING_INTERVAL,
    ANALYZER_INTERVAL,
    UPDATE_INTERVAL,
    BASE_SCORE,
    DECAY_RATE,
  } = activeSpeakerBasedMainTileAlgoConfig;

  // State for the visible grid & pagination
  const [participantIds, setParticipantIds] = useState([]);
  const [page, setPage] = useState(0);

  const scoresRef = useRef(new Map()); // Map<participantId, score> LAYER 3: UPDATER
  const speakerCountRef = useRef(new Map()); // Map<participantId, count> LAYER 2: ANALYZER
  const latestPropsRef = useRef({
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
  });

  // Calculate pages
  const pageSize = isPresenting ? 3 : 4;
  const totalPages = Math.ceil(participants.size / pageSize);

  // Reset page when layout changes
  useEffect(() => {
    setPage(0);
  }, [isPresenting]);

  // Keep refs updated
  useEffect(() => {
    latestPropsRef.current = {
      participants,
      pinnedParticipants,
      activeSpeakerId,
      localParticipant,
    };
  }, [participants, pinnedParticipants, activeSpeakerId, localParticipant]);

  // LAYER 1: SAMPLER (50ms)
  // High-frequency sampling of the active speaker signal
  useEffect(() => {
    const sampleInterval = setInterval(() => {
      const { activeSpeakerId, participants } = latestPropsRef.current;

      if (activeSpeakerId && participants.has(activeSpeakerId)) {
        const counts = speakerCountRef.current;
        counts.set(activeSpeakerId, (counts.get(activeSpeakerId) || 0) + 1);
      }
    }, SAMPLING_INTERVAL);

    return () => clearInterval(sampleInterval);
  }, []);

  // LAYER 2: ANALYZER (300ms)
  // Determines dominant speaker in the window and assigns scores
  useEffect(() => {
    const analyzeInterval = setInterval(() => {
      const { participants } = latestPropsRef.current;
      const counts = speakerCountRef.current;
      const scores = scoresRef.current;

      // Find dominant speaker in this window
      let dominantSpeakerId = null;
      let maxCount = 2;

      for (const [id, count] of counts.entries()) {
        if (participants.has(id)) {
          if (count > maxCount) {
            maxCount = count;
            dominantSpeakerId = id;
          }
        }
        // Reset count for next window
        counts.set(id, 0);
      }

      // Boost dominant speaker score
      if (dominantSpeakerId) {
        console.log(
          participants.get(dominantSpeakerId)?.displayName,
          "dominantSpeakerId",
        );

        const currentScore = scores.get(dominantSpeakerId) || 0;
        scores.set(dominantSpeakerId, Math.min(100, currentScore + 1)); // Significant boost
      }
    }, ANALYZER_INTERVAL);

    return () => clearInterval(analyzeInterval);
  }, []);

  // LAYER 3: UPDATER (600ms)
  // Decays scores, sorts participants, and updates the UI state
  // We track page in a ref for the interval to prevent stale closure issues without re-binding
  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const { participants, pinnedParticipants, localParticipant } =
        latestPropsRef.current;
      const scores = scoresRef.current;
      const currentPage = pageRef.current;

      // 1. Garbage Collect & Decay Scores
      for (const [id, score] of scores.entries()) {
        if (!participants.has(id)) {
          scores.delete(id);
        } else {
          scores.set(id, Math.max(BASE_SCORE, score * DECAY_RATE));
        }
      }

      // 2. Identify Groups
      const pinnedIds = [...pinnedParticipants.keys()].filter(
        (id) => id !== localParticipant.id,
      );
      const regularIds = [...participants.keys()].filter(
        (id) => id !== localParticipant.id && !pinnedParticipants.has(id),
      );

      // 3. Sort Regular Participants by Score
      regularIds.sort((a, b) => {
        const scoreA = scores.get(a) || BASE_SCORE;
        const scoreB = scores.get(b) || BASE_SCORE;
        return scoreB - scoreA;
      });

      // 4. Construct Full Ordered List
      const allSortedIds = [localParticipant.id, ...pinnedIds, ...regularIds];

      // console.log(allSortedIds.map((id) => ({ "name": participants.get(id)?.displayName, "score": scores.get(id) || 0 })), "allSortedIds")

      // 5. Handle Pagination
      const totalLen = allSortedIds.length;
      // Ensure page is valid if list shrunk
      const maxPage = Math.max(0, Math.ceil(totalLen / pageSize) - 1);
      const validPage = Math.min(currentPage, maxPage);

      // Page-stable sorting algorithm (Optimized)
      // Keeps participants stable on the current page if they are still in the ideal list for that page
      const getPageParticipants = (pageIndex, allIds, size, currentIds) => {
        const startIdx = pageIndex * size;
        const endIdx = startIdx + size;
        const idealPageIds = allIds.slice(startIdx, endIdx);

        // If not checking stability (switching pages) or no previous state, return ideal
        if (!currentIds || currentIds.length === 0) {
          return idealPageIds;
        }

        const currentSet = new Set(currentIds);
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

        for (const id of currentIds) {
          if (toKeepSet.has(id)) {
            result.push(id);
          } else if (addPointer < toAdd.length) {
            result.push(toAdd[addPointer++]);
          }
          if (result.length >= size) break;
        }

        while (result.length < size && addPointer < toAdd.length) {
          result.push(toAdd[addPointer++]);
        }

        return result;
      };

      setParticipantIds((prevIds) => {
        if (validPage !== currentPage) {
          const start = validPage * pageSize;
          const end = start + pageSize;
          return allSortedIds.slice(start, end);
        }

        return getPageParticipants(validPage, allSortedIds, pageSize, prevIds);
      });

      // Sync page state if it was auto-corrected
      if (validPage !== currentPage) {
        setPage(validPage);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(updateInterval);
  }, [pageSize]); // Restart if pagesize changes (presenting toggles)

  return (
    <>
      <MemoizedParticipantGrid
        participantIds={participantIds}
        isPresenting={isPresenting}
        totalPages={totalPages}
        setPage={setPage}
        page={page}
      />
      {/* Optimization for hidden participants: Render audio only */}
      <div className="hidden-participants-audio" style={{ display: "none" }}>
        {[...participants.keys()]
          .filter((id) => !participantIds.includes(id))
          .map((id) => (
            <ParticipantAudio key={id} participantId={id} />
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
