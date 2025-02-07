import { useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePubSub } from "@videosdk.live/react-sdk";
import { sideBarModes } from "../../../utils/common";
import { Input, Label } from "@windmill/react-ui";
import { XIcon } from "@heroicons/react/outline";
import { useMeetingAppContext } from "../../../MeetingAppContextDef";

const CreatePollPart = ({
  isMarkAsCorrectChecked,
  setIsMarkAsCorrectChecked,
  isSetTimerChecked,
  setIsSetTimerChecked,
  question,
  setQuestion,
  questionErr,
  option,
  setOption,
  options,
  setOptions,
  setTimer,
  _handleKeyDown,
  timer,
  timerErr,
  correctAnswerErr,
  minOptionErr,
  optionErr,
}) => {
  const createOptionRef = useRef(null);
  //for timer
  const pollTimerArr = useMemo(() => {
    const pollTimerArr = [{ value: 30, Label: "30 secs" }];
    for (let i = 1; i < 11; i++) {
      pollTimerArr.push({
        value: i * 60,
        Label: `${i} min${i === 1 ? "" : "s"}`,
      });
    }
    return pollTimerArr;
  }, []);

  const focusCreateOption = () => {
    setTimeout(() => {
      createOptionRef.current.focus();
    }, 500);
  };

  return (
    <div className={`flex flex-col xl:m-4 m-2 overflow-y-auto`}>
      <input
        type="text"
        className="bg-gray-750  text-white text-sm rounded block w-full p-2.5 border border-gray-600 placeholder-gray-400 focus:ring-0 focus:border-purple-550"
        placeholder="What you want to ask ?"
        autoFocus
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {questionErr && (
        <div className="mt-[2px]">
          <p className="text-xs text-red-150">Please enter proper question.</p>
        </div>
      )}

      <div className="mt-6">
        {/* option list  */}
        <div>
          {options.length > 0 && (
            <div>
              {options.map((item) => {
                return (
                  <div className="flex items-center mb-4">
                    {isMarkAsCorrectChecked && item.option.length !== 0 && (
                      <Input
                        type="checkbox"
                        value={item.isCorrect}
                        checked={item.isCorrect === true}
                        onChange={() => {
                          setOptions(
                            options.map((option) => {
                              if (option.optionId === item.optionId) {
                                option.isCorrect = !option.isCorrect;
                              } else {
                                option.isCorrect = false;
                              }
                              return option;
                            })
                          );
                        }}
                        className="bg-transparent rounded-xl h-5 w-5 border-2 border-gray-300 focus:outline-none focus:border-gray-300 focus:ring-0"
                      />
                    )}
                    <div
                      className={` ${
                        item.isCorrect && item.option !== ""
                          ? "bg-purple-550"
                          : "bg-customGray-900"
                      } w-full relative rounded  ${
                        isMarkAsCorrectChecked && item.option !== ""
                          ? "ml-2"
                          : "ml-0"
                      }`}
                    >
                      <input
                        type="text"
                        className={`border-none ${
                          item.isCorrect && item.option !== ""
                            ? "bg-purple-550"
                            : "bg-customGray-900"
                        } text-white focus:ring-0 rounded-l`}
                        placeholder="Add your options"
                        autocomplete="off"
                        value={item.option}
                        onBlur={_handleKeyDown}
                        onChange={(e) => {
                          setOptions(
                            options.map((option) => {
                              if (option.optionId === item.optionId) {
                                option.option = e.target.value;
                                if (e.target.value === "" && item.isCorrect) {
                                  option.isCorrect = false;
                                }
                              }
                              return option;
                            })
                          );
                        }}
                      />
                      <button
                        className="absolute right-2 top-2.5"
                        onClick={() => {
                          setOptions((options) => {
                            const newOptions = options.filter(
                              ({ optionId }) => {
                                return optionId !== item.optionId;
                              }
                            );
                            return newOptions;
                          });
                        }}
                      >
                        <XIcon
                          className={`h-5 w-5 ${
                            item.isCorrect && item.option !== ""
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* end of option list */}

        <div>
          {/* old Text */}
          <div className="flex">
            {isMarkAsCorrectChecked && option.option && (
              <Input
                type="checkbox"
                value={option.isCorrect}
                checked={option.isCorrect === true}
                onChange={(e) => {
                  setOptions((options) => {
                    return [
                      ...options.map((option) => {
                        return { ...option, isCorrect: false };
                      }),
                      {
                        ...option,
                        isCorrect: e.target.checked,
                      },
                    ];
                  });

                  setOption({
                    option: "",
                    isCorrect: false,
                  });
                }}
                className="bg-transparent rounded-xl h-5 w-5 border-2 border-gray-300 focus:outline-none focus:border-gray-300 focus:ring-0"
              />
            )}
            <input
              type={"text"}
              placeholder="Add your options"
              inputref={createOptionRef}
              className={`border-none ${
                option.isCorrect && option.option
                  ? "bg-purple-550"
                  : "bg-customGray-900"
              }  ${
                isMarkAsCorrectChecked && option.option ? "ml-2" : "ml-0"
              } text-white focus:ring-0 rounded w-full`}
              ref={createOptionRef}
              autoComplete="off"
              value={option.option}
              onChange={(e) =>
                setOption({
                  optionId: uuid(),
                  option: e.target.value,
                  isCorrect: !!option.isCorrect,
                })
              }
              onKeyDown={_handleKeyDown}
              onBlur={_handleKeyDown}
            />
          </div>
          {/* end of old Text */}

          {/* dummy Text */}
          {option?.option?.length > 0 && (
            <div style={{ display: "flex" }}>
              <input
                type={"text"}
                placeholder="Add your options"
                autocomplete="off"
                onChange={(e) => {}}
                onFocus={(e) => {
                  _handleKeyDown(e);
                  focusCreateOption();
                }}
                className="w-full bg-customGray-900 mt-4 focus:ring-0 rounded"
              />
            </div>
          )}
          {/* end of dummy Text */}

          {minOptionErr && (
            <p className="text-xs text-red-150 mt-1">
              Please add atleast 2 options.
            </p>
          )}
          {optionErr && (
            <p className="text-xs text-red-150 mt-1">
              Please enter valid option value.
            </p>
          )}
          <div className="mt-8">
            <div className="flex items-center pl-1">
              <Label check>
                <Input
                  type="checkbox"
                  onClick={(e) => {
                    setIsMarkAsCorrectChecked((s) => !s);
                  }}
                  className="bg-transparent h-5 w-5 border-2 border-gray-300 focus:outline-none focus:border-gray-300 focus:ring-0"
                />
                <p className="text-base text-white ml-3">Mark correct option</p>
              </Label>
            </div>
            {correctAnswerErr && (
              <p className="text-xs text-red-150 mt-1">
                {
                  "Please check any one option as correct if `isMarkAsCorrectChecked`"
                }
              </p>
            )}
            <div className="flex flex-col">
              <div className="flex items-center flex-row mt-5 relative">
                <div className="flex items-center pl-1">
                  <Label check>
                    <Input
                      type="checkbox"
                      onClick={(e) => {
                        setIsSetTimerChecked((s) => !s);
                      }}
                      className="bg-transparent h-5 w-5 border-2 border-gray-300 focus:outline-none focus:border-gray-300 focus:ring-0"
                    />
                    <p className="text-base text-white ml-3">Set Timer</p>
                  </Label>
                </div>
                {isSetTimerChecked && (
                  <select
                    value={timer}
                    onChange={(e) => {
                      setTimer(e.target.value);
                    }}
                    className="ml-3 absolute left-1/3 -bottom-1 right-0 form-select cursor-pointer appearance-none block w-2/6  px-3 py-1.5 text-base font-normal text-white bg-gray-700  border-none rounded transition ease-in-out m-0 focus:text-white focus:bg-gray-700 focus:border-none focus:outline-none focus:ring-0"
                  >
                    {pollTimerArr.map((item) => {
                      return (
                        <option className="cursor-pointer" value={item.value}>
                          {item.Label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div className="mt-1 ml-1">
                {timerErr && (
                  <p className="text-xs text-red-150">
                    {"Timer should be more than 30 seconds."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PollButtonPart = ({
  publishCreatePoll,
  publishDraftPoll,
  question,
  options,
  timer,
  setQuestionErr,
  isMarkAsCorrectChecked,
  isSetTimerChecked,
  setTimerErr,
  setCorrectAnswerErr,
  setMinOptionErr,
  setOptionErr,
}) => {
  const { polls, setSideBarMode } = useMeetingAppContext();
  const singleOption = options?.map((option) => {
    return option.option;
  });

  const handleValidation = ({
    question,
    options,
    isSetTimerChecked,
    timer,
    isMarkAsCorrectChecked,
  }) => {
    let isValid = true;

    if (
      question.length >= 2 &&
      /^[^-\s][a-zA-Z0-9_!@#$%^&*()`~.,<>{}[\]<>?_=+\-|;:\\'\"\/\s-]+$/i.test(
        question.trim()
      )
    ) {
      setQuestionErr(false);
    } else {
      isValid = false;
      setQuestionErr(true);
      return false;
    }

    if (options?.length < 2) {
      isValid = false;
      setMinOptionErr(true);
      return false;
    } else {
      setMinOptionErr(false);
    }

    for (let i = 0; i < singleOption.length; i++) {
      if (singleOption[i].length < 1) {
        isValid = false;
        setOptionErr(true);
        return false;
      } else {
        setOptionErr(false);
      }
    }

    // check time timer if `isSetTimerChecked`
    if (isSetTimerChecked && timer < 30) {
      isValid = false;
      setTimerErr(true);
      return false;
    } else {
      setTimerErr(false);
    }

    if (
      isMarkAsCorrectChecked &&
      options.findIndex(({ isCorrect }) => isCorrect) === -1
    ) {
      // please check any one option as correct if `isMarkAsCorrectChecked`
      isValid = false;
      setCorrectAnswerErr(true);
      return false;
    } else {
      setCorrectAnswerErr(false);
    }

    return isValid;
  };

  return (
    <div className="flex xl:pt-4 xl:pb-2 xl:pl-4 xl:pr-4 pt-2 pb-1 pl-2 pr-2">
      <button
        className="w-1/2 bg-gray-700 text-white p-2 rounded"
        onClick={() => {
          const isValid = handleValidation({
            question,
            options,
            isSetTimerChecked,
            isMarkAsCorrectChecked,
            timer,
          });

          if (isValid) {
            publishDraftPoll(
              {
                id: uuid(),
                question: question.trim(),
                options: options.map((option) => ({
                  ...option,
                  option: option.option.trim(),
                })),
                timeout: isSetTimerChecked ? timer : 0,
                hasCorrectAnswer: isMarkAsCorrectChecked ? true : false,
                hasTimer: isSetTimerChecked ? true : false,
                isActive: false,
              },
              {
                persist: true,
              }
            );
            setSideBarMode(sideBarModes.POLLS);
          }
        }}
      >
        Save
      </button>
      <button
        className="w-1/2 ml-2 p-2 text-white bg-purple-550 rounded"
        onClick={() => {
          const isValid = handleValidation({
            question,
            options,
            isSetTimerChecked,
            isMarkAsCorrectChecked,
            timer,
          });

          if (isValid) {
            publishCreatePoll(
              {
                id: uuid(),
                question: question.trim(),
                options: options.map((option) => ({
                  ...option,
                  option: option.option.trim(),
                })),
                timeout: isSetTimerChecked ? timer : 0,
                hasCorrectAnswer: isMarkAsCorrectChecked ? true : false,
                hasTimer: isSetTimerChecked ? true : false,
                isActive: true,
                index: polls.length + 1,
              },
              { persist: true }
            );
            setSideBarMode(sideBarModes.POLLS);
          }
        }}
      >
        Launch
      </button>
    </div>
  );
};

const CreatePoll = ({ panelHeight }) => {
  const [isMarkAsCorrectChecked, setIsMarkAsCorrectChecked] = useState(false);
  const [isSetTimerChecked, setIsSetTimerChecked] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionErr, setQuestionErr] = useState(false);
  const [optionErr, setOptionErr] = useState(false);
  const [option, setOption] = useState({
    optionId: uuid(),
    option: null,
    isCorrect: false,
  });
  const [options, setOptions] = useState([]);
  const [timer, setTimer] = useState(30);
  const [timerErr, setTimerErr] = useState(false);
  const [correctAnswerErr, setCorrectAnswerErr] = useState(false);
  const [minOptionErr, setMinOptionErr] = useState(false);

  const _handleKeyDown = (e) => {
    if (
      e.key === "Enter" ||
      e.type === "mouseleave" ||
      e.type === "focus" ||
      e.type === "blur"
    ) {
      if (option?.option?.length >= 1 && option?.option.trim()) {
        e.preventDefault();
        setOptions([...options, option]);
        setOption({ option: "", isCorrect: false });
      }
    }
  };

  const { publish: publishCreatePoll } = usePubSub(`CREATE_POLL`);
  const { publish: publishDraftPoll } = usePubSub(`DRAFT_A_POLL`);
  const Height = panelHeight;

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: Height }}
    >
      <div className="flex flex-col justify-between flex-1 h-full">
        <CreatePollPart
          isMarkAsCorrectChecked={isMarkAsCorrectChecked}
          setIsMarkAsCorrectChecked={setIsMarkAsCorrectChecked}
          isSetTimerChecked={isSetTimerChecked}
          setIsSetTimerChecked={setIsSetTimerChecked}
          question={question}
          setQuestion={setQuestion}
          questionErr={questionErr}
          option={option}
          setOption={setOption}
          options={options}
          setOptions={setOptions}
          _handleKeyDown={_handleKeyDown}
          setTimer={setTimer}
          timer={timer}
          timerErr={timerErr}
          correctAnswerErr={correctAnswerErr}
          minOptionErr={minOptionErr}
          optionErr={optionErr}
        />
        <PollButtonPart
          publishCreatePoll={publishCreatePoll}
          publishDraftPoll={publishDraftPoll}
          question={question}
          options={options}
          timer={timer}
          setQuestionErr={setQuestionErr}
          isMarkAsCorrectChecked={isMarkAsCorrectChecked}
          isSetTimerChecked={isSetTimerChecked}
          setTimerErr={setTimerErr}
          setCorrectAnswerErr={setCorrectAnswerErr}
          setMinOptionErr={setMinOptionErr}
          setOptionErr={setOptionErr}
        />
      </div>
    </div>
  );
};

export default CreatePoll;
