import spotifyConfig from "@/config/spotify";
import Logger from "@/lib/logger";

interface ClientCredentialsTokenResponse {
    access_token: string
    token_type: "Bearer"
    expires_in: number // SHOULD always be 3600 (1 hour)
}

interface ClientCredentialsToken {
    accessToken: string
    expires: Date
}

// Top level object as basic token storage
let clientCredentialsToken: ClientCredentialsToken | undefined = undefined;

/** *!!! Missing JSDoc comments* */
const fetchClientCredentialsToken = async (): Promise<ClientCredentialsToken | undefined> => {

    try {
        const startTime = Date.now();

        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: spotifyConfig.clientId,
                client_secret: spotifyConfig.clientSecret,
            }),
        });

        const data: ClientCredentialsTokenResponse = await res.json();
        if (!data.access_token) throw new Error("No access_token attribute in Spotify client credentials token response JSON.");
        if (!data.expires_in) throw new Error("No expires_in attribute in Spotify client credentials token response JSON.");
        if (data.expires_in != 3600) Logger.error("Unexpected expires_in length in Spotify client credentials token response JSON.");

        const token: ClientCredentialsToken = {
            accessToken: data.access_token,
            expires: new Date(startTime + (data.expires_in * 1000)),
        };

        Logger.debug("Client credentials token updated.", {
            accessToken: token.accessToken,
            expires: token.expires.toString(),
        });

        clientCredentialsToken = token;

        return token;
    }

    catch (error) {
        Logger.error("Failed to fetch client credentials token.", error);
        return;
    }
};

/** *!!! Missing JSDoc comments* */
const getClientCredentialsToken = async (): Promise<ClientCredentialsToken | undefined> => {
    
    if (clientCredentialsToken?.accessToken && clientCredentialsToken.expires > new Date()) {
        return clientCredentialsToken;
    }
    
    else {
        try {
            const token = await fetchClientCredentialsToken();
            return token;
        }
        catch (error) {
            Logger.error("Failed to fetch new client credentials token.", error);
            return;
        }
    }
};

export default getClientCredentialsToken;
