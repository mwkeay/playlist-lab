"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";
import Logger from "@/lib/logger";

/** Missing JSDoc comments */
const fetchPlaylistPage = async (playlistId: string): Promise<{ playlist: any, error?: { code: string, message: string } }> => {
    try {
        const accessToken = await getClientCredentialsToken();
        const baseUrl = "https://api.spotify.com/v1/playlists/";
        const url = new URL(baseUrl + playlistId);
        const fields = "tracks(next,items(track(name)))";
        url.searchParams.append("fields", fields);

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
        return { playlist };
    }

    catch (error) {
        return {
            playlist: undefined,
            error: error instanceof Error
                ? { code: error.name, message: error.message }
                : { code: "UNEXPECTED_ERROR", message: "Invalid type thrown" },
        };
    }
};

export default fetchPlaylistPage;
