import { Tooltip } from "@material-ui/core";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useMemo, useRef, useState, useEffect } from "react";
import useResponsiveSize from "../../../hooks/useResponsiveSize";
import AnswerSubmittedIcon from "../../../icons/Poll/AnswerSubmittedIcon";
import CorrectSelectedIcon from "../../../icons/Poll/CorrectSelectedIcon";
import NoPollActiveIcon from "../../../icons/Poll/NoPollActiveIcon";
import WrongOptionSelectedIcon from "../../../icons/Poll/WrongOptionSelectedIcon";
import { MarkCorrectCheckbox } from "./CreatePoll";
import { secondsToMinutes } from "./PollList";

const SubmitPollListItem = ({ poll }) => {
  const timerIntervalRef = useRef();

  const padding = useResponsiveSize({
    xl: 12,
    lg: 16,
    md: 8,
    sm: 6,
    xs: 4,
  });
  const marginY = useResponsiveSize({
    xl: 18,
    lg: 16,
    md: 14,
    sm: 12,
    xs: 10,
  });

  const mMeeting = useMeeting();

  const localParticipantId = useMemo(
    () => mMeeting?.localParticipant?.id,
    [mMeeting]
  );

  const { publish } = usePubSub(`SUBMIT_A_POLL_${poll.id}`);

  const { hasCorrectAnswer, hasTimer, timeout, createdAt, isActive, index } =
    poll;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPollActive, setIsTimerPollActive] = useState(false);

  const isPollActive = useMemo(
    () => (hasTimer ? isTimerPollActive : isActive),
    [hasTimer, isTimerPollActive, isActive]
  );

  const {
    localSubmittedOption,
    totalSubmissions,
    groupedSubmissionCount,
    maxSubmittedOptions,
  } = useMemo(() => {
    const localSubmittedOption = poll.submissions.find(
      ({ participantId }) => participantId === localParticipantId
    );

    const totalSubmissions = poll.submissions.length;

    const groupedSubmissionCount = poll.submissions.reduce(
      (group, { optionId }) => {
        group[optionId] = group[optionId] || 0;

        group[optionId] += 1;

        return group;
      },
      {}
    );

    const maxSubmittedOptions = [];

    const maxSubmittedOptionId = Object.keys(groupedSubmissionCount)
      .map((optionId) => ({
        optionId,
        count: groupedSubmissionCount[optionId],
      }))
      .sort((a, b) => {
        if (a.count > b.count) {
          return -1;
        }
        if (a.count < b.count) {
          return 1;
        }
        return 0;
      })[0]?.optionId;

    Object.keys(groupedSubmissionCount).forEach((optionId) => {
      if (
        groupedSubmissionCount[optionId] ===
        groupedSubmissionCount[maxSubmittedOptionId]
      ) {
        maxSubmittedOptions.push(optionId);
      }
    });

    return {
      localSubmittedOption,
      totalSubmissions,
      groupedSubmissionCount,
      maxSubmittedOptions,
    };
  }, [poll, localParticipantId]);

  const checkTimeOver = ({ timeout, createdAt }) =>
    !(new Date(createdAt).getTime() + timeout * 1000 > new Date().getTime());

  const updateTimer = ({ timeout, createdAt }) => {
    if (checkTimeOver({ timeout, createdAt })) {
      setTimeLeft(0);
      setIsTimerPollActive(false);
      clearInterval(timerIntervalRef.current);
    } else {
      setTimeLeft(
        (new Date(createdAt).getTime() +
          timeout * 1000 -
          new Date().getTime()) /
          1000
      );
      setIsTimerPollActive(true);
    }
  };

  useEffect(() => {
    if (hasTimer) {
      updateTimer({ timeout, createdAt });

      if (!checkTimeOver({ timeout, createdAt })) {
        timerIntervalRef.current = setInterval(() => {
          updateTimer({ timeout, createdAt });
        }, 1000);
      }
    }

    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div style={{ borderBottom: "1px solid #70707033" }}>
      <div
        style={{
          margin: padding,
          marginTop: marginY,
          marginBottom: marginY,
        }}
      >
        <div className="flex items-center p-0 m-0">
          <p className="text-sm text-gray-900 font-medium my-0">{`Poll ${index}`}</p>
          <p className="mx-2 text-gray-900 font-medium my-0">&#x2022;</p>
          <p
            className={`mx-2 text-sm ${
              isPollActive ? "text-orange-350" : "text-gray-900"
            }  font-medium my-0`}
          >
            {isPollActive
              ? hasTimer
                ? `Ends in ${secondsToMinutes(timeLeft)}`
                : "Live"
              : "Ended"}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-base text-white font-semibold">{poll.question}</p>
          <div className="mt-4">
            {localSubmittedOption || !isPollActive
              ? poll.options.map((option) => {
                  const total = groupedSubmissionCount[option.optionId];

                  const isOptionSubmittedByLocal =
                    localSubmittedOption?.optionId === option.optionId;

                  const percentage =
                    (total ? total / totalSubmissions : 0) * 100;

                  const isOptionSelectedByLocalIncorrect =
                    localSubmittedOption?.optionId === option.optionId &&
                    !option.isCorrect;

                  const isCorrectOption = option.isCorrect;

                  return (
                    <div className="flex mb-3">
                      <div className="mt-0 w-full">
                        <div className="flex items-center">
                          <p className="text-[15px] text-white font-normal">
                            {option.option}
                          </p>

                          {isPollActive ? (
                            isOptionSubmittedByLocal ? (
                              <div className="ml-2">
                                <AnswerSubmittedIcon />
                              </div>
                            ) : null
                          ) : hasCorrectAnswer ? (
                            isCorrectOption ? (
                              <Tooltip
                                placement="right"
                                title={"Correct Answer"}
                              >
                                <div className="ml-2 cursor-pointer">
                                  <CorrectSelectedIcon />
                                </div>
                              </Tooltip>
                            ) : isOptionSelectedByLocalIncorrect ? (
                              <Tooltip
                                placement="right"
                                title={"Your answer is wrong"}
                              >
                                <div className="ml-2 cursor-pointer">
                                  <WrongOptionSelectedIcon />
                                </div>
                              </Tooltip>
                            ) : null
                          ) : null}
                        </div>
                        <div className="flex items-center mt-0">
                          <div className="h-[6px] rounded flex flex-1 bg-gray-700">
                            <div
                              className={`${
                                hasCorrectAnswer && isPollActive
                                  ? "bg-orange-350"
                                  : hasCorrectAnswer && !isPollActive
                                  ? isCorrectOption
                                    ? "bg-purple-550"
                                    : "bg-orange-350"
                                  : maxSubmittedOptions.includes(
                                      option.optionId
                                    )
                                  ? "bg-purple-550"
                                  : "bg-orange-350"
                              } rounded`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="ml-6 w-10 flex items-end justify-end">
                            <p className="m-0 p-0 text-white">
                              {`${Math.floor(percentage)}%`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : poll?.options.map((option) => {
                  return (
                    <div className="flex mb-3">
                      <MarkCorrectCheckbox
                        onClick={() => {
                          publish(
                            { optionId: option.optionId },
                            { persist: true }
                          );
                        }}
                      />
                      <div
                        className="ml-8 w-full rounded bg-gray-700"
                        style={{ padding: "8px 8px 8px" }}
                      >
                        <p className="text-white">{option.option}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmitPollList = ({ panelHeight, polls }) => {
  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: panelHeight - 14 }}
    >
      <div className="flex flex-col flex-1 h-full">
        {polls?.length > 0 ? (
          polls?.map((poll, index) => {
            return (
              <SubmitPollListItem
                key={`submit_polls_${poll.id}`}
                totalPolls={polls.length}
                poll={poll}
                panelHeight={panelHeight}
                index={index}
              />
            );
          })
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center"
            style={{ marginTop: "-50px" }}
          >
            <NoPollActiveIcon />
            <p className="text-white text-base font-bold">
              No Poll has been launched yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPollList;
