import { EventEmitter } from "events";

export const maxParticipantGridCount_mobile = 6;
export const maxParticipantGridCount_tab = 9;
export const maxParticipantGridCount_desktop = 16;
export const maxParticipantGridCount_large_desktop = 25;

export const getGridRowsAndColumns = ({
  participantsCount,
  isMobile,
  isTab,
  isSMDesktop,
  isLGDesktop,
  isLandscape,
  isPresenting,
}) => {
  if (isPresenting) {
    const r = participantsCount;
    const c = 1;

    const rows = {};

    for (let index = 0; index < participantsCount; index++) {
      rows[`r${index}`] = 1;
    }

    return { r, c, ...rows };
  }

  const mobilePortrait = {
    1: { r: 1, c: 1, r0: 1 },
    2: { r: 2, c: 1, r0: 1, r1: 1 },
    3: { r: 3, c: 1, r0: 1, r1: 1, r2: 1 },
    4: { r: 2, c: 2, r0: 2, r1: 2 },
    5: { r: 3, c: 2, r0: 2, r1: 1, r2: 2 },
    6: { r: 3, c: 2, r0: 2, r1: 2, r2: 2 },
  };
  const mobileLandscape = {
    1: { r: 1, c: 1, r0: 1 },
    2: { r: 1, c: 2, r0: 2 },
    3: { r: 1, c: 3, r0: 3 },
    4: { r: 2, c: 2, r0: 2, r1: 2 },
    5: { r: 2, c: 3, r0: 3, r1: 2 },
    6: { r: 2, c: 3, r0: 3, r1: 3 },
  };
  const tabPortrait = {
    ...mobilePortrait,
    7: { r: 3, c: 3, r0: 2, r1: 3, r2: 2 },
    8: { r: 3, c: 3, r0: 3, r1: 2, r2: 3 },
    9: { r: 3, c: 3, r0: 3, r1: 3, r2: 3 },
    10: { r: 4, c: 3, r0: 2, r1: 3, r2: 3, r3: 2 },
    11: { r: 4, c: 3, r0: 3, r1: 3, r2: 2, r3: 3 },
    12: { r: 4, c: 3, r0: 3, r1: 3, r2: 3, r3: 3 },
  };
  const tabLandscape = {
    ...mobileLandscape,
    7: { r: 3, c: 3, r0: 2, r1: 3, r2: 2 },
    8: { r: 3, c: 3, r0: 3, r1: 2, r2: 3 },
    9: { r: 3, c: 3, r0: 3, r1: 3, r2: 3 },
    10: { r: 3, c: 4, r0: 3, r1: 4, r2: 3 },
    11: { r: 3, c: 4, r0: 4, r1: 3, r2: 4 },
    12: { r: 3, c: 4, r0: 4, r1: 4, r2: 4 },
  };
  const smallDesktop = {
    1: { r: 1, c: 1, r0: 1 },
    2: { r: 1, c: 2, r0: 2 },
    3: { r: 2, c: 2, r0: 2, r1: 1 },
    4: { r: 2, c: 2, r0: 2, r1: 2 },
    5: { r: 2, c: 3, r0: 3, r1: 2 },
    6: { r: 2, c: 3, r0: 3, r1: 3 },
    7: { r: 3, c: 3, r0: 2, r1: 3, r2: 2 },
    8: { r: 3, c: 3, r0: 3, r1: 2, r2: 3 },
    9: { r: 3, c: 3, r0: 3, r1: 3, r2: 3 },
    10: { r: 3, c: 4, r0: 3, r1: 4, r2: 3 },
    11: { r: 3, c: 4, r0: 4, r1: 3, r2: 4 },
    12: { r: 3, c: 4, r0: 4, r1: 4, r2: 4 },
    13: { r: 4, c: 4, r0: 3, r1: 3, r2: 3, r3: 4 },
    14: { r: 4, c: 4, r0: 4, r1: 3, r2: 3, r3: 4 },
    15: { r: 4, c: 4, r0: 4, r1: 4, r2: 3, r3: 4 },
    16: { r: 4, c: 4, r0: 4, r1: 4, r2: 4, r3: 4 },
  };
  const largeDesktop = {
    ...smallDesktop,
    17: { r: 4, c: 5, r0: 5, r1: 4, r2: 4, r3: 4 },
    18: { r: 4, c: 5, r0: 5, r1: 5, r2: 4, r3: 4 },
    19: { r: 4, c: 5, r0: 5, r1: 5, r2: 5, r3: 4 },
    20: { r: 4, c: 5, r0: 5, r1: 5, r2: 5, r3: 5 },
    21: { r: 5, c: 5, r0: 4, r1: 4, r2: 5, r3: 4, r4: 4 },
    22: { r: 5, c: 5, r0: 4, r1: 5, r2: 4, r3: 5, r4: 4 },
    23: { r: 5, c: 5, r0: 5, r1: 4, r2: 5, r3: 4, r4: 5 },
    24: { r: 5, c: 5, r0: 5, r1: 5, r2: 4, r3: 5, r4: 5 },
    25: { r: 5, c: 5, r0: 5, r1: 5, r2: 5, r3: 5, r4: 5 },
  };

  const { grid, maxCount } = isMobile
    ? isLandscape
      ? { grid: mobileLandscape, maxCount: 6 }
      : { grid: mobilePortrait, maxCount: 6 }
    : isTab
    ? isLandscape
      ? { grid: tabLandscape, maxCount: 12 }
      : { grid: tabPortrait, maxCount: 12 }
    : isSMDesktop
    ? { grid: smallDesktop, maxCount: 16 }
    : { grid: largeDesktop, maxCount: 25 };

  const myGrid =
    grid[
      participantsCount
        ? participantsCount > maxCount
          ? maxCount
          : participantsCount
        : 1
    ];

  return myGrid;
};

