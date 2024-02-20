import { Popover, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { Fragment } from 'react'
import React, { useEffect, useRef, useState } from "react";
import DropMIC from '../icons/DropDown/DropMIC';
import TestMic from "../icons/DropDown/TestMic"
import TestMicOff from '../icons/DropDown/TestMicOff';
import PauseButton from '../icons/DropDown/PauseButton';
import { useMeetingAppContext } from '../MeetingAppContextDef';

export default function DropDown({
  mics,
  changeMic,
  customAudioStream,
  audioTrack,
  micOn,
  didDeviceChange,
  setDidDeviceChange
}) {

  const {
    setSelectedMic,
    selectedMic,
    selectedSpeaker,
    isMicrophonePermissionAllowed
  } = useMeetingAppContext();
  const [audioProgress, setAudioProgress] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [volume, setVolume] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const audioTrackRef = useRef();
  const intervalRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const mediaRecorder = useRef(null);

  const mimeType = "audio/webm";

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    if (audioTrack) {
      analyseAudio(audioTrack);
    } else {
      stopAudioAnalyse();
    }
  }, [audioTrack]);

  useEffect(() => {
    if (didDeviceChange) {
      setDidDeviceChange(false)
      if (mediaRecorder.current != null && mediaRecorder.current.state === "recording") { stopRecording() }
      setRecordingProgress(0)
      setRecordingStatus("inactive")
    }
  }, [didDeviceChange])

  const analyseAudio = (audioTrack) => {
    const audioStream = new MediaStream([audioTrack]);
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);
    const volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);
      const volumeSum = volumes.reduce((sum, vol) => sum + vol);
      const averageVolume = volumeSum / volumes.length;
      setVolume(averageVolume);
    };
    audioAnalyserIntervalRef.current = setInterval(volumeCallback, 100);
  };

  const stopAudioAnalyse = () => {
    clearInterval(audioAnalyserIntervalRef.current);
  };

  const handlePlaying = () => {
    setRecordingStatus("playing");
    const audioTags = document.getElementsByTagName("audio");

    for (let i = 0; i < audioTags.length; i++) {
      audioTags.item(i).setSinkId(selectedSpeaker.id).then(() => {
        audioTags.item(i).play();
        audioTags.item(i).addEventListener('timeupdate', () => {
          const progress = (audioTags.item(i).currentTime / recordingDuration) * 100;
          setAudioProgress(progress);
        });
        audioTags.item(i).addEventListener('ended', () => {
          setAudioProgress(0);
        });
      })
    }
  }

  const startRecording = async () => {
    setRecordingStatus("recording");

    try {
      const media = new MediaRecorder(customAudioStream, { type: mimeType });
      mediaRecorder.current = media;
      mediaRecorder.current.start();
      let localAudioChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(localAudioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        localAudioChunks = []
        const elapsedTime = Date.now() - startTime;
        const durationInSeconds = (elapsedTime / 1000);
        setRecordingDuration(durationInSeconds)
      };

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = (elapsedTime / 7000) * 100;
        setRecordingProgress(progress);
      });

      setTimeout(() => {
        clearInterval(intervalRef.current)
        stopRecording();
      }, 7000)
    } catch (err) {
      console.log("Error in MediaRecorder:", err)
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current.state != "inactive") {
      setRecordingProgress(0);
      setRecordingStatus("stopped recording");
      clearInterval(intervalRef.current)
      mediaRecorder.current.stop();
    }
  };

  return (
    <>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              onMouseEnter={() => { setIsHovered(true) }}
              onMouseLeave={() => { setIsHovered(false) }}
              disabled={!isMicrophonePermissionAllowed}
              className={`focus:outline-none hover:ring-1 hover:ring-gray-250 hover:bg-black 
              ${open
                  ? "text-white ring-1 ring-gray-250 bg-black"
                  : "text-customGray-250 hover:text-white"
                }
              group inline-flex items-center rounded-md px-1 py-1 w-44 text-base font-normal
              ${!isMicrophonePermissionAllowed ? "opacity-50" : ""}`}
              onClick={() => {
                if (mediaRecorder.current != null && mediaRecorder.current.state == "recording") { stopRecording() }
                setRecordingProgress(0)
                setRecordingStatus("inactive")
              }}
            >
              <DropMIC fillColor={isHovered || open ? "#FFF" : "#B4B4B4"} />
              <span className="overflow-hidden whitespace-nowrap overflow-ellipsis w-28 ml-6">
                {isMicrophonePermissionAllowed ? selectedMic?.label : "Permission Needed"}
              </span>
              <ChevronDownIcon
                className={`${open ? 'text-white' : 'text-customGray-250 hover:text-white'}
                ml-8 h-5 w-5 transition duration-150 ease-in-out group-hover:text-orange-300/80 mt-1`}
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
              <Popover.Panel className="absolute bottom-full z-10 mt-3 w-72 px-4 sm:px-0 pb-2">
                <div className="rounded-lg shadow-lg">
                  <div className="bg-gray-350 rounded-lg">
                    <div>
                      <div className="flex flex-col">
                        {mics.map(
                          (item, index) => {
                            return (
                              item?.kind === "audioinput" && (
                                <div
                                  key={`mics_${index}`}
                                  className={` my-1 pl-4 pr-2 text-white text-left flex`}
                                >
                                  <span className="w-6 mr-2 flex items-center justify-center">
                                    {selectedMic?.label === item?.label && (
                                      <CheckIcon className='h-5 w-5' />
                                    )}
                                  </span>
                                  <button
                                    className={`flex flex-1 w-full text-left`}
                                    value={item?.deviceId}
                                    onClick={() => {
                                      setSelectedMic(
                                        (s) => ({
                                          ...s,
                                          label: item?.label,
                                          id: item?.deviceId,
                                        })
                                      );
                                      changeMic(item?.deviceId);
                                      if (mediaRecorder.current != null && mediaRecorder.current.state == "recording") { stopRecording() }
                                      setRecordingProgress(0)
                                      setRecordingStatus("inactive")
                                    }}
                                  >
                                    {item?.label ? (
                                      <span>{item?.label}</span>
                                    ) : (
                                      <span>{`Mic ${index + 1}`}</span>
                                    )}
                                  </button>
                                </div>
                              )
                            );
                          }
                        )}

                        <hr className='border border-gray-50 mt-2 mb-1' />

                        {micOn ? <div className="my-1 pr-2 text-white flex flex-1 w-full text-left mb-2 pl-4" >

                          <span className="mr-4 mt-1">
                            <TestMic />
                          </span>

                          <div className="w-36 mt-3 bg-gray-450 rounded-full h-1 dark:bg-gray-700">
                            <div className="bg-white opacity-50 h-1 rounded-full" style={{ width: `${volume / 256 * 100}%` }} ></div>
                          </div>

                          {recordingStatus == "inactive" && <button className='w-16 h-7 text-xs rounded ml-5 bg-gray-450' onClick={startRecording}>
                            Record
                          </button>}

                          {recordingStatus == "stopped recording" && <button className='w-16 h-7 text-xs rounded ml-5 bg-gray-450' onClick={handlePlaying}>
                            Play
                          </button>}

                          {recordingStatus == "recording" && <button className='w-16 h-7 text-xs rounded ml-5 bg-gray-450 relative z-0' onClick={stopRecording}>
                            <div className=' h-7 rounded bg-[#6F767E] absolute top-0 left-0 ' style={{ width: `${recordingProgress}%` }} >
                              <PauseButton />
                            </div>
                          </button>}

                          {recordingStatus == "playing" && <button className='w-16 h-7 text-xs rounded ml-5 bg-gray-450 relative z-0' onClick={handlePlaying}>
                            <div className=' h-7 rounded bg-[#6F767E] absolute top-0 left-0 ' style={{ width: `${audioProgress}%` }} >
                              <PauseButton />
                            </div>
                          </button>}

                        </div>
                          :
                          <div className=' text-[#747B84] flex flex-1 items-center w-full  mb-2 pl-5'>
                            <TestMicOff />
                            Unmute to test your mic
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      <audio src={audio} ></audio>
    </>
  )
}

