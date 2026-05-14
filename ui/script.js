const dialogPages = {
  fetchingPlayer: 0,
  welcomeBack: 1,
  registration: 2,
};

const registrationSubPages = {
  basicInformationForm: 0,
  profilePicture: 1,
  finished: 2,
};

const cameraSize = 500;

// Global variable to keep track of the active card
let currentRegistrationGuid = null;
// is webcam actively streaming
let cameraStreaming = false;
let cameraStream = null;

function initializeFetchingPlayerPage() {}

async function initializeWelcomeBackPage(guid, user) {
  dom.welcomeBack.name.innerText = `${user.username}`;
  dom.welcomeBack.pfp.src = api.getUserProfilePictureUrl(user.id);
  dom.welcomeBack.program.innerText = formatProgram(user.schoolProgram);

  await api.submitLocation(guid);
  updateLeaderboard();

  setTimeout(() => {
    dom.nfcDialog.close();
  }, 4000);
}

function initializeRegistrationPage(guid) {
  currentRegistrationGuid = guid;
  initializeRegistrationBasicInfoSubPage();
  goToRegistrationSubPage(registrationSubPages.basicInformationForm);
}

function goToRegistrationSubPage(page) {
  switch (page) {
    case registrationSubPages.basicInformationForm:
      // If we're leaving the profile picture page, make sure camera is stopped
      stopCamera();
      dom.registration.pfpPage.container.hidden = true;
      dom.registration.basicInfoPage.container.hidden = false;
      dom.registration.finishPage.container.hidden = true;
      break;
    case registrationSubPages.profilePicture:
      dom.registration.pfpPage.container.hidden = false;
      dom.registration.basicInfoPage.container.hidden = true;
      dom.registration.finishPage.container.hidden = true;
      break;
    case registrationSubPages.finished:
      // We're done with registration — stop any active camera
      stopCamera();
      dom.registration.pfpPage.container.hidden = true;
      dom.registration.basicInfoPage.container.hidden = true;
      dom.registration.finishPage.container.hidden = false;
      break;
  }
}

function initializeRegistrationBasicInfoSubPage() {
  dom.registration.basicInfoPage.form.reset();
  dom.registration.basicInfoPage.content.open = false;
}

function initializeRegistrationProfilePictureSubPage() {
  const video = dom.registration.pfpPage.video;
  const canvas = dom.registration.pfpPage.canvas;
  const photo = dom.registration.pfpPage.photo;
  const startButton = dom.registration.pfpPage.captureButton;
  const clearButton = dom.registration.pfpPage.clearButton;
  const useButton = dom.registration.pfpPage.useButton;
  const skipButton = dom.registration.pfpPage.skipButton;

  video.hidden = false;
  photo.hidden = true;
  startButton.hidden = false;
  clearButton.hidden = true;
  skipButton.hidden = false;
  useButton.hidden = true;

  video.setAttribute("width", String(cameraSize));
  video.setAttribute("height", String(cameraSize));
  canvas.setAttribute("width", String(cameraSize));
  canvas.setAttribute("height", String(cameraSize));

  if (!startButton.dataset.bound) {
    startButton.dataset.bound = "true";
    startButton.addEventListener("click", (event) => {
      event.preventDefault();
      capturePhoto();
    });
  }

  if (!clearButton.dataset.bound) {
    clearButton.dataset.bound = "true";
    clearButton.addEventListener("click", (event) => {
      event.preventDefault();
      resetCapturedPhoto();
    });
  }

  if (cameraStream) {
    video.srcObject = cameraStream;
    cameraStreaming = true;
    return;
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    .then((stream) => {
      cameraStream = stream;
      video.srcObject = stream;
      video.play();
      cameraStreaming = true;
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });
}

async function initializeRegistrationFinishedSubPage() {
  const response = await api.getUser(currentRegistrationGuid);
  const user = response.body;

  dom.registration.finishPage.name.innerText = `${user.username}`;
  dom.registration.finishPage.pfp.src = api.getUserProfilePictureUrl(user.id);
  dom.registration.finishPage.program.innerText = formatProgram(
    user.schoolProgram,
  );

  setTimeout(() => {
    dom.nfcDialog.close();
  }, 4000);

  currentRegistrationGuid = null;
}

function capturePhoto() {
  if (!cameraStreaming) {
    return;
  }

  const video = dom.registration.pfpPage.video;
  const canvas = dom.registration.pfpPage.canvas;
  const photo = dom.registration.pfpPage.photo;
  const context = canvas.getContext("2d");
  const useButton = dom.registration.pfpPage.useButton;
  const skipButton = dom.registration.pfpPage.skipButton;

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (!videoWidth || !videoHeight || !context) {
    return;
  }

  const sourceSize = Math.min(videoWidth, videoHeight);
  const sourceX = (videoWidth - sourceSize) / 2;
  const sourceY = (videoHeight - sourceSize) / 2;

  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    cameraSize,
    cameraSize,
  );

  // Produce the data URL and only swap UI once the <img> has loaded it
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

  // disable start button while image loads to avoid double clicks
  const captureButton = dom.registration.pfpPage.captureButton;
  const clearButton = dom.registration.pfpPage.clearButton;
  captureButton.disabled = true;

  function showCaptured() {
    video.hidden = false;
    photo.hidden = false;
    captureButton.hidden = true;
    captureButton.disabled = false;
    clearButton.hidden = false;
    useButton.hidden = false;
    skipButton.hidden = true;
  }

  // attach load handler then set src; if already cached/instant, call handler
  photo.onload = () => {
    // small timeout to ensure paint has happened (prevents flicker on some browsers)
    setTimeout(() => {
      showCaptured();
      photo.onload = null;
    }, 20);
  };

  photo.src = dataUrl;
  if (photo.complete) {
    // image loaded synchronously
    showCaptured();
    photo.onload = null;
  }
}

