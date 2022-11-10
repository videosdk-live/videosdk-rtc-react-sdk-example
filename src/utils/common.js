import { EventEmitter } from "events";

export const json_verify = (s) => {
  try {
    JSON.parse(s);
    return true;
  } catch (e) {
    return false;
  }
};

export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

export const trimSnackBarText = (text = "") => {
  const maxLength = 52;

  return text.length > maxLength ? `${text.substr(0, maxLength - 5)}...` : text;
};

export const nameTructed = (name, tructedLength) => {
  if (name?.length > tructedLength) {
    if (tructedLength === 15) {
      return `${name.substr(0, 12)}...`;
    } else {
      return `${name.substr(0, tructedLength)}...`;
    }
  } else {
    return name;
  }
};

export const eventEmitter = new EventEmitter();

export const appEvents = {
  "enter-full-screen": "enter-full-screen",
  "exit-full-screen": "exit-full-screen",
  "toggle-full-screen": "toggle-full-screen",
  "participant-visible": "participant-visible",
  "participant-invisible": "participant-invisible",
};

export const sideBarModes = {
  PARTICIPANTS: "PARTICIPANTS",
  CHAT: "CHAT",
  LAYOUT: "LAYOUT",
  POLLS: "POLLS",
  CREATE_POLL: "CREATE_POLL",
};

export const meetingTypes = {
  MEETING: "MEETING",
  ILS: "ILS",
};

export const meetingLayoutTopics = {
  MEETING_LAYOUT: "MEETING_LAYOUT",
  RECORDING_LAYOUT: "RECORDING_LAYOUT",
  LIVE_STREAM_LAYOUT: "LIVE_STREAM_LAYOUT",
  HLS_LAYOUT: "HLS_LAYOUT",
};

export const meetingModes = {
  VIEWER: "VIEWER",
  CONFERENCE: "CONFERENCE",
};

export function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}
