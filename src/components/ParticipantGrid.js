import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

// Helper function to determine the optimal number of columns
const getOptimalColumns = (participantCount, isPresenting) => {
  if (participantCount === 0) return 1; // Default to 1 to avoid division by zero or invalid grid
  if (isPresenting) { // Simplified logic for presentation mode, can be refined
    if (participantCount <= 2) return participantCount;
    if (participantCount <= 4) return 2;
    return 3; // Max 3 columns for smaller tiles during presentation
  }

  if (participantCount === 1) return 1;
  if (participantCount === 2) return 2;
  if (participantCount === 3) return 3;
  if (participantCount === 4) return 2; // 2x2 grid
  if (participantCount <= 6) return 3; // 3xN grid (3x1, 3x2)
  if (participantCount <= 9) return 3; // 3x3 grid
  if (participantCount <= 12) return 4; // 4x3 grid
  if (participantCount <= 16) return 4; // 4x4 grid
  // For larger numbers, aim for a somewhat square layout
  const sqrtCount = Math.sqrt(participantCount);
  return Math.ceil(sqrtCount);
};

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext(); // Retain for context if needed for outer padding
  const participantCount = participantIds.length;

  // Determine the number of columns for the grid
  const columns = getOptimalColumns(participantCount, isPresenting);

  // Define responsive column classes
  let gridColsClass;
  switch (columns) {
    case 1:
      gridColsClass = "grid-cols-1";
      break;
    case 2:
      gridColsClass = "grid-cols-1 md:grid-cols-2"; // Start with 1 on mobile, 2 on md+
      break;
    case 3:
      gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"; // Responsive columns
      break;
    case 4:
      gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // Responsive columns
      break;
    default: // For more than 4 base columns, apply directly, could also be responsive
      gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns > 4 ? 4 : columns}`; // Cap at 4 for lg for now for simplicity
      // A more robust solution might involve more breakpoints or direct style for grid-template-columns
  }
   if (columns > 4) gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${columns}`;


  // Simplified outer container styling, focusing on the grid itself
  return (
    <div className="flex flex-grow items-center justify-center m-3 w-full h-full">
      <div
        className={`grid ${gridColsClass} gap-3 w-full h-full items-center justify-center`}
        // style={{ maxHeight: "calc(100vh - SOME_HEADER_HEIGHT)" }} // Optional: if header/footer height is known
      >
        {participantIds.map((participantId) => (
          <div
            key={`participant_${participantId}`}
            className="relative w-full h-full overflow-hidden rounded-lg bg-gray-700 shadow-md" // Added rounded-lg and bg for placeholder
            // The aspect-video can be here if ParticipantView itself doesn't control aspect ratio
            // Or on a child div if ParticipantView needs to be wrapped further for other elements
          >
            <div className="aspect-video w-full h-full"> {/* Enforce aspect ratio */}
              <MemoizedParticipant participantId={participantId} />
            </div>
            {/* Placeholder for participant name or other overlays if needed later */}
            {/* <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-tr-lg">
              {participantId}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}

// It's good practice to ensure that the grid re-renders efficiently.
// The existing MemoizedParticipantGrid already compares participantIds and isPresenting.
// If getOptimalColumns becomes complex or relies on other external state via context,
// ensure this memoization is still effective or adjust accordingly.

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
        JSON.stringify(nextProps.participantIds) &&
      prevProps.isPresenting === nextProps.isPresenting
    );
  }
);
