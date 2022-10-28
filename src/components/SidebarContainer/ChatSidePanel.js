import {
  IconButton,
  InputAdornment,
  OutlinedInput as Input,
  useTheme,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";

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
          <p className="inline-block whitespace-pre-wrap break-words text-right text-white">
            {text}
          </p>
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

const ChatInput = ({ inputHeight }) => {
  const [message, setMessage] = useState("");
  const { publish } = usePubSub("CHAT");
  const input = useRef();
  const theme = useTheme();

  return (
    <div
      style={{
        height: inputHeight,
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
      }}
    >
      <Input
        style={{
          paddingRight: 0,
          width: "100%",
        }}
        rows={1}
        rowsMax={2}
        multiline
        id="outlined"
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        ref={input}
        value={message}
        placeholder="Write your message"
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
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
              disabled={message.length < 2}
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
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const { messages } = usePubSub("CHAT");

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

  return messages ? (
    <div ref={listRef} style={{ overflowY: "scroll", height: listHeight }}>
      <div className="p-4">
        {messages.map((msg, i) => {
          const { senderId, senderName, message, timestamp } = msg;
          return (
            <ChatMessage
              key={`chat_item_${i}`}
              {...{ senderId, senderName, text: message, timestamp }}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <p>No messages</p>
  );
};

export function ChatSidePanel({ panelHeight }) {
  const inputHeight = 72;
  const listHeight = panelHeight - inputHeight;

  return (
    <div>
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}
