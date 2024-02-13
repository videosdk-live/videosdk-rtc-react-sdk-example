import { Popover, Transition } from '@headlessui/react'
// import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/outline";

import { Fragment } from 'react'
import React, { useEffect, useRef, useState } from "react";
import DropMIC from '../icons/DropDown/DropMIC';
import DropCAM from '../icons/DropDown/DropCAM';
import Check from '../icons/DropDown/Check';


export default function DropDownCam({ isCameraPermissionAllowed, webcams, changeWebcam, setSelectedWebcam, selectedWebcamLabel, setSelectedWebcamLabel }) {


  return (
    <div className='mt-4 ml-96 absolute rounded cursor-pointer w-44 h-9 hover:ring-1 hover:ring-gray-250 focus:ring-1 focus:ring-gray-250 bg-gray-800 hover:bg-black focus:bg-black '>
      <Popover className="relative ">
        {({ open }) => (
          <>
            <Popover.Button disabled={!isCameraPermissionAllowed}
              className={`focus:outline-none group inline-flex items-center rounded-md px-1 py-1 w-44 text-base text-[#B4B4B4] font-normal hover:text-[#FFF] focus:text-[#FFF] 
              ${!isCameraPermissionAllowed ? 'opacity-50' : ''} ` }
            >
              <DropCAM />
              <span className=" overflow-hidden whitespace-nowrap overflow-ellipsis w-28 ml-7">
                {isCameraPermissionAllowed ? selectedWebcamLabel : "Permission Needed"}

              </span>

              <ChevronDownIcon
                className={`${open ? 'text-orange-300' : 'text-orange-300/70'}
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
              <Popover.Panel className="absolute w-72 z-10 mb-1 bottom-10">
                <div className="max-h-20 rounded-lg shadow-lg">
                  <div className={"bg-gray-350 rounded-lg"}>
                    <div>
                      <div className="flex flex-col">
                        {webcams.map(
                          (item, index) => {
                            return (
                              item?.kind ===
                              "videoinput" && (
                                <div
                                key={`webcams_${index}`}
                                  className={` my-1 pl-4 pr-2 text-white text-left flex`}
                                >
                                  <span className="w-6 mr-2 flex items-center justify-center">
                                          {selectedWebcamLabel === item?.label && (
                                            <CheckIcon className='h-5 w-5' />
                                          )}
                                        </span>
                                  <button
                                    className={`flex flex-1 w-full text-left`}
                                    value={item?.deviceId}

                                    onClick={() => {
                                      setSelectedWebcamLabel(
                                        item?.label
                                      );
                                      setSelectedWebcam(
                                        (s) => ({
                                          ...s,
                                          id: item?.deviceId,
                                        })
                                      );
                                      changeWebcam(
                                        item?.deviceId
                                      );


                                    }}
                                  >
                                    {item?.label ? (
                                      <>
                                        
                                        <span>{item?.label}</span>
                                      </>
                                    ) : (
                                      <span >{`Webcam ${index + 1}`}</span>
                                    )}
                                  </button>
                                </div>
                              )
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

