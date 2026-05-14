const dom = {
  nfcDialog: document.getElementById("nfcDialog"),
  nfcWarning: document.getElementById("nfcWarning"),
  fetchingPlayer: document.getElementById("fetchingPlayer"),
  leaderboardBody: document.getElementById("topScoresBody"),
  welcomeBack: {
    container: document.getElementById("welcomeBackRegistered"),
    name: document.getElementById("welcomeBackRegisteredName"),
    pfp: document.getElementById("welcomeBackRegisteredPfp"),
    program: document.getElementById("welcomeBackRegisteredProgram"),
  },
  registration: {
    container: document.getElementById("registration"),
    basicInfoPage: {
      container: document.getElementById("registrationBasicInfoPage"),
      form: document.getElementById("registerForm"),
      username: document.getElementById("registerUsername"),
      program: document.getElementById("registerProgram"),
      content: document.getElementById("registerTermsContent"),
      cancel: document.getElementById("registerCancel"),
    },
    pfpPage: {
      container: document.getElementById("registrationPfpPage"),
      video: document.getElementById("video"),
      canvas: document.getElementById("canvas"),
      photo: document.getElementById("photo"),
      startButton: document.getElementById("start-button"),
    },
  },
};
