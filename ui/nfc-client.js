class NfcClient {
  constructor(url, onNfcScan, onConnect, onDisconnect) {
    this.url = url;
    this.socket = null;
    this.onNfcScan = onNfcScan;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;

    // bind methods so "this" works inside event handlers
    this.socketOpen = this.socketOpen.bind(this);
    this.socketMessage = this.socketMessage.bind(this);
    this.socketClose = this.socketClose.bind(this);
    this.socketError = this.socketError.bind(this);
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", this.socketOpen);
    this.socket.addEventListener("message", this.socketMessage);
    this.socket.addEventListener("close", this.socketClose);
    this.socket.addEventListener("error", this.socketError);
  }

  socketOpen() {
    console.log("Connected to server");
    this.onConnect();
  }

  socketMessage(event) {
    const message = event.data;
    if (this.onNfcScan) {
      this.onNfcScan(message);
    }
  }

  socketClose() {
    console.log("Disconnected from server");
    this.onDisconnect();
  }

  socketError(error) {
    console.error("WebSocket error:", error);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}