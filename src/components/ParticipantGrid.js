import React, { useState } from "react";
import { useParams } from "react-router-dom";
import InvitePeopleIcon from "../icons/InvitePeopleIcon";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";
import { meetingTypes } from "../utils/common";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;
  const [isCopied, setIsCopied] = useState({ index: null, copied: false });
  const [isConfereceUrlCopied, setIsConfereceUrlCopied] = useState(false);

  if (
    participantIds.length === 1 &&
    !window.location.pathname.startsWith("/interactive-live-streaming/audience")
  )
    participantIds.push("");

  const { id, mode } = useParams();

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

  let HLSMeetigUrlArray = [
    {
      role: "Host",
      url: `${window.location.origin}/interactive-meeting/host/${id}`,
    },
    {
      role: "Co-host",
      url: `${window.location.origin}/interactive-meeting/co-host/${id}`,
    },
    {
      role: "Audience",
      url: `${window.location.origin}/interactive-meeting/audience/${id}`,
    },
  ];

  let ILSMeetigUrlArray = [
    {
      role: "Host",
      url: `${window.location.origin}/interactive-live-streaming/host/${id}`,
    },
    {
      role: "Audience",
      url: `${window.location.origin}/interactive-live-streaming/audience/${id}`,
    },
  ];

  return (
    <div
      className={`flex flex-col md:flex-row flex-grow m-3 items-center justify-center ${
        participantIds.length < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-8"
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
                            ? "md:max-w-full"
                            : participantIds.length === 2
                            ? "md:max-w-xl 2xl:max-w-2xl"
                            : "md:max-w-lg 2xl:max-w-2xl"
                        } overflow-clip overflow-hidden  p-1`}
                      >
                        {participantId === "" &&
                        !isPresenting &&
                        (!window.location.pathname.startsWith(
                          "/interactive-live-streaming/audience"
                        ) 
                         )
                           ? (
                          <div className="h-full w-full bg-gray-750 relative overflow-hidden rounded-lg px-9">
                            <div className="h-full w-full flex flex-col items-center justify-center ">
                              <InvitePeopleIcon />
                              <div className="mt-4">
                                <p className="text-2xl font-bold text-white">
                                  Invite others to demo
                                </p>
                              </div>
                              {mode === "host" || mode === "co-host" ? (
                                <div className="mt-9 grid grid-flow-row">
                                  {/* find other way */}
                                  {window.location.pathname.startsWith(
                                    "/interactive-live-streaming"
                                  )
                                    ? ILSMeetigUrlArray.map(
                                        ({ role, url }, i) => (
                                          <div
                                            key={`role_link_${i}`}
                                            className="flex w-full my-2.5 items-center justify-center"
                                          >
                                            <p className="text-lg text-white flex flex-1">
                                              {role}
                                            </p>
                                            <div
                                              className={`border border-customGray-250 rounded py-3 px-3 ml-2`}
                                            >
                                              <p className="text-[15px] text-white ">
                                                {`${
                                                  url.length > 35
                                                    ? `${url.slice(0, 35)}...`
                                                    : url
                                                }`}
                                              </p>
                                            </div>
                                            <div>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(
                                                    url
                                                  );
                                                  setIsCopied({
                                                    index: i,
                                                    copied: true,
                                                  });
                                                  setTimeout(() => {
                                                    setIsCopied({
                                                      index: null,
                                                      copied: false,
                                                    });
                                                  }, 5000);
                                                }}
                                                className="ml-2 bg-white text-black text-[15px] font-medium py-2.5 px-3 rounded w-28"
                                              >
                                                {isCopied.index === i &&
                                                isCopied.copied
                                                  ? "Link Copied"
                                                  : "Copy Link"}
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      )
                                    : HLSMeetigUrlArray.map(
                                        ({ role, url }, i) => (
                                          <div
                                            key={`role_link_${i}`}
                                            className="flex w-full my-2.5 items-center justify-center"
                                          >
                                            <p className="text-lg text-white flex flex-1">
                                              {role}
                                            </p>
                                            <div
                                              className={`border border-customGray-250 rounded py-3 px-3 ml-2`}
                                            >
                                              <p className="text-[15px] text-white ">
                                                {`${
                                                  url.length > 35
                                                    ? `${url.slice(0, 35)}...`
                                                    : url
                                                }`}
                                              </p>
                                            </div>
                                            <div>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(
                                                    url
                                                  );
                                                  setIsCopied({
                                                    index: i,
                                                    copied: true,
                                                  });
                                                  setTimeout(() => {
                                                    setIsCopied({
                                                      index: null,
                                                      copied: false,
                                                    });
                                                  }, 5000);
                                                }}
                                                className="ml-2 bg-white text-black text-[15px] font-medium py-2.5 px-3 rounded w-28"
                                              >
                                                {isCopied.index === i &&
                                                isCopied.copied
                                                  ? "Link Copied"
                                                  : "Copy Link"}
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      )}
                                </div>
                              ) : (
                                !window.location.pathname.startsWith(
                                  "/interactive-live-streaming/audience"
                                ) && 
                                  <div className="mt-9">
                                    <div className="border border-customGray-250 rounded py-3 px-3">
                                      <p className="text-[15px] text-white">
                                        {`${window.location.href}`}
                                      </p>
                                    </div>
                                    <div className="mt-3">
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            `${window.location.href}`
                                          );
                                          setIsConfereceUrlCopied(true);
                                          setTimeout(() => {
                                            setIsConfereceUrlCopied(false);
                                          }, 5000);
                                        }}
                                        className="bg-white text-black text-base font-medium py-2.5 w-full rounded"
                                      >
                                        {isConfereceUrlCopied
                                          ? "Link Copied"
                                          : "Copy Link"}
                                      </button>
                                    </div>
                                  </div>
                                )
                            }
                            </div>
                          </div>
                        ) : (
                          <MemoizedParticipant participantId={participantId} />
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

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
