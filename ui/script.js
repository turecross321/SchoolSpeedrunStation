// 1. Elementreferenser (DOM-cache)
const dom = {
  nfcDialog: document.getElementById("nfcDialog"),
  nfcWarning: document.getElementById("nfcWarning"),
  fetchingPlayer: document.getElementById("fetchingPlayer"),
  notRegistered: document.getElementById("notRegistered"),
  welcomeBack: {
    container: document.getElementById("welcomeBackRegistered"),
    name: document.getElementById("welcomeBackRegisteredName"),
    pfp: document.getElementById("welcomeBackRegisteredPfp"),
  },
  register: {
    form: document.getElementById("registerForm"),
    username: document.getElementById("registerUsername"),
    program: document.getElementById("registerProgram"),
    content: document.getElementById("registerTermsContent"),
  },
};

// Global variabel för att hålla koll på aktivt kort
let currentGuid = null;

// 2. NFC Logik
async function onNfcScan(guid) {
  currentGuid = guid;

  // Initiera dialogen (visa laddnings-vy)
  dom.fetchingPlayer.hidden = false;
  dom.notRegistered.hidden = true;
  dom.welcomeBack.container.hidden = true;

  dom.nfcDialog.showModal();

  try {
    const response = await api.getUser(guid);

    if (response.status == 404) {
      // Visa registreringsformulär
      dom.fetchingPlayer.hidden = true;
      dom.notRegistered.hidden = false;

      // Nollställ formuläret för den nya användaren
      dom.register.form.reset();
      dom.register.content.open = false;
    } else {
      // Befintlig användare - fyll i välkomstinfo
      const user = response.body;
      dom.welcomeBack.name.innerText = `${user.username} (${user.cardGuid})`;
      dom.welcomeBack.pfp.src = api.getUserProfilePictureUrl(guid);

      dom.fetchingPlayer.hidden = true;
      dom.welcomeBack.container.hidden = false;

      await api.submitLocation(guid);

      setTimeout(() => {
        dom.nfcDialog.close();
      }, 4000);
    }
  } catch (error) {
    dom.nfcDialog.close();
    console.error("NFC Scan Error:", error);
  }
}

// 3. Registreringslogik
async function register(event) {
  event.preventDefault();

  const data = {
    username: dom.register.username.value,
    program: dom.register.program.value,
    guid: currentGuid,
  };

  try {
    const response = await api.register(data.guid, data.username, data.program);
    alert(`Välkommen ${response.body.username}! Du är nu registrerad.`);

    dom.register.form.reset();
    dom.nfcDialog.close();
  } catch (error) {
    alert("Kunde inte registrera spelare.");
    console.error(error);
  }
}

// 4. Anslutningsstatus
function onConnect() {
  dom.nfcWarning.hidden = true;
}

function onDisconnect() {
  dom.nfcWarning.hidden = false;
  client.connect();
}

// 5. Initiering
const api = new ApiClient();
const client = new NfcClient(
  "ws://localhost:6769",
  onNfcScan,
  onConnect,
  onDisconnect,
);

client.connect();

// Koppla submit-eventet
dom.register.form.addEventListener("submit", register);
