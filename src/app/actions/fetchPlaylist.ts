"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";

const fetchPlaylist = async (
    playlistId: string,
    params?: {
        fields: string,
    },
): Promise<{
    playlist?: any,
    error?: {
        code: string,
        message: string,
    }
}> => {
    try {
        // Authorisation
        const accessToken = await getClientCredentialsToken();

        // Create request
        const url = new URL("https://api.spotify.com/v1/playlists/" + playlistId);
        if (params?.fields) url.searchParams.append("fields", params.fields);

        // Make request
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
        });

        // Process response
        if (!response.ok) throw new Error("Spotify GET /playlist/{id} failed with status: " + response.status);
        const playlist = await response.json();
        return { playlist };
    }
    catch (error) {
        return {
            error: error instanceof Error
                ? { code: error.name, message: error.message }
                : { code: "UNEXPECTED_ERROR", message: "Invalid type thrown" },
        };
    }
};

export default fetchPlaylist;
