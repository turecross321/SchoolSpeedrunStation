class ApiClient {
  constructor() {
    //this.baseUrl = "https://api-speedrun.ture.fish:443/";
    this.baseUrl = "http://127.0.0.1:5055/";

    // todo: separate this into an environment file and import it with modules.
    // i will need to serve the website with a server for that to work.
    // maybe i can do that with python? so its literally just a main.py that powers both the
    // website, and the nfc shit
    this.station = 0;
  }

  async get(endpoint) {
    const response = await fetch(this.baseUrl + endpoint);

    if (response.status == 0) throw new Error("No response from server");

    const body = await response.json();
    return { body: body, status: response.status };
  }

  async post(endpoint, postBody) {
    const response = await fetch(this.baseUrl + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    });

    if (response.status == 0) throw new Error("No response from server");

    const body = await response.json();
    return { body: body, status: response.status };
  }

  url(endpoint) {
    return this.baseUrl + endpoint;
  }

  async getUser(uid) {
    //result = {"cardGuid": "2AEF014F", "username": "TureBeast", "profilePictureHash": ""}
    const result = await this.get("users/" + uid);
    return result;
  }

  getUserProfilePictureUrl(guid) {
    return this.url("users/" + guid + "/profilePicture");
  }

  async getBestRuns() {
    //const result = await this.get("bestUnique");
    return result;
  }

  async submitLocation(guid) {
    const body = {
      position: this.station,
      cardGuid: guid,
      date: new Date(),
    };

    return this.post("locations/submit", body);
  }

  async register(guid, username, program) {
    return this.post("users/register", {
      cardGuid: guid,
      username: username,
      program: program,
    });
  }
}
