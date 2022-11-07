import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { sideBarModes } from "../../../components/MeetingContainer/MeetingContainer";
import useResponsiveSize from "../../../hooks/useResponsiveSize";

export const secondsToMinutes = (time) => {
  var minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  var seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return minutes + " : " + seconds;
};

const Poll = ({ poll, isDraft, publishDraftPoll }) => {
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

  const equalSpacing = useResponsiveSize({
    xl: 18,
    lg: 16,
    md: 14,
    sm: 12,
    xs: 10,
  });

  const { publish: EndPublish } = usePubSub(`END_POLL`);

  const { hasCorrectAnswer, hasTimer, timeout, createdAt, isActive, index } =
    poll;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPollActive, setIsTimerPollActive] = useState(false);

  const mMeeting = useMeeting();

  const localParticipantId = useMemo(
    () => mMeeting?.localParticipant?.id,
    [mMeeting]
  );

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
    const localSubmittedOption = poll?.submissions?.find(
      ({ participantId }) => participantId === localParticipantId
    );

    const totalSubmissions = poll?.submissions?.length || 0;

    const groupedSubmissionCount = poll?.submissions?.reduce(
      (group, { optionId }) => {
        group[optionId] = group[optionId] || 0;

        group[optionId] += 1;

        return group;
      },
      {}
    );

    const maxSubmittedOptions = [];

    const maxSubmittedOptionId =
      groupedSubmissionCount &&
      Object.keys(groupedSubmissionCount)
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

    groupedSubmissionCount &&
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
    <div
      style={{
        borderBottom: "1px solid #70707033",
      }}
    >
      <div
        style={{
          margin: padding,
          marginTop: marginY,
          marginBottom: marginY,
        }}
      >
        <div className="flex items-center p-0 m-0">
          <p className="text-sm text-gray-900 font-medium my-0">{`Poll ${
            index || ""
          }`}</p>
          <p className="mx-2 text-gray-900 font-medium my-0">&#x2022;</p>
          <p
            className={`mx-2 text-sm ${
              isPollActive || isDraft ? "text-orange-350" : "text-gray-900"
            }  font-medium my-0`}
          >
            {isPollActive
              ? hasTimer
                ? `Ends in ${secondsToMinutes(timeLeft)}`
                : "Live"
              : isDraft
              ? "Draft"
              : "Ended"}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-base text-white font-semibold">{poll.question}</p>
          {poll.options.map((item, j) => {
            const total = groupedSubmissionCount
              ? groupedSubmissionCount[item.optionId]
              : 0;

            const percentage = (total ? total / totalSubmissions : 0) * 100;

            const isCorrectOption = item.isCorrect;

            return (
              <div
                style={{
                  marginTop: j === 0 ? equalSpacing : equalSpacing / 2,
                }}
              >
                <p className="text-[15px] text-white font-normal">
                  {item.option}
                </p>
                <div className="mt-0 flex items-center">
                  <div className="h-[6px] rounded flex flex-1 bg-gray-700">
                    <div
                      className={`${
                        hasCorrectAnswer
                          ? isCorrectOption
                            ? "bg-purple-550"
                            : "bg-customGray-850"
                          : maxSubmittedOptions.includes(item.optionId)
                          ? "bg-purple-550"
                          : "bg-customGray-850"
                      } rounded`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {!isDraft && (
                    <div className="ml-6 w-10 flex items-end justify-end">
                      <p className="m-0 p-0 text-white">{`${Math.floor(
                        percentage
                      )}%`}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="flex items-end justify-end"
            style={{ marginBottom: equalSpacing }}
          >
            {isDraft ? (
              <button
                className="border border-gray-100 px-1.5 py-0.5 rounded text-white"
                onClick={() => {
                  publishDraftPoll(poll);
                }}
                style={{ marginTop: equalSpacing + 2 }}
              >
                Launch
              </button>
            ) : null}
            {isPollActive && !hasTimer ? (
              <button
                className="border border-gray-100 px-1.5 py-0.5 rounded text-white"
                style={{ marginTop: equalSpacing + 2 }}
                onClick={() => {
                  EndPublish(
                    {
                      pollId: poll.id,
                    },
                    { persist: true }
                  );
                }}
              >
                End the Poll
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const PollList = ({ panelHeight, polls, draftPolls, setSideBarMode }) => {
  const { publish: RemoveFromDraftPublish } = usePubSub(
    `REMOVE_POLL_FROM_DRAFT`
  );
  const { publish: publishCreatePoll } = usePubSub(`CREATE_POLL`);

  const totalPolls = useMemo(() => polls?.length || 0, [polls]);

  const padding = useResponsiveSize({
    xl: 12,
    lg: 10,
    md: 8,
    sm: 6,
    xs: 4,
  });

  const equalSpacing = useResponsiveSize({
    xl: 18,
    lg: 16,
    md: 14,
    sm: 12,
    xs: 10,
  });

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{
        height: panelHeight - 14,
      }}
    >
      <div className="flex flex-1 flex-col justify-between h-full">
        <div className="flex flex-col overflow-y-auto ">
          {draftPolls?.map((poll, index) => {
            return (
              <Poll
                key={`draft_polls_${poll.id}`}
                poll={poll}
                panelHeight={panelHeight}
                index={index}
                isDraft={true}
                publishDraftPoll={(poll) => {
                  //
                  RemoveFromDraftPublish(
                    { pollId: poll.id },
                    { persist: true }
                  );
                  //
                  publishCreatePoll(
                    {
                      id: uuid(),
                      question: poll.question,
                      options: poll.options,
                      // createdAt: new Date(),
                      timeout: poll.timeout,
                      hasTimer: poll.hasTimer,
                      hasCorrectAnswer: poll.hasCorrectAnswer,
                      isActive: true,
                      index: polls.length + 1,
                    },
                    { persist: true }
                  );
                  //
                  // setSideBarNestedMode(sideBarNestedModes.POLLS);
                }}
              />
            );
          })}
          {polls?.map((poll, index) => {
            return (
              <Poll
                key={`creator_polls_${poll.id}`}
                // totalPolls={totalPolls}
                poll={poll}
                panelHeight={panelHeight}
                index={index}
              />
            );
          })}
        </div>
        <div style={{ padding: padding, marginTop: equalSpacing }}>
          <button
            className="w-full text-white p-3 bg-purple-550"
            onClick={() => {
              setSideBarMode(sideBarModes.CREATE_POLL);
              // setSideBarNestedMode(sideBarNestedModes.CREATE_POLL);
            }}
          >
            Create new poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollList;