export const getGridForMainParticipants = ({ participants, gridInfo }) => {
  const singleRow = [];

  for (let index = 0; index < gridInfo.r; index++) {
    const columnForCurrentRow = gridInfo[`r${index}`];

    const columns = participants.splice(0, columnForCurrentRow);

    columns.forEach((participantId, i) => {
      const diff = gridInfo.c - columnForCurrentRow;

      const relativeWidth = 100 / gridInfo.c;
      const relativeLeft =
        (i * 100) / gridInfo.c + (diff > 0 ? relativeWidth / 2 : 0);

      const item = {
        participantId,
        relativeHeight: 100 / gridInfo.r,
        relativeWidth,
        relativeTop: (100 * index) / gridInfo.r,
        relativeLeft,
      };

      singleRow.push(item);

      return item;
    });
  }
  return { singleRow };
};

export const localAndPinnedOnTop = ({
  participants,
  localParticipantId,
  pinnedParticipantIds,
  moveLocalUnpinnedOnTop,
}) => {
  if (pinnedParticipantIds.length > 0) {
    const totalParticipants = participants.length;
    const totalPinnedParticipants = pinnedParticipantIds.length;

    const localParticipantPinnedIndex = pinnedParticipantIds.findIndex(
      (id) => id === localParticipantId
    );

    const localParticipantPinned = localParticipantPinnedIndex !== -1;

    const unPinnedGridParticipants = participants.filter(
      (id) => pinnedParticipantIds.findIndex((_id) => _id === id) === -1
    );

    const diff = totalParticipants - totalPinnedParticipants;

    const remaining = unPinnedGridParticipants.splice(0, diff);

    if (localParticipantPinned) {
      pinnedParticipantIds.splice(localParticipantPinnedIndex, 1);
      pinnedParticipantIds.unshift(localParticipantId);
    }

    const combined = [...pinnedParticipantIds, ...remaining];

    if (moveLocalUnpinnedOnTop) {
      const localParticipantIndex = combined.findIndex(
        (pId) => pId === localParticipantId
      );

      if (localParticipantIndex !== -1) {
        combined.splice(localParticipantIndex, 1);
        combined.unshift(localParticipantId);
      }
    }

    return combined;
  } else {
    const participantsArr = [...participants];

    const localParticipantIndex = participantsArr.findIndex(
      (pId) => pId === localParticipantId
    );

    if (localParticipantIndex !== -1) {
      participantsArr.splice(localParticipantIndex, 1);
      participantsArr.unshift(localParticipantId);
    }

    return participantsArr;
  }
};

export function getRandomColor(varient = "light" | "dark") {
  var letters = varient === "light" ? "BCDEF" : "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

export function invertColor(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

export function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(str);
}

export function calcQuality(participantsCount) {
  if (participantsCount <= 2) {
    return "s2t2";
  } else if (participantsCount <= 4) {
    return "s2t1";
  } else if (participantsCount <= 6) {
    return "s1t2";
  } else if (participantsCount <= 9) {
    return "s1t1";
  } else if (participantsCount <= 12) {
    return "s0t2";
  } else if (participantsCount <= 16) {
    return "s0t1";
  } else {
    return "s0t0";
  }
}

export function getQualityScore(stats) {
  const packetLossPercent = stats.packetsLost / stats.totalPackets || 0;
  const jitter = stats.jitter;
  const rtt = stats.rtt;
  let score = 100;
  score -= packetLossPercent * 50 > 50 ? 50 : packetLossPercent * 50;
  score -= ((jitter / 30) * 25 > 25 ? 25 : (jitter / 30) * 25) || 0;
  score -= ((rtt / 300) * 25 > 25 ? 25 : (rtt / 300) * 25) || 0;
  return score / 10;
}

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

export const extractHostname = (url) => {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

export const extractRootDomain = (url) => {
  var domain = extractHostname(url),
    splitArr = domain.split("."),
    arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + "." + splitArr[arrLen - 1];
    //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
    if (
      splitArr[arrLen - 2].length === 2 &&
      splitArr[arrLen - 1].length === 2
    ) {
      //this is using a ccTLD
      domain = splitArr[arrLen - 3] + "." + domain;
    }
  }
  return domain;
};

export const getUniqueId = () => {
  return Math.random().toString(36).substring(2, 10);
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
