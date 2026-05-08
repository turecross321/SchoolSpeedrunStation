const ids = {
  nfcWarning: "nfcWarning",
  fetchingPlayer: "fetchingPlayer",
  notRegistered: "notRegistered",
  welcomeBackRegistered: "welcomeBackRegistered",
};

async function onNfcScan(uid) {
  dialog = document.getElementById("nfcDialog");

  // parts of dialog
  fetchingPlayer = document.getElementById(ids.fetchingPlayer);
  notRegistered = document.getElementById(ids.notRegistered);
  welcomeBackRegistered = document.getElementById(ids.welcomeBackRegistered);

  // initialize dialog
  fetchingPlayer.hidden = false;
  notRegistered.hidden = true;
  welcomeBackRegistered.hidden = true;

  dialog.showModal();

  try {
    const response = await api.getUser(uid);

    if (response.status == 404) {
      fetchingPlayer.hidden = true;
      notRegistered.hidden = false;
      welcomeBackRegistered.hidden = true;
    } else {
      userText = document.getElementById("nfcUserText");
      const user = response.body;

      userText.innerText = user.username + " (" + user.cardGuid + ")";

      fetchingPlayer.hidden = true;
      notRegistered.hidden = true;
      welcomeBackRegistered.hidden = false;
    }

    setTimeout(() => {
      dialog.close();
    }, 5000);

    console.log(uid);
  } catch (error) {
    dialog.close();
    throw error;
  }
}

function onConnect() {
  const element = document.getElementById(ids.nfcWarning);
  element.hidden = true;
}

function onDisconnect() {
  const element = document.getElementById(ids.nfcWarning);
  element.hidden = false;
  client.connect();
}

const client = new NfcClient(
  "ws://localhost:6769",
  onNfcScan,
  onConnect,
  onDisconnect,
);
client.connect();

const api = new ApiClient();
