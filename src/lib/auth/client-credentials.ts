import Logger from "@/lib/logger";
import spotifyConfig from "@/config/spotify";

/**
 * ===================
 *     TOKEN TYPES
 * ===================
 */

/** Response from Spotify API client credentials request. */
interface ClientCredentialsTokenResponse {
    access_token: string;
    token_type: "Bearer";
    expires_in: number; // SHOULD always be 3600 (1 hour)
}

/** Token object for cached client credentials. */
interface ClientCredentialsToken {
    accessToken: string;
    expires: Date;
}

/**
 * ==========================
 *     CUSTOM ERROR TYPES
 * ==========================
 */

/** Error codes for Spotify client credentials authorisation. */
type ClientCredentialsErrorCode = "AUTH_NETWORK_ERROR" | "AUTH_INVALID_RESPONSE" | "AUTH_UNEXPECTED_ERROR";

/** Custom error class for Spotify client credentials authorisation. */
class ClientCredentialsError extends Error {
    code: ClientCredentialsErrorCode;
    cause?: Error;
    constructor(code: ClientCredentialsErrorCode, message: string, cause?: Error) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "SpotifyAuthError";
    }
}

/**
 * =================
 *     FUNCTIONS
 * =================
 */

/** Cached variable for active token. */
let clientCredentialsToken: ClientCredentialsToken | undefined // Simple client credentials access token caching 

/**
 * Fetches the current access token from Spotify's OAuth2 client credentials flow.
 * @returns {Promise<ClientCredentialsToken>} Object containing current client credentials access token and expiry time.
 */
const fetchClientCredentialsToken = async (): Promise<ClientCredentialsToken> => {
    try {
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
        const data: ClientCredentialsTokenResponse = await res.json();

        // Validate access token response
        if (!data.access_token) throw new ClientCredentialsError("AUTH_INVALID_RESPONSE", "No access_token attribute in Spotify client credentials token response JSON.");
        if (!data.expires_in) throw new ClientCredentialsError("AUTH_INVALID_RESPONSE", "No expires_in attribute in Spotify client credentials token response JSON.");
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
    catch (error) {
        if (!(error instanceof ClientCredentialsError)) {
            throw new ClientCredentialsError(
                "AUTH_NETWORK_ERROR",
                "Failed to fetch client credentials token",
                error instanceof Error ? error : undefined
            );
        }
        throw error;
    }
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
        try {
            const token = await fetchClientCredentialsToken();
            clientCredentialsToken = token; // Cache token
            return token.accessToken
        }
        catch (error) {
            if (!(error instanceof ClientCredentialsError)) {
                throw new ClientCredentialsError(
                    "AUTH_UNEXPECTED_ERROR",
                    "Unexpected error thrown",
                    error instanceof Error ? error : undefined
                );
            }
            throw error;
        }
    }
}
