import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Radio,
  styled,
  useTheme,
} from "@material-ui/core";
import { useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import useResponsiveSize from "../../../hooks/useResponsiveSize";
import { usePubSub } from "@videosdk.live/react-sdk";
import CloseIcon from "@material-ui/icons/Close";
import { sideBarModes } from "../../../utils/common";

const useStyles = makeStyles(() => ({
  icon: {
    color: "#9FA0A7",
    background: "transparent",
  },
  iconSelected: {
    color: "#fff",
    background: "transparent",
  },
}));

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 3,
  padding: 0,
  margin: 0,
  width: 20,
  height: 20,
  border: `2px solid ${theme.palette.text.secondary}`,
  "input:disabled ~ &": {
    boxShadow: "none",
    background: theme.palette.text.secondary,
  },
}));

const MarkCorrectIcon = styled("span")(({ theme }) => ({
  borderRadius: 12,
  padding: 0,
  margin: 0,
  width: 20,
  height: 20,
  border: `2px solid ${theme.palette.text.secondary}`,
  "input:disabled ~ &": {
    boxShadow: "none",
    background: theme.palette.text.secondary,
  },
}));

const BpCheckedLightIcon = styled(BpIcon)({
  backgroundColor: "#596BFF",
  border: "2px solid #596BFF",
  "&:before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
});

const MarkCorrectCheckedLightIcon = styled(MarkCorrectIcon)({
  backgroundColor: "#596BFF",
  border: "2px solid #596BFF",
  "&:before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
});

function BpCheckbox(CheckboxProps) {
  return (
    <Checkbox
      disableRipple
      disableFocusRipple
      color="default"
      checkedIcon={<BpCheckedLightIcon />}
      icon={<BpIcon />}
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        backgroundColor: "transparent",
      }}
      {...CheckboxProps}
    />
  );
}

export function MarkCorrectCheckbox(CheckboxProps) {
  return (
    <Radio
      disableRipple
      disableFocusRipple
      color="default"
      checkedIcon={<MarkCorrectCheckedLightIcon />}
      icon={<MarkCorrectIcon />}
      style={{
        padding: 0,
        margin: 0,
        backgroundColor: "transparent",
      }}
      {...CheckboxProps}
    />
  );
}