function stopCamera() {
  try {
    const video = dom?.registration?.pfpPage?.video;

    if (cameraStream) {
      const tracks = cameraStream.getTracks();
      for (const t of tracks) {
        try {
          t.stop();
        } catch (e) {
          console.warn("Error stopping track", e);
        }
      }
    }

    if (video) {
      try {
        video.pause();
      } catch (e) {}
      try {
        video.srcObject = null;
      } catch (e) {}
    }

    cameraStream = null;
    cameraStreaming = false;
  } catch (err) {
    console.error("stopCamera failed", err);
  }
}

function resetCapturedPhoto() {
  const video = dom.registration.pfpPage.video;
  const photo = dom.registration.pfpPage.photo;
  const startButton = dom.registration.pfpPage.captureButton;
  const clearButton = dom.registration.pfpPage.clearButton;
  const useButton = dom.registration.pfpPage.useButton;
  const skipButton = dom.registration.pfpPage.skipButton;

  photo.setAttribute("src", "");
  photo.hidden = true;
  video.hidden = false;
  startButton.hidden = false;
  clearButton.hidden = true;
  useButton.hidden = true;
  skipButton.hidden = false;
}

async function useProfilePicture() {
  const canvas = dom.registration.pfpPage.canvas;
  const photo = dom.registration.pfpPage.photo;
  const useButton = dom.registration.pfpPage.useButton;

  if (!currentRegistrationGuid) {
    alert("Ingen giltig GUID finns för profilen.");
    return;
  }

  if (!canvas) {
    alert("Inget foto finns att använda.");
    return;
  }

  useButton.disabled = true;

  // Helper to get a Blob from the canvas
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
  });

  if (!blob) {
    alert("Kunde inte skapa bildfil från canvas.");
    useButton.disabled = false;
    return;
  }

  // Create a File so ApiClient.postPhoto can use a filename
  const file = new File([blob], `${currentRegistrationGuid}.jpg`, {
    type: "image/jpeg",
  });

  try {
    await api.setProfilePicture(currentRegistrationGuid, file);
    await initializeRegistrationFinishedSubPage();
    goToRegistrationSubPage(registrationSubPages.finished);
  } catch (err) {
    alert("Kunde inte spara profilbild. Försök igen.");
    throw err;
  } finally {
    useButton.disabled = false;
  }
}

