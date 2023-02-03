import { CheckIcon, ClipboardIcon } from "@heroicons/react/outline";
import { Constants } from "@videosdk.live/react-sdk";
import React, { useState } from "react";

import { meetingTypes } from "../utils/common";

export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  setParticipantName,
  videoTrack,
  setVideoTrack,
  onClickStartMeeting,
  setMeetingMode,
  meetingMode,
  meetingType,
  setMeetingType,
}) {
  const [meetingId, setMeetingId] = useState("qygi-snnu-2hvd");
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iscreateMeetingClicked, setIscreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);

  const selectType = [
    { label: "Meeting", value: meetingTypes.MEETING },
    { label: "Interactive Live Streaming", value: meetingTypes.ILS },
  ];

  return (
    <div className={`flex flex-1 flex-col w-full md:p-[6px] sm:p-1 p-1.5`}>
      {iscreateMeetingClicked ? (
        <div className="border border-solid border-gray-400 rounded-xl px-4 py-3  flex items-center justify-center">
          <p className="text-white text-base">
            {meetingType === meetingTypes.MEETING
              ? `Meeting code : ${meetingId}`
              : `Studio code : ${meetingId}`}
          </p>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <>
          <input
            defaultValue={meetingId}
            onChange={(e) => {
              setMeetingId(e.target.value);
            }}
            placeholder={
              meetingType === meetingTypes.MEETING
                ? "Enter meeting Id"
                : "Enter studio code"
            }
            className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          {meetingIdError && (
            <p className="text-xs text-red-600">{`Please enter valid ${
              meetingType === meetingTypes.MEETING ? "meetingId" : "studioCode"
            }`}</p>
          )}
        </>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-3 mt-5 bg-gray-650 rounded-xl text-white w-full text-center"
          />

          {/* <p className="text-xs text-white mt-1 text-center">
            Your name will help everyone identify you in the meeting.
          </p> */}
          <button
            disabled={participantName.length < 3}
            className={`w-full ${
              participantName.length < 3 ? "bg-gray-650" : "bg-purple-350"
            }  text-white px-2 py-3 rounded-xl mt-5`}
            onClick={(e) => {
              if (iscreateMeetingClicked) {
                if (videoTrack) {
                  videoTrack.stop();
                  setVideoTrack(null);
                }
                onClickStartMeeting();
              } else {
                if (meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
                  onClickJoin(meetingId);
                } else setMeetingIdError(true);
              }
            }}
          >
            {meetingType === meetingTypes.MEETING
              ? iscreateMeetingClicked
                ? "Start a meeting"
                : "Join a meeting"
              : iscreateMeetingClicked
              ? "Start a meeting"
              : isJoinMeetingClicked &&
                meetingMode === Constants.modes.CONFERENCE
              ? "Join Studio"
              : "Join Streaming Room"}
          </button>
        </>
      )}

      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="w-full md:mt-0 mt-4 flex flex-col">
          <p className="text-white text-base">Select Type</p>
          <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row justify-between w-full mb-4">
            {selectType.map((item, index) => (
              <div
                key={`radio_${index}`}
                className={`flex  ${
                  index === 1 ? "flex-1 md:ml-2 lg:ml-0 xl:ml-2" : "2xl:flex-1"
                } items-center mb-2 md:mb-4 mt-2 lg:mb-2 xl:mb-4 bg-gray-650 rounded-lg`}
              >
                <input
                  id={`radio${index}`}
                  type="radio"
                  name="radio"
                  className="hidden"
                  value={item.value}
                  onChange={(e) => {
                    setMeetingType(e.target.value);
                  }}
                  checked={meetingType === item.value}
                />
                <label
                  htmlFor={`radio${index}`}
                  className="flex items-center cursor-pointer text-white w-full px-2 py-2 lg:w-full xl:px-2 xl:py-2"
                >
                  <span className="w-4 h-4 inline-block mr-2 rounded-full border border-grey"></span>
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center flex-col w-full mt-2">
            {meetingType === meetingTypes.ILS ? (
              <>
                <button
                  className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
                  onClick={async (e) => {
                    const meetingId = await _handleOnCreateMeeting();
                    setMeetingId(meetingId);
                    setIscreateMeetingClicked(true);
                    if (meetingType === meetingTypes.ILS) {
                      setMeetingMode(Constants.modes.CONFERENCE);
                    }
                  }}
                >
                  Create a meeting
                </button>

                <button
                  className="w-full bg-purple-350 text-white px-2 py-3 mt-5 rounded-xl"
                  onClick={async (e) => {
                    setIsJoinMeetingClicked(true);
                    if (meetingType === meetingTypes.ILS) {
                      setMeetingMode(Constants.modes.CONFERENCE);
                    }
                  }}
                >
                  Join as a Host
                </button>
                <button
                  className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
                  onClick={(e) => {
                    setIsJoinMeetingClicked(true);
                    if (meetingType === meetingTypes.ILS) {
                      setMeetingMode(Constants.modes.VIEWER);
                    }
                  }}
                >
                  Join as a Viewer
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
                  onClick={async (e) => {
                    const meetingId = await _handleOnCreateMeeting();
                    setMeetingId(meetingId);
                    setIscreateMeetingClicked(true);
                    if (meetingType === meetingTypes.ILS) {
                      setMeetingMode(Constants.modes.CONFERENCE);
                    }
                  }}
                >
                  Create a meeting
                </button>
                <button
                  className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
                  onClick={(e) => {
                    setIsJoinMeetingClicked(true);
                    if (meetingType === meetingTypes.ILS) {
                      setMeetingMode(Constants.modes.VIEWER);
                    }
                  }}
                >
                  Join a meeting
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