const CreatePollPart = ({
  classes,
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
  padding,
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
    <div
      className={`flex flex-col overflow-y-auto`}
      style={{ margin: padding }}
    >
      <input
        type="text"
        className="bg-gray-750  text-white text-sm rounded-lg  block w-full p-2.5 border border-gray-600 placeholder-gray-400 focus:ring-0 focus:border-purple-550"
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
                  <div className="flex mb-4">
                    {isMarkAsCorrectChecked && item.option.length != 0 && (
                      <MarkCorrectCheckbox
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
                      />
                    )}
                    <div
                      className={`${
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
                        className="absolute right-2 top-1.5"
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
                        <CloseIcon
                          fontSize={"small"}
                          className={
                            item.isCorrect && item.option !== ""
                              ? classes.iconSelected
                              : classes.icon
                          }
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
              <MarkCorrectCheckbox
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
              />
            )}
            <input
              type={"text"}
              placeholder="Add your options"
              inputRef={createOptionRef}
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
                className="w-full bg-customGray-900 mt-4 focus:ring-0"
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
            <FormGroup
              style={{
                display: "flex",
                paddingLeft: 6,
                justifyContent: "center",
              }}
            >
              <FormControlLabel
                style={{
                  color: "white",
                }}
                control={
                  <BpCheckbox
                    onClick={() => {
                      setIsMarkAsCorrectChecked((s) => !s);
                    }}
                  />
                }
                label={
                  <p className="text-base text-white">Mark correct option</p>
                }
              />
            </FormGroup>
            {correctAnswerErr && (
              <p className="text-xs text-red-150 mt-1">
                {
                  "Please check any one option as correct if `isMarkAsCorrectChecked`"
                }
              </p>
            )}
            <div className="flex flex-col">
              <div className="flex items-center flex-row mt-[14px]">
                <FormGroup
                  style={{
                    display: "flex",
                    paddingLeft: 6,
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <FormControlLabel
                    style={{
                      color: "white",
                    }}
                    control={
                      <BpCheckbox
                        onClick={(e) => {
                          setIsSetTimerChecked((s) => !s);
                        }}
                      />
                    }
                    label={<p className="text-base text-white">Set Timer</p>}
                  />
                </FormGroup>
                {isSetTimerChecked && (
                  // <Popover className="relative shadow-2xl">
                  //   {({ open }) => {
                  //     return (
                  //       <>
                  //         <Popover.Button
                  //           // className={"bg-purple-discord "}
                  //           className={`w-full justify-center flex-shrink-0 inline-flex items-center text-xs px-2 py-1.5 ml-0 font-semibold rounded-md ${
                  //             open ? `menu-open` : ``
                  //           } shadow-2xl focus:outline-none border-gray-600  border border-transparent sm:ml-3 sm:w-auto sm:text-sm`}
                  //         >
                  //           <p className=" font-normal text-md text-white">
                  //             Select Time
                  //           </p>
                  //           <ChevronDownIcon
                  //             className={`${open ? "" : "text-opacity-70"}
                  // ml-2 h-4 w-4 text-white font-semibold group-hover:text-opacity-80 transition ease-in-out duration-150`}
                  //             aria-hidden="true"
                  //           />
                  //         </Popover.Button>

                  //         <Transition
                  //           as={Fragment}
                  //           enter="transition ease-out duration-200"
                  //           enterFrom="opacity-0 translate-y-1"
                  //           enterTo="opacity-100 translate-y-0"
                  //           leave="transition ease-in duration-150"
                  //           leaveFrom="opacity-100 translate-y-0"
                  //           leaveTo="opacity-0 translate-y-1"
                  //         >
                  //           <Popover.Panel className="absolute z-10 w-4/5 px-4 mt-3 transform translate-x-4 sm:px-0 ">
                  //             <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 quick-start-popover">
                  //               <div
                  //                 style={{ backgroundColor: "#181818" }}
                  //                 className="relative grid gap-3 bg-customGray-200 p-4 lg:grid-cols-1"
                  //               >
                  //                 {pollTimerArr.map((item) => (
                  //                   <p className="text-md font-normal text-gray-100">
                  //                     {item.Label}
                  //                   </p>
                  //                 ))}
                  //               </div>
                  //             </div>
                  //           </Popover.Panel>
                  //         </Transition>
                  //       </>
                  //     );
                  //   }}
                  // </Popover>

                  <select
                    value={timer}
                    onChange={(e) => {
                      setTimer(e.target.value);
                    }}
                    className="form-select cursor-pointer appearance-none block w-2/6 px-3 py-1.5 text-base font-normal text-white bg-gray-700  border-none rounded transition ease-in-out m-0 focus:text-white focus:bg-gray-700 focus:border-none focus:outline-none focus:ring-0"
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
  theme,
  publishCreatePoll,
  publishDraftPoll,
  question,
  options,
  padding,
  timer,
  setQuestionErr,
  isMarkAsCorrectChecked,
  isSetTimerChecked,
  setTimerErr,
  setCorrectAnswerErr,
  setMinOptionErr,
  setOptionErr,
  polls,
  setSideBarMode,
}) => {
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
    <div className="flex" style={{ padding: padding }}>
      <button
        className="w-1/2 bg-gray-700 text-white p-2"
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
        className="w-1/2 ml-2 p-2 text-white bg-purple-550"
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

const CreatePoll = ({ panelHeight, polls, setSideBarMode }) => {
  const theme = useTheme();
  const padding = useResponsiveSize({
    xl: 12,
    lg: 16,
    md: 8,
    sm: 6,
    xs: 4,
  });

  const classes = useStyles();
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
          classes={classes}
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
          padding={padding}
          setTimer={setTimer}
          timer={timer}
          timerErr={timerErr}
          correctAnswerErr={correctAnswerErr}
          minOptionErr={minOptionErr}
          optionErr={optionErr}
        />
        <PollButtonPart
          theme={theme}
          publishCreatePoll={publishCreatePoll}
          publishDraftPoll={publishDraftPoll}
          question={question}
          options={options}
          padding={padding}
          timer={timer}
          setQuestionErr={setQuestionErr}
          isMarkAsCorrectChecked={isMarkAsCorrectChecked}
          isSetTimerChecked={isSetTimerChecked}
          setTimerErr={setTimerErr}
          setCorrectAnswerErr={setCorrectAnswerErr}
          setMinOptionErr={setMinOptionErr}
          setOptionErr={setOptionErr}
          polls={polls}
          setSideBarMode={setSideBarMode}
        />
      </div>
    </div>
  );
};

export default CreatePoll;
