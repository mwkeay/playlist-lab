export interface SpotifyConfig {
    clientId: string
    clientSecret: string
}

/**
 * Checks for environment variables from `.env.local` and returns them as an object to be exported. Throws an error if any variables are missing.
 * @returns {SpotifyConfig} Object containing local environment variables for Spotify.
 */
function validateSpotifyConfig(): SpotifyConfig {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        throw new Error("Missing Spotify configuration.");
    }

    return {
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
    };
}

const spotifyConfig = validateSpotifyConfig(); // Run validation on import

export default spotifyConfig;
