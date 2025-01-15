"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";
import Logger from "@/lib/logger";

/** Missing JSDoc comments */
const fetchPlaylist = async (playlistId: string): Promise<any | undefined> => {

    const accessToken = await getClientCredentialsToken();
    if (!accessToken) throw new Error("Failed to get a client credentials token.");

    try {
        const baseUrl = "https://api.spotify.com/v1/playlists/";
        const url = new URL(baseUrl + playlistId);
        url.searchParams.append("fields", "tracks(next,items(track(name)))");

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
        });

        if (!response.ok) {
            throw new Error("Spotify GET /playlist/ failed with status: " + response.status);
        }

        const playlist = await response.json();
        Logger.debug("Spotify GET /playlists/ 200");
        return playlist;
    }

    catch (error) {
        Logger.error("Spotify GET /playlist/ failed.", error);
        return;
    }
};

export default fetchPlaylist;
