"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";

/** Missing JSDoc comments */
const fetchPlaylistPage = async (
    playlistId: string,
    params?: {
        limit?: number,
        offset?: number,
        fields?: string,
    }
): Promise<{
    playlistTracks?: any,
    error?: {
        code: string,
        message: string,
    }
}> => {
    try {
        // Authorisation
        const accessToken = await getClientCredentialsToken();

        // Create request
        const url = new URL(`https://api.spotify.com/v1/playlists/${ playlistId }/tracks`);
        if (params?.limit) url.searchParams.append("limit", params.limit.toString());
        if (params?.offset) url.searchParams.append("offset", params.offset.toString());
        if (params?.fields) url.searchParams.append("fields", params.fields);

        // Make request
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
        });

        // Process response
        if (!response.ok) throw new Error("Spotify GET /playlist/{id}/tracks failed with status: " + response.status);
        const playlistTracks = await response.json();
        return { playlistTracks };
    }

    catch (error) {
        return {
            error: error instanceof Error
                ? { code: error.name, message: error.message }
                : { code: "UNEXPECTED_ERROR", message: "Invalid type thrown" },
        };
    }
};

export default fetchPlaylistPage;
