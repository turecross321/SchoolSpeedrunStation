class ApiClient {
  constructor() {
    const config = window.APP_CONFIG ?? {};
    this.baseUrl = config.baseUrl ?? "http://127.0.0.1:5055/";
    this.station = config.station ?? 0;
  }

  valuateResponseSuccess(response) {
    switch (response.status) {
      case 400:
      case 0:
        throw new Error(response.status + response.statusText);
        break;
    }
  }

  async get(endpoint) {
    const response = await fetch(this.baseUrl + endpoint);
    this.valuateResponseSuccess(response);

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

    this.valuateResponseSuccess(response);

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
      schoolProgram: program,
    });
  }
}
