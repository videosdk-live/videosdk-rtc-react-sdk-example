import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Fade,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();

  const localParticipantId = mMeeting?.localParticipant?.id;

  const localSender = localParticipantId === senderId;

  const theme = useTheme();

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: localSender ? "flex-end" : "flex-start",
        maxWidth: "100%",
      }}
      mt={2}>
      <Box
        style={{
          paddingTop: theme.spacing(0.5),
          paddingBottom: theme.spacing(0.5),
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          borderRadius: 6,
          backgroundColor: theme.palette.common.sidePanel,
          display: "flex",
          flexDirection: "column",
          alignItems: localSender ? "flex-end" : "flex-start",
        }}>
        <Typography style={{ color: "#ffffff80" }}>
          {localSender ? "You" : nameTructed(senderName, 15)}
        </Typography>
        <Box mt={0.5}>
          <Typography
            style={{
              display: "inline-block",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
            {text}
          </Typography>
        </Box>
        <Box mt={0.5}>
          <Typography
            variant={"caption"}
            style={{ color: "#ffffff80", fontStyle: "italic" }}>
            {formatAMPM(new Date(parseInt(timestamp)))}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export function ChatSidePanel({ panelHeight }) {
  const [message, setMessage] = useState("");
  const mMeeting = useMeeting();
  const sendChatMessage = mMeeting.sendChatMessage;
  const theme = useTheme();
  const chatMessages = mMeeting.messages;
  return (
    <Box
      style={{
        height: panelHeight,
        widht: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
      }}>
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: panelHeight - 100,
        }}>
        {chatMessages ? (
          <Box
            // ref={listRef}
            style={{ overflowY: "scroll", height: panelHeight }}>
            <Box p={2}>
              {chatMessages.map((msg, i) => {
                const { senderId, senderName, text, timestamp } = msg;
                if (json_verify(text)) {
                  const { type, data } = JSON.parse(text);
                  if (type === "CHAT") {
                    return (
                      <ChatMessage
                        key={`chat_item_${i}`}
                        {...{
                          senderId,
                          senderName,
                          text: data.message,
                          timestamp,
                        }}
                      />
                    );
                  }
                  return <></>;
                }
                return <></>;
              })}
            </Box>
          </Box>
        ) : (
          <p>no messages</p>
        )}
      </Box>

      <TextField
        style={{
          margin: "1rem",
        }}
        id="outlined"
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        value={message}
        placeholder="Write your message"
        variant="outlined"
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            const messageText = message.trim();

            if (messageText.length > 0) {
              sendChatMessage(
                JSON.stringify({
                  type: "CHAT",
                  data: { message: messageText },
                })
              );
              setMessage("");
            }
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={message.length < 3}
                variant="outlined"
                onClick={() => {
                  const messageText = message.trim();
                  if (messageText.length > 0) {
                    sendChatMessage(
                      JSON.stringify({
                        type: "CHAT",
                        data: { messageText },
                      })
                    );
                    setMessage("");
                  }
                }}>
                <Send />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
