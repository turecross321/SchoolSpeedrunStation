const dom = {
  nfcDialog: document.getElementById("nfcDialog"),
  nfcWarning: document.getElementById("nfcWarning"),
  fetchingPlayer: document.getElementById("fetchingPlayer"),
  leaderboardBody: document.getElementById("topScoresBody"),
  runningRightNowBody: document.getElementById("runningRightNowBody"),
  welcomeBack: {
    container: document.getElementById("welcomeBackRegistered"),
    name: document.getElementById("welcomeBackRegisteredName"),
    pfp: document.getElementById("welcomeBackRegisteredPfp"),
    program: document.getElementById("welcomeBackRegisteredProgram"),
    otherStation: document.getElementById("welcome-back-other-station"),
  },
  registration: {
    container: document.getElementById("registration"),
    qrCodeContainer: document.getElementById("registrationQrCodeContainer"),
  },
  dialogTimer: {
    container: document.getElementById("dialogTimer"),
    bar: document.getElementById("dialogTimerBar"),
    label: document.getElementById("dialogTimerLabel"),
  },
};
