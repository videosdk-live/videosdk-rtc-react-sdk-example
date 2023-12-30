import { Dialog, Transition } from "@headlessui/react";
import { useMeeting, useFile, usePubSub } from "@videosdk.live/react-sdk";
import { Fragment, useState } from "react";

export default function ShowImage() {
  const mMeeting = useMeeting();
  const { fetchBase64File } = useFile();
  const [open, setOpen] = useState(false);

  const topicTransfer = "IMAGE_TRANSFER";

  const [imageSrc, setImageSrc] = useState(null);

  usePubSub(topicTransfer, {
    onMessageReceived: (message) => {
      if (message.senderId !== mMeeting.localParticipant.id) {
        fetchFile({ url: message.message }); // pass fileUrl to fetch the file
      }
    },
  });

  async function fetchFile({ url }) {
    const token = process.env.REACT_APP_VIDEOSDK_TOKEN;
    const base64 = await fetchBase64File({ url, token });
    console.log("base64", base64); // here is your image in a form of base64
    setImageSrc(base64);
    setOpen(true);
  }
  return (
    <>
      {imageSrc && (
        <Transition appear show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-750 p-4 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-center text-gray-900"
                    >
                      Image Preview
                    </Dialog.Title>
                    <div className="mt-8 flex flex-col items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={`data:image/jpeg;base64,${imageSrc}`}
                          width={300}
                          height={300}
                        />
                      ) : (
                        <div width={300} height={300}>
                          <p className=" text-white  text-center">
                            Loading Image...
                          </p>
                        </div>
                      )}
                      <div className="mt-4 ">
                        <button
                          type="button"
                          className="rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          Okay
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
}
