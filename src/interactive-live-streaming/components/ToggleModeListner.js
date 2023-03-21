import { Popover, Transition } from "@headlessui/react";
import { DotsVerticalIcon } from "@heroicons/react/outline";
import {
  Constants,
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useRef, useState } from "react";
import ParticipantAddHostIcon from "../../icons/ParticipantTabPanel/ParticipantAddHostIcon";

const ToggleModeContainer = ({ participantId, participantMode }) => {
  const mMeetingRef = useRef();
  const mMeeting = useMeeting({});

  const { isLocal } = useParticipant(participantId);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { publish } = usePubSub(`CHANGE_MODE_${participantId}`, {});

  return (
    !isLocal && (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`
            ${open ? "" : "text-opacity-90"}
            group inline-flex items-center  m-1 p-1 text-base font-medium rounded-full hover:bg-gray-600 text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <DotsVerticalIcon
                className={`${open ? "" : "text-opacity-70"}
              h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80`}
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                className={`absolute ${
                  participantMode === Constants.modes.CONFERENCE
                    ? "w-48"
                    : "w-40"
                } left-full z-10 mt-1 -translate-x-full shadow-xl transform py-2.5  sm:px-0  bg-gray-750 rounded-sm hover:cursor-pointer`}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    publish(
                      JSON.stringify({
                        mode:
                          participantMode === Constants.modes.CONFERENCE
                            ? Constants.modes.VIEWER
                            : Constants.modes.CONFERENCE,
                      })
                    );
                    close();
                  }}
                  className=""
                >
                  <div className="flex flex-row hover:bg-customGray-350 px-3 py-0.5">
                    <div className="flex items-center justify-center">
                      <ParticipantAddHostIcon
                        fill={
                          participantMode === Constants.modes.CONFERENCE
                            ? "#fff"
                            : "#9E9EA7"
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                        marginLeft: 8,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          marginTop: 2,
                          color:
                            participantMode === Constants.modes.CONFERENCE
                              ? "#fff"
                              : "#9E9EA7",
                        }}
                      >
                        {participantMode === Constants.modes.CONFERENCE
                          ? "Remove from Co-host"
                          : "Add as a Co-host"}
                      </p>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    )
  );
};

export default ToggleModeContainer;
