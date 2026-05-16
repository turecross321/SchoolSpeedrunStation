class ApiClient {
  constructor() {
    const config = window.APP_CONFIG ?? {};
    this.baseUrl = config.baseUrl ?? "http://127.0.0.1:5055/";
    this.registrationPageUrl =
      config.registrationPageUrl ?? "http://127.0.0.1:5056";
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

  async postPhoto(endpoint, photo) {
    const formData = new FormData();
    const fileName = photo?.name ?? "unknown.png";
    formData.append("file", photo, fileName);

    const response = await fetch(this.baseUrl + endpoint, {
      method: "POST",
      body: formData,
    });

    this.valuateResponseSuccess(response);

    return { status: response.status };
  }

  url(endpoint) {
    return this.baseUrl + endpoint;
  }

  async getUserWithCardGuid(uid) {
    const result = await this.get("users/cardGuid/" + uid);
    return result;
  }

  getUserProfilePictureUrl(id) {
    return this.url("users/" + id + "/profilePicture");
  }

  async getBestRuns() {
    const body = [
      {
        id: 3,
        finishDate: "2026-05-14T16:56:11.463+00:00",
        milliseconds: 13802,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 17,
          username: "Guy",
          registrationDate: "2026-05-14T16:54:47.3123423+00:00",
          schoolProgram: 2,
        },
      },
      {
        id: 2,
        finishDate: "2026-05-14T16:30:15.631+00:00",
        milliseconds: 16521,
        startPosition: 0,
        endPosition: 1,
        user: {
          id: 12,
          username: "TheCraziestGamerBro98",
          registrationDate: "2026-05-14T16:29:25.3370111+00:00",
          schoolProgram: 3,
        },
      },
      {
        id: 1,
        finishDate: "2026-05-14T14:40:52.881+00:00",
        milliseconds: 53618,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 1,
          username: "TureBeast",
          registrationDate: "2026-05-14T14:36:05.1060894+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 5,
        finishDate: "2026-05-14T17:05:12.702+00:00",
        milliseconds: 71871,
        startPosition: 0,
        endPosition: 1,
        user: {
          id: 18,
          username: "Guy2",
          registrationDate: "2026-05-14T17:03:16.8098538+00:00",
          schoolProgram: 17,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
      {
        id: 4,
        finishDate: "2026-05-14T17:02:04.875+00:00",
        milliseconds: 579559,
        startPosition: 1,
        endPosition: 0,
        user: {
          id: 14,
          username: "BigBiz",
          registrationDate: "2026-05-14T16:40:18.488058+00:00",
          schoolProgram: 11,
        },
      },
    ];

    //return { status: 200, body: body };
    return await this.get("runs/bestUnique");
  }

  async submitLocation(guid, date = new Date()) {
    const body = {
      position: this.station,
      cardGuid: guid,
      date,
    };

    return this.post("locations/submit", body);
  }

  async register(guid, username, program) {
    return this.post("users/register", {
      cardGuid: guid,
      username: username,
      schoolProgram: parseInt(program),
    });
  }

  async setProfilePicture(guid, photo) {
    return this.postPhoto("users/" + guid + "/setProfilePicture", photo);
  }

  async getRecentLocations() {
    const body = [
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
      {
        id: 165,
        date: "2026-05-16T11:49:01.277+00:00",
        position: 1,
        user: {
          id: 41,
          username: "FastManMan8",
          registrationDate: "2026-05-16T11:32:19.2119342+00:00",
          schoolProgram: 10,
        },
      },
    ];

    //return { status: 200, body: body };

    return this.get("locations/recent");
  }

  async requestRegistration(guid) {
    return this.post("users/requestRegistration", { cardGuid: guid });
  }

  getRegistrationUrl(id) {
    return this.registrationPageUrl + "?id=" + id;
  }

  async isRegistrationScanned(id) {
    return this.get("users/registrations/" + id + "/scanned");
  }
}
