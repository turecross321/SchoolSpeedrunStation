const ids = {
  nfcWarning: "nfcWarning",
  fetchingPlayer: "fetchingPlayer",
  notRegistered: "notRegistered",
  welcomeBackRegistered: "welcomeBackRegistered",
  welcomeBackRegisteredPfp: "welcomeBackRegisteredPfp",
  welcomeBackRegisteredName: "welcomeBackRegisteredName",
};

async function onNfcScan(guid) {
  dialog = document.getElementById("nfcDialog");

  // parts of dialog
  fetchingPlayer = document.getElementById(ids.fetchingPlayer);
  notRegistered = document.getElementById(ids.notRegistered);
  welcomeBackRegistered = document.getElementById(ids.welcomeBackRegistered);

  // initialize dialog
  fetchingPlayer.hidden = false;
  notRegistered.hidden = true;
  welcomeBackRegistered.hidden = true;

  // todo: split

  dialog.showModal();

  try {
    const response = await api.getUser(guid);

    if (response.status == 404) {
      fetchingPlayer.hidden = true;
      notRegistered.hidden = false;
      welcomeBackRegistered.hidden = true;
    } else {
      // todo: separate function probably

      const userText = document.getElementById(ids.welcomeBackRegisteredName);
      const userPfp = document.getElementById(ids.welcomeBackRegisteredPfp);

      const user = response.body;

      userText.innerText = user.username + " (" + user.cardGuid + ")";
      userPfp.src = api.getUserProfilePictureUrl(guid);

      fetchingPlayer.hidden = true;
      notRegistered.hidden = true;
      welcomeBackRegistered.hidden = false;

      await api.submitLocation(guid);
    }

    setTimeout(() => {
      dialog.close();
    }, 5000);

    console.log(guid);
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
