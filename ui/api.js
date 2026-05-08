class ApiClient {
    constructor() {
        //this.baseUrl = "https://api-speedrun.ture.fish:443/";
        this.baseUrl = "http://127.0.0.1:5055/";
    }

    async get(endpoint) {
        const response = await fetch(this.baseUrl + endpoint);
            
        if (response.status == 0)
            throw new Error("No response from server");
            

        const body = await response.json();
        return {"body": body, "status": response.status};
    }

    url(endpoint) {
        return this.baseUrl + endpoint;
    }

    async getUser(uid) {
        //result = {"cardGuid": "2AEF014F", "username": "TureBeast", "profilePictureHash": ""}
        const result = await this.get("users/" + uid);
        return result;
    }

    getUserProfilePicture(guid) {
        return this.url(guid + "/profilePicture");    
    }

    async getBestRuns() {
        //const result = await this.get("bestUnique");
        return result;
    }
}