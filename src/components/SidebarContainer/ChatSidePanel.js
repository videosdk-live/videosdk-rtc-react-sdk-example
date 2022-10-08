import {
  IconButton,
  InputAdornment,
  OutlinedInput as Input,
  makeStyles,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";

const useStyles = makeStyles(() => ({
  textField: {
    "& .MuiInputBase-input": {
      color: "white",
    },
  },
  inputFocused: {
    borderColor: "none",
    outline: "none",
  },
}));

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localSender = localParticipantId === senderId;

  return (
    <div
      className={`flex ${localSender ? "justify-end" : "justify-start"} mt-4`}
      style={{
        maxWidth: "100%",
      }}
    >
      <div
        className={`flex ${
          localSender ? "items-end" : "items-start"
        } flex-col py-1 px-2 rounded-md bg-gray-700`}
      >
        <p style={{ color: "#ffffff80" }}>
          {localSender ? "You" : nameTructed(senderName, 15)}
        </p>
        <div>
          <p className="inline-block pre-wrap break-words text-white">{text}</p>
        </div>
        <div className="mt-1">
          <p className="text-xs italic" style={{ color: "#ffffff80" }}>
            {formatAMPM(new Date(timestamp))}
          </p>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ message, setMessage, publish }) => {
  const input = useRef();
  const classes = useStyles();

  return (
    <Input
      style={{ paddingRight: 0, margin: "1rem" }}
      rows={1}
      rowsMax={2}
      multiline
      id="outlined"
      onChange={(e) => {
        setMessage(e.target.value);
      }}
      classes={{
        root: classes.textField,
        focused: classes.inputFocused,
      }}
      ref={input}
      value={message}
      placeholder="Write your message"
      onKeyPress={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const messageText = message.trim();

          if (messageText.length > 0) {
            publish(messageText, { persist: true });
            setTimeout(() => {
              setMessage("");
            }, 100);
            input.current?.focus();
          }
        }
      }}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            disabled={message.length < 3}
            variant="outlined"
            onClick={() => {
              const messageText = message.trim();
              if (messageText.length > 0) {
                publish(messageText, { persist: true });
                setTimeout(() => {
                  setMessage("");
                }, 100);
                input.current?.focus();
              }
            }}
          >
            <Send />
          </IconButton>
        </InputAdornment>
      }
    />
  );
};

export function ChatSidePanel({ panelHeight }) {
  const [message, setMessage] = useState("");
  const { publish } = usePubSub("CHAT");
  const { messages } = usePubSub("CHAT");
  const listRef = useRef();

  const scrollToBottom = (data) => {
    if (!data) {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } else {
      const { text } = data;

      if (json_verify(text)) {
        const { type } = JSON.parse(text);
        if (type === "CHAT") {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={` w-full flex flex-col bg-gray-750`}
      style={{ height: panelHeight }}
    >
      <div
        style={{ height: panelHeight - 100 }}
        className={`flex flex-col flex-1`}
      >
        {messages ? (
          <div ref={listRef} className={`overflow-y-auto h-[${panelHeight}]px`}>
            <div className="px-2">
              {messages.map((msg, i) => {
                const { senderId, senderName, message, timestamp } = msg;
                return (
                  <ChatMessage
                    key={`chat_item_${i}`}
                    {...{
                      senderId,
                      senderName,
                      text: message,
                      timestamp,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <p>no messages</p>
        )}
      </div>
      <ChatInput message={message} setMessage={setMessage} publish={publish} />
    </div>
  );
}
