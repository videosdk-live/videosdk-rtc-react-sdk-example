import React from "react";
import { ZujoSDK } from "@videosdk.live/js-sdk";
const Connection = () => {
  const start = () => {
    ZujoSDK.config(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIxYTgyNjA2YS02MjcyLTQzZWItODZiYy0xYjE1OWM1ZDE2MWIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTYzOTQ4MDc0M30.NevyWx8214tCtUt8Ka7hcdt5BiMiIZjODccmi_0X6dY"
    );

    const meeting = ZujoSDK.initMeeting({
      meetingId: "ccq7-lc9t-xbje", // required
      name: "ahmed bhesaniya", // required
      micEnabled: true, // optional, default: true
      webcamEnabled: true, // optional, default: true
      maxResolution: "hd", // optional, default: "hd"
    });

    meeting.join();
    console.log("localParticipant", meeting.localParticipant);

    setTimeout(() => {
      meeting.switchTo({
        peerIds: [meeting.localParticipant.id],
        roomId: "ccq7-lc9t-xbje",
        payload: "Testing",
      });
    }, 5000);
    console.log("Meeting", meeting);
  };
  return (
    <div style={{ flex: 1, backgroundColor: "gray" }}>
      <button
        onClick={() => {
          start();
        }}
      >
        <p>Press Me!</p>
      </button>
    </div>
  );
};

export default Connection;
