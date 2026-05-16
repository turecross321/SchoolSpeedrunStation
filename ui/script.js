const MAX_DISPLAY_ITEMS = 5;

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

function launchConfettiBurst() {
  const container = document.getElementById("runSummaryConfetti");
  if (!container) return;

  container.innerHTML = "";
  const colors = ["#0066ff", "#00c2ff", "#6c5ce7", "#ffcf3f", "#ff6b6b"];
  const pieceCount = 36;

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--drift", `${(Math.random() * 2 - 1) * 160}px`);
    piece.style.setProperty("--spin", `${(Math.random() * 2 - 1) * 900}deg`);
    piece.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.width = `${8 + Math.random() * 8}px`;
    piece.style.height = `${10 + Math.random() * 10}px`;
    container.appendChild(piece);
  }

  window.setTimeout(() => {
    if (container) container.innerHTML = "";
  }, 3500);
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

async function initializeRunSummaryPage(
  guid,
  user,
  scanDate,
  newRun,
  previousBestRun,
) {
  try {
    if (
      !previousBestRun ||
      newRun.milliseconds < previousBestRun.milliseconds
    ) {
      // new best
      sound.playFinishBestRun();
    } else {
      sound.playFinishRun();
    }

    const rs = dom.runSummary;
    if (newRun != null) {
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
          launchConfettiBurst();
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

          // Find the user's best result directly from the sorted run list.
          const userBestIndex = allRuns.findIndex(
            (r) => (r.user || {}).id === user.id,
          );

          if (userBestIndex < 0 || userBestIndex >= allRuns.length) {
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
    closeNfcDialog();
    throw e;
  }

  startDialogTimer(15 * 1000, () => closeNfcDialog());
}

async function initializeWelcomeBackPage(guid, user, scanDate) {
  dom.welcomeBack.pfp.src = null;

  dom.welcomeBack.name.innerText = `${user.username}`;
  dom.welcomeBack.pfp.src = api.getUserProfilePictureUrl(user.id);
  dom.welcomeBack.otherStation.innerText = stationNames[config.station ?? 0];

  updateLeaderboard();
  updateRunningRightNow();
  sound.playStartRun();
  startDialogTimer(4 * 1000, () => closeNfcDialog());
}

async function initializeRegistrationPage(guid) {
  sound.playRegistration();

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
  sound.playScan();

  // clear timers from any previous scan so UI resets cleanly
  clearNfcTimers();
  const scanDate = new Date();

  initializeFetchingPlayerPage();
  goToDialogPage(dialogPages.fetchingPlayer);

  dom.nfcDialog.showModal();

  try {
    const response = await api.getUserWithCardGuid(guid);

    if (response.status == 404) {
      goToDialogPage(dialogPages.registration);
      await initializeRegistrationPage(guid);
    } else {
      const locationResponse = await api.submitLocation(guid, scanDate);
      const newRun = locationResponse.body.newRun;
      const previousBestRun = locationResponse.body.previousBestRun;

      if (newRun) {
        initializeRunSummaryPage(
          guid,
          response.body,
          scanDate,
          newRun,
          previousBestRun,
        );
        goToDialogPage(dialogPages.runSummary);
      } else {
        initializeWelcomeBackPage(guid, response.body, scanDate);
        goToDialogPage(dialogPages.welcomeBack);
      }
    }
  } catch (error) {
    closeNfcDialog();
    throw error;
  }
}

async function updateLeaderboard() {
  try {
    const response = await api.getBestRuns();
    const allRuns = response.body ?? [];
    const runs = allRuns.slice(0, MAX_DISPLAY_ITEMS);
    const hasMore = allRuns.length > MAX_DISPLAY_ITEMS;

    // Update count badge
    if (dom.topScoresCount) {
      dom.topScoresCount.innerText = `(${allRuns.length})`;
    }

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
      if (hasMore) {
        dom.leaderboardBody.innerHTML += `
          <tr>
            <td colspan="4" style="text-align: center; padding: 0.75rem; color: #adb5bd; font-size: 1.8rem; letter-spacing: 0.25rem;">…</td>
          </tr>
        `;
      }
    }
  } catch (error) {
    console.error("Leaderboard update failed:", error);
  }
}

async function updateRunningRightNow() {
  const response = await api.getRecentLocations();
  const allLocations = response.body ?? [];
  const locations = allLocations.slice(0, MAX_DISPLAY_ITEMS);
  const hasMore = allLocations.length > MAX_DISPLAY_ITEMS;

  // Update count badge
  if (dom.runningRightNowCount) {
    dom.runningRightNowCount.innerText = `(${allLocations.length})`;
  }

  if (!locations || locations.length === 0) {
    dom.runningRightNowBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty">Inga spelare just nu</td>
      </tr>
    `;
  } else {
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
    if (hasMore) {
      dom.runningRightNowBody.innerHTML += `
        <tr>
          <td colspan="3" style="text-align: center; padding: 0.75rem; color: #adb5bd; font-size: 1.8rem; letter-spacing: 0.25rem;">…</td>
        </tr>
      `;
    }
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
const sound = new SoundManager();

setInterval(() => updateLeaderboard(), 60 * 1000); // Automatically refresh leaderboard every minute
setInterval(() => updateRunningRightNow(), 15 * 1000); // Automatically refresh running right now every 15 seconds

client.connect();
updateLeaderboard();
updateRunningRightNow();

const config = window.APP_CONFIG ?? {};
