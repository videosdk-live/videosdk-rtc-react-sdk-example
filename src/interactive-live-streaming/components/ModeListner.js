import {
  Constants,
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfirmBox from "../../components/ConfirmBox";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

const reqInfoDefaultState = {
  enabled: false,
  mode: null,
  senderId: null,
  accept: () => {},
  reject: () => {},
};

const ModeListner = ({ setMeetingMode, meetingMode }) => {
  const mMeetingRef = useRef();
  const { setSideBarMode } = useMeetingAppContext();

  const [reqModeInfo, setReqModeInfo] = useState(reqInfoDefaultState);

  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const participant = useParticipant(localParticipantId);

  const participantRef = useRef();
  const publishRef = useRef();

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  useEffect(() => {
    participantRef.current = participant;
  }, [participant]);

  usePubSub(`CHANGE_MODE_${mMeeting?.localParticipant?.id}`, {
    onMessageReceived: (data) => {
      const message = JSON.parse(data.message);
      if (message.mode === Constants.modes.CONFERENCE) {
        const muteMic = mMeetingRef.current?.muteMic;
        const disableWebcam = mMeetingRef.current?.disableWebcam;
        const disableScreenShare = mMeetingRef.current?.disableScreenShare;

        muteMic();
        disableWebcam();
        disableScreenShare();
        setReqModeInfo({
          enabled: true,
          senderId: data.senderId,
          mode: message.mode,
          accept: () => {},
          reject: () => {},
        });
      } else {
        mMeeting.changeMode(message.mode);

        const muteMic = mMeetingRef.current?.muteMic;
        const disableWebcam = mMeetingRef.current?.disableWebcam;
        const disableScreenShare = mMeetingRef.current?.disableScreenShare;

        muteMic();
        disableWebcam();
        disableScreenShare();

        setSideBarMode(null);
      }
    },
  });

  const { publish: invitatioAcceptedPublish } = usePubSub(
    `INVITATION_ACCEPT_BY_COHOST`,
    {
      onMessageReceived: (data) => {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        toast(`${data.senderName} has been added as a Co-host`, {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        // enqueueSnackbar(`${data.senderName} has been added as a Co-host`);
      },
      onOldMessagesReceived: (messages) => {},
    }
  );

  const { publish: invitatioRejectedPublish } = usePubSub(
    `INVITATION_REJECT_BY_COHOST`,
    {
      onMessageReceived: (data) => {
        if (data.message.senderId === participantRef.current.participant.id) {
          new Audio(
            `https://static.videosdk.live/prebuilt/notification.mp3`
          ).play();

          toast(
            `${data.senderName} has rejected the request to become Co-host`,
            {
              position: "bottom-left",
              autoClose: 4000,
              hideProgressBar: true,
              closeButton: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            }
          );
          //   enqueueSnackbar(
          //     `${data.senderName} has rejected the request to become Co-host`
          //   );
        }
      },
      onOldMessagesReceived: (messages) => {},
    }
  );

  useMeeting({
    onParticipantModeChanged: ({ mode, participantId }) => {
      if (participantId === localParticipantId) {
        setMeetingMode(mode);
      }
    },
  });

  return (
    <>
      <ConfirmBox
        open={reqModeInfo.enabled}
        successText={"Accept"}
        rejectText={"Deny"}
        onReject={() => {
          setReqModeInfo(reqInfoDefaultState);
          invitatioRejectedPublish(
            { senderId: reqModeInfo.senderId },
            { persist: true }
          );
        }}
        onSuccess={() => {
          mMeeting.changeMode(reqModeInfo.mode);
          publishRef.current(reqModeInfo.mode, { persist: true });
          setReqModeInfo(reqInfoDefaultState);
          invitatioAcceptedPublish({}, { persist: true });
        }}
        title={`Request to become a Co-host`}
        subTitle={`Host has requested you to become a Co-host`}
      />
    </>
  );
};

export default ModeListner;
