const dialogPages = {
  fetchingPlayer: 0,
  welcomeBack: 1,
  registration: 2,
};

// Local station name mapping (temporary). Keys are numeric station ids.
// Replace/extend this when server side mapping endpoint exists.
const stationNames = {
  0: "Fordonsentrén",
  1: "Huvudentrén",
};

function formatStationPair(start, end) {
  const sName = stationNames[start] ?? String(start);
  const eName = stationNames[end] ?? String(end);
  return `${sName} → ${eName}`;
}

function closeNfcDialog() {
  clearNfcTimers();
  dom.nfcDialog.close();
}

function clearNfcTimers() {
  if (window.dialogTimerTimeout) {
    clearTimeout(window.dialogTimerTimeout);
    window.dialogTimerTimeout = null;
  }
  if (window.dialogTimerInterval) {
    clearInterval(window.dialogTimerInterval);
    window.dialogTimerInterval = null;
  }
  // Reset dialog timer UI so new scans start from zero
  try {
    const timerEl =
      dom.dialogTimer.container || document.getElementById("dialogTimer");
    const barEl =
      dom.dialogTimer.bar || document.getElementById("dialogTimerBar");
    const labelEl =
      dom.dialogTimer.label || document.getElementById("dialogTimerLabel");
    if (timerEl) timerEl.hidden = true;
    if (barEl) {
      barEl.style.transition = "none";
      barEl.style.width = "0%";
    }
    if (labelEl) labelEl.innerText = "";
  } catch (e) {
    // ignore if DOM not ready
  }
}

function startDialogTimer(durationMs, onComplete) {
  // clear any existing dialog timers first
  if (window.dialogTimerTimeout) {
    clearTimeout(window.dialogTimerTimeout);
    window.dialogTimerTimeout = null;
  }
  if (window.dialogTimerInterval) {
    clearInterval(window.dialogTimerInterval);
    window.dialogTimerInterval = null;
  }

  const timerEl =
    dom.dialogTimer.container || document.getElementById("dialogTimer");
  const barEl =
    dom.dialogTimer.bar || document.getElementById("dialogTimerBar");
  const labelEl =
    dom.dialogTimer.label || document.getElementById("dialogTimerLabel");

  if (!(timerEl && barEl && labelEl)) return;

  timerEl.hidden = false;
  // reset bar immediately
  barEl.style.transition = "none";
  barEl.style.width = "0%";
  // force layout
  // eslint-disable-next-line no-unused-expressions
  barEl.getBoundingClientRect();

  // start animated transition next frame
  requestAnimationFrame(() => {
    barEl.style.transition = `width ${durationMs}ms linear`;
    barEl.style.width = "100%";
  });

  const start = Date.now();
  const end = start + durationMs;

  labelEl.innerText = Math.ceil(durationMs / 1000) + "s";

  window.dialogTimerInterval = setInterval(() => {
    const remaining = Math.max(0, end - Date.now());
    labelEl.innerText = Math.ceil(remaining / 1000) + "s";
    if (remaining <= 0) {
      clearInterval(window.dialogTimerInterval);
      window.dialogTimerInterval = null;
    }
  }, 100);

  window.dialogTimerTimeout = setTimeout(() => {
    timerEl.hidden = true;
    window.dialogTimerTimeout = null;
    if (typeof onComplete === "function") onComplete();
  }, durationMs);
}

function initializeFetchingPlayerPage() {}

async function initializeWelcomeBackPage(guid, user) {
  dom.welcomeBack.pfp.src = null;

  dom.welcomeBack.name.innerText = `${user.username}`;
  dom.welcomeBack.pfp.src = api.getUserProfilePictureUrl(user.id);
  dom.welcomeBack.program.innerText = formatProgram(user.schoolProgram);
  dom.welcomeBack.otherStation.innerText = stationNames[config.station ?? 0];

  const response = await api.submitLocation(guid);
  const run = response.body.run;

  updateLeaderboard();
  updateRunningRightNow();

  if (run) alert("There is a new run!");
  // start universal dialog timer for welcome back (4s)
  startDialogTimer(4 * 1000, () => closeNfcDialog());
}

