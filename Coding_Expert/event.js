console.log("JavaScript Connected");

// Bookmarks Bar

chrome.runtime.onMessage.addListener(function (request) {});
function createBookmark() {
  chrome.bookmarks.getChildren("2", function (children) {
    var folderId;
    for (folder of children) {
      if (folder.title == "Bookmarked Problems") {
        folderId = folder.id;
        break;
      }
    }

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.bookmarks.create({
        parentId: folderId,
        title: tabs[0].title,
        url: tabs[0].url,
      });
    });
  });
  console.log("Problem Bookmarked");
}

document.querySelector("#check").addEventListener("change", function () {
  if (this.checked) {
    createBookmark();
  }
});

//Date Display

var actualdate = new Date();
var dd = actualdate.getDate();
var mm = actualdate.getMonth() + 1;
var yyyy = actualdate.getFullYear();
if (dd < 10) dd = "0" + dd;
if (mm < 10) mm = "0" + mm;
document.querySelector(".date").innerHTML = dd + "/" + mm + "/" + yyyy;

// Variable Define
var fDuration;
var currentTime = 0;
var pp;
var now = Date.now();
var timeout = null;

const audio = new Audio("svg/time_up.mp3");
const timeDisplay = document.querySelector(".time-display");
const pSolved = document.querySelector("#complete");
const timeSelect = document.querySelector("#set");
const play = document.querySelector(".play");
const reset = document.querySelector("#reset");

// Calling Respective Functions on Click
pSolved.addEventListener("click", problemSolved);
timeSelect.addEventListener("click", setTimer);
play.addEventListener("click", playTimer);
reset.addEventListener("click", resetTimer);

chrome.storage.sync.get(
  { src: "./svg/play.svg", CT: 0, gap: now, fakeDuration: 900, pp: 1 },
  (x) => {
    pp = x.pp;
    play.setAttribute("src", x.src);
    if (x.src === "./svg/pause.svg") {
      currentTime = x.CT + (now - x.gap) / 1000;
      if (currentTime >= x.fakeDuration) {
        resetTimer();
      }
    }
  }
);

// Count Display

chrome.storage.sync.get(
  { currentdate: null, currentMonth: null, count: 0 },
  (x) => {
    if (dd != x.currentdate || mm != x.currentMonth) {
      chrome.storage.sync.set({ currentdate: dd });
      chrome.storage.sync.set({ currentMonth: mm });
      chrome.storage.sync.set({ count: 0 });
      document.querySelector(".cnt").innerHTML = 0;
    } else {
      document.querySelector(".cnt").innerHTML = x.count;
    }
    console.log("Count: " + x.count);
  }
);

chrome.storage.sync.get({ fakeDuration: 900 }, (x) => {
  fDuration = x.fakeDuration;
  tDisplay();
});

//   Update imer

setInterval(updateCount, 1000);
function updateCount() {
  if (pp == 0) update();
}

// Time Display

function tDisplay() {
  timeDisplay.innerHTML = `${
    Math.floor(fDuration / 60) < 10
      ? "0" + Math.floor(fDuration / 60)
      : Math.floor(fDuration / 60)
  } : ${
    Math.floor(fDuration % 60) < 10
      ? "0" + Math.floor(fDuration % 60)
      : Math.floor(fDuration % 60)
  } `;
}

// set Timer

function setTimer() {
  console.log("setTimer function called");
  fDuration = fDuration + 600;
  chrome.storage.sync.set({ fakeDuration: fDuration });
  console.log(fDuration);
  if (currentTime != 0) {
    setAlarm(fDuration - currentTime);
  }
  tDisplay();
}

// Play Timer

function playTimer() {
  console.log("playTimer is called");
  checkPlaying(play);
}
function checkPlaying(play) {
  if (play.getAttribute("src") === "./svg/play.svg") {
    play.setAttribute("src", "./svg/pause.svg");
    chrome.storage.sync.set({ src: "./svg/pause.svg", pp: 0 });
    chrome.browserAction.setBadgeText({ text: "ON" });
    pp = 0;
    if (currentTime == 0) setAlarm(fDuration);
  } else {
    play.setAttribute("src", "./svg/play.svg");
    chrome.storage.sync.set({ src: "./svg/play.svg", pp: 1 });
    chrome.browserAction.setBadgeText({ text: "" });
    pp = 1;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }
}

// resetTimer

function resetTimer() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  fDuration = 900;
  chrome.storage.sync.set({
    fakeDuration: 900,
    pp: 1,
    CT: 0,
    src: "./svg/play.svg",
    gap: 0,
  });
  play.setAttribute("src", "./svg/play.svg");
  pp = 1;
  currentTime = 0;
  chrome.browserAction.setBadgeText({ text: "" });
  chrome.alarms.clearAll();
  tDisplay();
}

// Update the Timer

function update() {
  console.log("update Func called");
  let elapsed = fDuration - currentTime;
  let sec = Math.floor(elapsed % 60);
  let min = Math.floor(elapsed / 60);
  min = min < 10 ? "0" + min : min;
  sec = sec < 10 ? "0" + sec : sec;

  //Animate the text

  timeDisplay.innerHTML = `${min} : ${sec}`;
  chrome.storage.sync.set({ CT: currentTime, gap: Date.now() });
  if (currentTime == fDuration) resetTimer();
  ++currentTime;
}

function problemSolved() {
  console.log("Problem Solved");
  chrome.storage.sync.get({ count: 0 }, function (result) {
    chrome.storage.sync.set({ count: result.count + 1 });
    document.querySelector(".cnt").innerHTML = result.count + 1;
  });
  resetTimer();
}

// Alarms

function setAlarm(atime) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  console.log("Audio will be played after " + atime);
  timeout = setTimeout(function () {
    audio.play();
  }, atime * 1000);
}