async function skipProfilePicture() {
  await initializeRegistrationFinishedSubPage();
  goToRegistrationSubPage(registrationSubPages.finished);
}

function goToDialogPage(page) {
  switch (page) {
    case dialogPages.fetchingPlayer:
      dom.fetchingPlayer.hidden = false;
      dom.registration.container.hidden = true;
      dom.welcomeBack.container.hidden = true;
      break;
    case dialogPages.welcomeBack:
      dom.fetchingPlayer.hidden = true;
      dom.registration.container.hidden = true;
      dom.welcomeBack.container.hidden = false;
      break;
    case dialogPages.registration:
      dom.fetchingPlayer.hidden = true;
      dom.registration.container.hidden = false;
      dom.welcomeBack.container.hidden = true;
      break;
  }
}

async function onNfcScan(guid) {
  initializeFetchingPlayerPage();
  goToDialogPage(dialogPages.fetchingPlayer);

  dom.nfcDialog.showModal();

  try {
    const response = await api.getUser(guid);

    if (response.status == 404) {
      initializeRegistrationPage(guid);
      goToDialogPage(dialogPages.registration);
    } else {
      initializeWelcomeBackPage(guid, response.body);
      goToDialogPage(dialogPages.welcomeBack);
    }
  } catch (error) {
    dom.nfcDialog.close();
    throw error;
  }
}

async function register(event) {
  event.preventDefault();

  const data = {
    username: dom.registration.basicInfoPage.username.value,
    program: dom.registration.basicInfoPage.program.value,
    guid: currentRegistrationGuid,
  };

  try {
    const response = await api.register(data.guid, data.username, data.program);
    initializeRegistrationProfilePictureSubPage();
    goToRegistrationSubPage(registrationSubPages.profilePicture);
  } catch (error) {
    alert("Kunde inte registrera spelare.");
    console.error(error);
  }
}

async function updateLeaderboard() {
  try {
    const response = await api.getBestRuns();
    const runs = response.body ?? [];

    dom.leaderboardBody.innerHTML = runs
      .map((run, index) => {
        const user = run.user ?? {};
        const position = index + 1;
        const profilePictureUrl = api.getUserProfilePictureUrl(user.id);

        return `
          <tr>
            <td>${position}</td>
            <td>
              <div class="leaderboard-user">
                <img
                  class="leaderboard-avatar"
                  src="${profilePictureUrl}"
                  alt="Profilbild för ${user.username ?? "okänd användare"}"
                />
                <div>
                  <div class="leaderboard-name">${user.username ?? "Okänd användare"}</div>
                  <div class="leaderboard-program">${formatProgram(user.schoolProgram)}</div>
                </div>
              </div>
            </td>
            <td>${formatTime(run.milliseconds ?? 0)}</td>
            <td>${formatRelativeDate(run.finishDate)}</td>
          </tr>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Leaderboard update failed:", error);
  }
}

function cancelRegistration() {
  dom.nfcDialog.close();
  dom.registration.basicInfoPage.form.reset();
}

function onNfcConnect() {
  dom.nfcWarning.hidden = true;
}

function onNfcDisconnect() {
  dom.nfcWarning.hidden = false;
  client.connect();
}

const api = new ApiClient();
const client = new NfcClient(
  "ws://localhost:6769",
  onNfcScan,
  onNfcConnect,
  onNfcDisconnect,
);

dom.registration.basicInfoPage.form.addEventListener("submit", register);
dom.registration.basicInfoPage.cancel.addEventListener(
  "click",
  cancelRegistration,
);
dom.registration.pfpPage.useButton.addEventListener("click", useProfilePicture);
dom.registration.pfpPage.skipButton.addEventListener(
  "click",
  skipProfilePicture,
);

setInterval(() => updateLeaderboard(), 60 * 1000); // Automatically refresh leaderboard every minute

// Ensure camera is stopped when the NFC dialog is closed
if (
  dom &&
  dom.nfcDialog &&
  typeof dom.nfcDialog.addEventListener === "function"
) {
  dom.nfcDialog.addEventListener("close", () => {
    stopCamera();
  });
}

client.connect();
updateLeaderboard();
