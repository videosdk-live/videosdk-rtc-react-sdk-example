import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  },
);

function ParticipantGrid({
  participantIds,
  isPresenting,
  totalPages,
  page,
  setPage,
}) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)",
  ).matches;

  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  const perRow =
    isMobile || isPresenting
      ? participantIds.length < 4
        ? 1
        : participantIds.length < 9
          ? 2
          : 3
      : participantIds.length < 5
        ? 2
        : participantIds.length < 7
          ? 3
          : participantIds.length < 9
            ? 4
            : participantIds.length < 10
              ? 3
              : participantIds.length < 11
                ? 4
                : 4;

  return (
    <div
      className={`relative flex flex-col md:flex-row flex-grow m-3 items-center justify-center ${
        participantIds.length < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-2"
          : participantIds.length < 3 && !sideBarMode && !isPresenting
            ? "md:px-16 md:py-8"
            : participantIds.length < 4 && !sideBarMode && !isPresenting
              ? "md:px-16 md:py-4"
              : participantIds.length > 4 && !sideBarMode && !isPresenting
                ? "md:px-14"
                : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participantIds.length / perRow) },
          (_, i) => {
            return (
              <div
                key={`participant-${i}`}
                className={`flex flex-1 ${
                  isPresenting
                    ? participantIds.length === 1
                      ? "justify-start items-start"
                      : "items-center justify-center"
                    : "items-center justify-center"
                }`}
              >
                {participantIds
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        className={`flex flex-1 ${
                          isPresenting
                            ? participantIds.length === 1
                              ? "md:h-48 md:w-44 xl:w-52 xl:h-48 "
                              : participantIds.length === 2
                                ? "md:w-44 xl:w-56"
                                : "md:w-44 xl:w-48"
                            : "w-full"
                        } items-center justify-center h-full ${
                          participantIds.length === 1
                            ? "md:max-w-7xl 2xl:max-w-[1480px] "
                            : "md:max-w-lg 2xl:max-w-2xl"
                        } overflow-clip overflow-hidden  p-1`}
                      >
                        <MemoizedParticipant participantId={participantId} />
                      </div>
                    );
                  })}
              </div>
            );
          },
        )}
        {!isPresenting && isMobile && totalPages > 1 && (
          <div className="flex items-center justify-center w-full mt-2">
            <div className="flex items-center bg-gray-750 px-4 py-2 rounded-lg space-x-4 shadow-lg">
              <button
                disabled={isFirstPage}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-transform"
              >
                <ChevronLeftIcon width={24} fill="#ffffff" />
              </button>

              <span className="text-white font-medium text-sm tabular-nums">
                {page + 1} / {totalPages}
              </span>

              <button
                disabled={isLastPage}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-transform"
              >
                <ChevronRightIcon width={24} fill="#ffffff" />
              </button>
            </div>
          </div>
        )}
      </div>
      {!isPresenting && !isMobile && (
        <button
          disabled={isLastPage}
          onClick={(e) => setPage((page) => Math.min(totalPages - 1, page + 1))}
          className="absolute py-3 px-1.5 bg-gray-750 right-2  disabled:opacity-60  top-1/2 -translate-y-1/2 transition-transform  disabled:cursor-not-allowed hover:scale-125"
        >
          <ChevronRightIcon width={30} fill="#ffffff" />
        </button>
      )}
      {!isPresenting && !isMobile && (
        <button
          disabled={isFirstPage}
          onClick={(e) => setPage((page) => Math.max(0, page - 1))}
          className="absolute py-3 px-1.5 bg-gray-750 left-2 top-1/2  disabled:opacity-60 -translate-y-1/2 transition-transform  disabled:cursor-not-allowed  hover:scale-125"
        >
          <ChevronLeftIcon width={30} fill="#ffffff" />
        </button>
      )}
    </div>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
        JSON.stringify(nextProps.participantIds) &&
      prevProps.page === nextProps.page &&
      prevProps.totalPages === nextProps.totalPages &&
      prevProps.isPresenting === nextProps.isPresenting
    );
  },
);