async function initializeRegistrationPage(guid) {
  dom.registration.qrCodeContainer.innerHTML = "";

  const response = await api.requestRegistration(guid);
  const registration = response.body;

  const url = api.getRegistrationUrl(registration.id);

  new QRCode(dom.registration.qrCodeContainer, {
    text: url,
    width: 200,
    height: 200,
  });

  // 30 s
  const durationMs = 30 * 1000;

  // Clear any previous timers
  startDialogTimer(durationMs, () => closeNfcDialog());
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
  // clear timers from any previous scan so UI resets cleanly
  clearNfcTimers();

  initializeFetchingPlayerPage();
  goToDialogPage(dialogPages.fetchingPlayer);

  dom.nfcDialog.showModal();

  try {
    const response = await api.getUser(guid);

    if (response.status == 404) {
      goToDialogPage(dialogPages.registration);
      await initializeRegistrationPage(guid);
    } else {
      initializeWelcomeBackPage(guid, response.body);
      goToDialogPage(dialogPages.welcomeBack);
    }
  } catch (error) {
    closeNfcDialog();
    throw error;
  }
}

async function updateLeaderboard() {
  try {
    const response = await api.getBestRuns();
    const runs = response.body ?? [];

    if (!runs || runs.length === 0) {
      dom.leaderboardBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty">Inga resultat ännu</td>
        </tr>
      `;
    } else {
      dom.leaderboardBody.innerHTML = runs
        .map((run, index) => {
          const user = run.user ?? {};
          const position = index + 1;
          const profilePictureUrl = api.getUserProfilePictureUrl(user.id);

          return `
          <tr>
            <td>${position}</td>
            <td>
              <div class="table-user">
                <img
                  class="table-avatar"
                  src="${profilePictureUrl}"
                  alt="Profilbild för ${user.username ?? "okänd användare"}"
                />
                <div>
                  <div class="table-name">${user.username ?? "Okänd användare"}</div>
                  <div class="table-program">${formatProgram(user.schoolProgram)}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="run-meta">
                <div class="table-stations">${formatStationPair(run.startPosition, run.endPosition)}</div>
                <div class="table-date">${formatRelativeDate(run.finishDate)}</div>
              </div>
            </td>
            <td>
              <div class="run-time">${formatTime(run.milliseconds ?? 0)}</div>
            </td>
          </tr>
        `;
        })
        .join("");
    }
  } catch (error) {
    console.error("Leaderboard update failed:", error);
  }
}

async function updateRunningRightNow() {
  const response = await api.getRecentLocations();
  const locations = response.body;

  dom.runningRightNowBody.innerHTML = locations
    .map((location, index) => {
      const user = location.user ?? {};
      const profilePictureUrl = api.getUserProfilePictureUrl(user.id);

      return `
          <tr>
            <td>
              <div class="table-user">
                <img
                  class="table-avatar"
                  src="${profilePictureUrl}"
                  alt="Profilbild för ${user.username ?? "okänd användare"}"
                />
                <div>
                  <div class="table-name">${user.username ?? "Okänd användare"}</div>
                  <div class="table-program">${formatProgram(user.schoolProgram)}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="run-meta">
                <div class="table-stations">från ${stationNames[location.position] ?? `Station ${location.position}`}</div>
                <div class="table-date">${formatRelativeDate(location.date)}</div>
              </div>
            </td>
          </tr>
        `;
    })
    .join("");
  if (!locations || locations.length === 0) {
    dom.runningRightNowBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty">Inga spelare just nu</td>
      </tr>
    `;
  }
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

setInterval(() => updateLeaderboard(), 60 * 1000); // Automatically refresh leaderboard every minute
setInterval(() => updateRunningRightNow(), 15 * 1000); // Automatically refresh running right now every 15 seconds

client.connect();
updateLeaderboard();
updateRunningRightNow();

const config = window.APP_CONFIG ?? {};
