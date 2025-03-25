"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";
import formatServerActionError, { ServerActionError } from "@/lib/formatServerActionError";
import Logger from "@/lib/logger";

const fetchPlaylist = async (
    playlistId: string,
    fields: string,
): Promise<{
    playlist?: any,
    error?: ServerActionError,
}> => {
    try {
        // Authorisation
        const accessToken = await getClientCredentialsToken();

        // Create request
        const url = new URL("https://api.spotify.com/v1/playlists/" + playlistId);
        url.searchParams.append("fields", fields);

        // Make request
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
        });

        // Process response
        if (!response.ok) throw new Error("Spotify GET /playlist/{id}/tracks failed with status " + response.status + ": " + response.statusText);
        const playlist = await response.json();
        return { playlist };
    }
    catch (error) {
        Logger.error("Server action fetchAllPlaylistTracks failed", error); // Log error server-side
        return {
            error: formatServerActionError(error), // Format error for HTTP body
        };
    }
};

export default fetchPlaylist;
