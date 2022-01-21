import React from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantView } from "../ParticipantView";
import { TopBar } from "../TopBar";

export function MeetingContainer() {
  const mMeeting = useMeeting();
  const participants = mMeeting?.participants;
  return (
    <div>
        <TopBar topbarHeight ={60}/>
      {[...participants.keys()].map((participantId) => {
          console.log(participantId);
        <ParticipantView participantId={participantId} />;
      })}
    </div>
  );
}
