import Logger from "@/lib/logger";
import spotifyConfig from "@/config/spotify";

// Response structure from Spotify API client credentials request
interface ClientCredentialsTokenResponse {
    access_token: string
    token_type: "Bearer"
    expires_in: number // SHOULD always be 3600 (1 hour)
}

// Cached client credentials token object structure
interface ClientCredentialsToken {
    accessToken: string
    expires: Date
}

let clientCredentialsToken: ClientCredentialsToken | undefined // Simple client credentials access token caching 

/**
 * Fetches the current access token from Spotify's OAuth2 client credentials flow.
 * @returns {Promise<ClientCredentialsToken>} Object containing current client credentials access token and expiry time.
 */
const fetchClientCredentialsToken = async (): Promise<ClientCredentialsToken> => {

    const startTime = Date.now(); // Begin timing to factor in response time to the calculated expiry time

    // https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
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

    // Validate access token response
    const data: ClientCredentialsTokenResponse = await res.json();
    if (!data.access_token) throw new Error("No access_token attribute in Spotify client credentials token response JSON.");
    if (!data.expires_in) throw new Error("No expires_in attribute in Spotify client credentials token response JSON.");
    if (data.expires_in != 3600) Logger.warn("Unexpected expires_in length in Spotify client credentials token response JSON.");

    // Format to be cached
    const token: ClientCredentialsToken = {
        accessToken: data.access_token,
        expires: new Date(startTime + (data.expires_in * 1000)),
    };

    Logger.info("Client credentials token updated.", {
        accessToken: token.accessToken,
        expires: token.expires.toString(),
    });

    return token;
}

/**
 * Provides the current client credentials access token for public API requests to Spotify.
 * @returns {Promise<string | undefined>} Current client credentials access token.
 */
export const getClientCredentialsToken = async (): Promise<string | undefined> => {
    // Cached token exists and has not expired
    if (clientCredentialsToken?.accessToken && clientCredentialsToken.expires > new Date()) {
        return clientCredentialsToken.accessToken;
    }
    // New token required
    else {
        // Handle authorisation errors
        try {
            const token = await fetchClientCredentialsToken();
            clientCredentialsToken = token; // Cache token
            return token.accessToken
        }
        catch (error) {
            Logger.error("Client credentials authorisation flow failed.", error);
            return;
        }
    }
}
