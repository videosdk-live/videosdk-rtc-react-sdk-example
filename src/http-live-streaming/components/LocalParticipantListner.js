import { Constants, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";
import { debounce } from "../../utils/common";

const LocalParticipantListner = ({ localParticipantId, meetingMode }) => {
  const localParticipant = useParticipant(localParticipantId);
  const localParticipantRef = useRef(localParticipant);

  useEffect(() => {
    localParticipantRef.current = localParticipant;
  }, [localParticipant]);

  const _handleChangePinState = debounce(
    ({ meetingMode, localParticipant }) => {
      if (meetingMode === Constants.modes.SEND_AND_RECV) {
        if (
          !(
            localParticipantRef.current.pinState?.share ||
            localParticipantRef.current.pinState?.cam
          )
        ) {
          localParticipant.pin();
        }
      } else {
        if (
          localParticipantRef.current.pinState?.share ||
          localParticipantRef.current.pinState?.cam
        ) {
          localParticipant.unpin();
        }
      }
    },
    2000
  );

  useEffect(() => {
    _handleChangePinState({ meetingMode, localParticipant });
  }, [meetingMode]);
  return <></>;
};

export default LocalParticipantListner;
