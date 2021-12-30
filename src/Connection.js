import React, { useEffect } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  useConnection,
} from "@videosdk.live/react-sdk";

const ONE_MEETING = "dt6d-a3i8-wpcx";
const TWO_MEETING = "ccq7-lc9t-xbje";
const THREE_MEETING = "9nbk-lodv-4y7o";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIxYTgyNjA2YS02MjcyLTQzZWItODZiYy0xYjE1OWM1ZDE2MWIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTYzOTQ4MDc0M30.NevyWx8214tCtUt8Ka7hcdt5BiMiIZjODccmi_0X6dY";

const ConnectionView = ({ connectionId }) => {
  const { connection } = useConnection(connectionId, {
    onMeeting: {
      onParticipantJoined: (data) => {
        console.log("onParticipantJoined", data);
      },
      onParticipantLeft: (data) => {
        console.log("onParticipantLeft", data);
      },
      onChatMessage: (data) => {
        console.log("onChatMessage", data);
      },
    },
  });
  const { meeting } = useMeeting({
    onMeetingLeft: (data) => {
      console.log("onMeetingLeft", data);
    },
  });

  // const {} = useParticipant()
  console.log("Connection", connection);
  const connectionMeetingParticipant = [
    ...connection.meeting.participants.values(),
  ];
  return (
    <div>
      <button
        onClick={() => {
          connection.meeting.sendChatMessage(`Hello from ${meeting.id}`);
        }}
      >
        Send Chat Message
      </button>

      {connectionMeetingParticipant.map((participant) => {
        return (
          <button
            key={participant.id}
            onClick={() => {
              participant.switchTo({
                meetingId: TWO_MEETING,
                payload: "Connection Participant Swithcing....",
                token,
              });
            }}
          >
            Connection Swithc Participant {participant.id}
          </button>
        );
      })}
      <button
        onClick={() => {
          connection.meeting.end();
        }}
      >
        End Connection Meeting
      </button>
      <button
        onClick={() => {
          connection.close();
        }}
      >
        Close Connection
      </button>
    </div>
  );
};

const ParticipantView = ({ participantId }) => {
  const { switchTo } = useParticipant(participantId);
  return (
    <button
      onClick={() => {
        switchTo({
          meetingId: THREE_MEETING,
          payload: "testing swithc participant",
          token,
        });
      }}
    >
      Switch : {participantId}
    </button>
  );
};

const ConnectionMeetingView = ({
  name,
  meetingId,
  token,
  anotherMeetingIds,
}) => {
  const MeetingView = () => {
    const meeting = useMeeting({
      onSwitchMeeting: (data) => {
        console.log("onSwitchMeeting", data);
      },
      onConnectionOpen: (data) => {
        console.log("onConnectionOpen", data);
      },
      onConnectionClose: (data) => {
        console.log("onConnectionClose", data);
      },
    });
    const connectionArr = [...meeting.connections.keys()];
    const participantArr = [...meeting.participants.keys()];

    return (
      <div
        style={{
          padding: 12,
          margin: 12,
          border: "1px solid blue",
        }}
      >
        <button
          onClick={() => {
            meeting.join();
          }}
        >
          JOIN {meetingId}
        </button>

        <button
          onClick={() => {
            meeting.leave();
          }}
        >
          Leave {meetingId}
        </button>
        {anotherMeetingIds.map((anotherMeetingId, i) => {
          return (
            <div>
              <button
                onClick={() => {
                  meeting.connectTo({
                    meetingId: anotherMeetingId,
                    payload: "hello",
                  });
                }}
              >
                Connect {anotherMeetingId}
              </button>
            </div>
          );
        })}

        {participantArr.map((i) => {
          return <ParticipantView key={i} participantId={i} />;
        })}
        {connectionArr.map((id) => {
          return <ConnectionView key={id} connectionId={id} />;
        })}
      </div>
    );
  };

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: true,
        name,
      }}
      listenOnProps={true}
      token={token}
    >
      <MeetingView />
    </MeetingProvider>
  );
};

const ConnectionMeetingViewContainer = () => {
  return [
    {
      meetingId: ONE_MEETING,
      token,
      anotherMeetingIds: [TWO_MEETING, THREE_MEETING],
      name: "From Meeting 1",
    },
    // {
    //   meetingId: TWO_MEETING,
    //   token,
    //   anotherMeetingIds: [ONE_MEETING, THREE_MEETING],
    //   name: "From Meeting 2",
    // },
    // {
    //   meetingId: THREE_MEETING,
    //   token,
    //   anotherMeetingIds: [ONE_MEETING, TWO_MEETING],
    //   name: "From Meeting 3",
    // },
  ].map(({ name, anotherMeetingIds, token, meetingId }) => {
    return (
      <>
        <ConnectionMeetingView
          {...{ name, anotherMeetingIds, token, meetingId }}
        />
      </>
    );
  });
};

export default ConnectionMeetingViewContainer;
