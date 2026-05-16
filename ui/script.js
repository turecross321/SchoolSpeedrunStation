const dialogPages = {
  fetchingPlayer: 0,
  welcomeBack: 1,
  registration: 2,
  runSummary: 3,
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
  if (window.registrationScanInterval) {
    clearInterval(window.registrationScanInterval);
    window.registrationScanInterval = null;
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
  const newRun = response.body.newRun;
  const newRunIndex = response.body.newRunIndex;
  const previousBestRun = response.body.previousBestRun;
  const previousBestRunIndex = response.body.previousBestRunIndex;

  updateLeaderboard();
  updateRunningRightNow();

  if (newRun != null && newRunIndex != null) {
    // Show the NFC dialog to announce the new run instead of an alert
    try {
      goToDialogPage(dialogPages.runSummary);
      dom.nfcDialog.showModal();
    } catch (e) {
      // ignore if dialog DOM not ready
    }
    // Give the user more time to see the run summary (15s)
    startDialogTimer(15 * 1000, () => closeNfcDialog());
  } else {
    // start universal dialog timer for welcome back (4s)
    startDialogTimer(4 * 1000, () => closeNfcDialog());
  }

  console.log(newRun);
  console.log(newRunIndex);

  // Populate run summary UI (separate page)
  try {
    const rs = dom.runSummary;
    if (newRun != null && newRunIndex != null) {
      if (rs && rs.containerInner) rs.containerInner.hidden = false;
      if (rs && rs.title)
        rs.title.innerText =
          previousBestRun != null &&
          newRun.milliseconds < previousBestRun.milliseconds
            ? "Du slog ditt rekord!"
            : "Du har genomfört loppet!";
      if (rs && rs.time)
        rs.time.innerText = formatTime(newRun.milliseconds ?? 0);
      if (rs && rs.stations)
        rs.stations.innerText = formatStationPair(
          newRun.startPosition,
          newRun.endPosition,
        );

      if (previousBestRun != null && rs && rs.prevRunContainer) {
        rs.prevRunContainer.hidden = false;
        if (rs.prevLabel)
          rs.prevLabel.innerText =
            newRun.milliseconds < previousBestRun.milliseconds
              ? "Tidigare bästa"
              : "Rekord";
        if (rs.prevTime)
          rs.prevTime.innerText = formatTime(previousBestRun.milliseconds ?? 0);
        if (rs.prevStations)
          rs.prevStations.innerText = formatStationPair(
            previousBestRun.startPosition,
            previousBestRun.endPosition,
          );

        const diff =
          (previousBestRun.milliseconds ?? 0) - (newRun.milliseconds ?? 0);
        if (diff > 0) {
          if (rs.time) rs.time.classList.add("highlight");
        } else {
          if (rs.time) rs.time.classList.remove("highlight");
        }
      } else {
        if (rs && rs.prevRunContainer) rs.prevRunContainer.hidden = true;
        if (rs && rs.time) rs.time.classList.add("highlight");
      }
      // Small leaderboard showing user's rank (3 rows)
      try {
        if (rs && rs.leaderboardBody) {
          const bestResponse = await api.getBestRuns();
          const allRuns = bestResponse.body ?? [];

          // Determine user's best index: prefer provided indices, else find by user id
          let userBestIndex = null;
          if (typeof newRunIndex === "number" && newRunIndex >= 0)
            userBestIndex = newRunIndex;
          if (
            typeof previousBestRunIndex === "number" &&
            previousBestRunIndex >= 0
          ) {
            if (userBestIndex === null) userBestIndex = previousBestRunIndex;
            else userBestIndex = Math.min(userBestIndex, previousBestRunIndex);
          }

          if (userBestIndex === null) {
            // fallback: find first run for this user in list
            const found = allRuns.findIndex(
              (r) => (r.user || {}).id === user.id,
            );
            if (found >= 0) userBestIndex = found;
          }

          if (
            userBestIndex === null ||
            userBestIndex < 0 ||
            userBestIndex >= allRuns.length
          ) {
            rs.leaderboardBody.innerHTML = `
              <tr><td colspan="3" class="empty">Ingen placering tillgänglig</td></tr>
            `;
          } else {
            // center slice of 3 rows around userBestIndex
            let start = Math.max(0, userBestIndex - 1);
            if (start + 3 > allRuns.length)
              start = Math.max(0, allRuns.length - 3);
            const slice = allRuns.slice(start, start + 3);

            rs.leaderboardBody.innerHTML = slice
              .map((run, idx) => {
                const absoluteIndex = start + idx;
                const position = absoluteIndex + 1;
                const userObj = run.user ?? {};
                const profilePictureUrl = api.getUserProfilePictureUrl(
                  userObj.id,
                );
                const isUser = userObj.id === user.id;
                return `
                  <tr class="${isUser ? "welcome-run-new" : ""}">
                    <td>${position}</td>
                    <td>
                      <div class="table-user">
                        <img class="table-avatar" src="${profilePictureUrl}" alt="Profilbild" />
                        <div>
                          <div class="table-name">${userObj.username ?? "Okänd"}</div>
                        </div>
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
        }
      } catch (e) {
        if (rs && rs.leaderboardBody)
          rs.leaderboardBody.innerHTML = `<tr><td colspan="3" class="empty">Fel vid hämtning</td></tr>`;
      }
    } else {
      if (rs && rs.containerInner) rs.containerInner.hidden = true;
    }
  } catch (e) {
    // ignore DOM issues
  }
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

  if (window.registrationScanInterval) {
    clearInterval(window.registrationScanInterval);
    window.registrationScanInterval = null;
  }

  window.registrationScanInterval = setInterval(async () => {
    try {
      const scanResponse = await api.isRegistrationScanned(registration.id);
      const scanned = scanResponse.body.isScanned === true;

      if (scanned) {
        closeNfcDialog();
      }
    } catch (error) {
      console.error("Registration scan poll failed:", error);
    }
  }, 5 * 1000);

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
      if (dom.runSummary && dom.runSummary.container)
        dom.runSummary.container.hidden = true;
      break;
    case dialogPages.welcomeBack:
      dom.fetchingPlayer.hidden = true;
      dom.registration.container.hidden = true;
      dom.welcomeBack.container.hidden = false;
      if (dom.runSummary && dom.runSummary.container)
        dom.runSummary.container.hidden = true;
      break;
    case dialogPages.runSummary:
      dom.fetchingPlayer.hidden = true;
      dom.registration.container.hidden = true;
      dom.welcomeBack.container.hidden = true;
      if (dom.runSummary && dom.runSummary.container)
        dom.runSummary.container.hidden = false;
      break;
    case dialogPages.registration:
      dom.fetchingPlayer.hidden = true;
      dom.registration.container.hidden = false;
      dom.welcomeBack.container.hidden = true;
      if (dom.runSummary && dom.runSummary.container)
        dom.runSummary.container.hidden = true;
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
    const response = await api.getUserWithCardGuid(guid);

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
    const runs = response.body.slice(0, 5) ?? [];

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
  const locations = response.body.slice(0, 5);

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
