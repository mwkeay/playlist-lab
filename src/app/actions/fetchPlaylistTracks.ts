"use server";

import { getClientCredentialsToken } from "@/lib/auth/client-credentials";
import formatServerActionError, { ServerActionError } from "@/lib/formatServerActionError";
import Logger from "@/lib/logger";

const fetchPlaylistTracks = async (
    playlistId: string,
    fields: string,
): Promise<{
    items?: any,
    error?: ServerActionError,
}> => {
    try {
        // Authorisation
        const accessToken = await getClientCredentialsToken();

        // Request function
        const requestTracks = async (offset: number = 0) => {
            const url = new URL(`https://api.spotify.com/v1/playlists/${ playlistId }/tracks`);
            url.searchParams.append("fields", fields);
            url.searchParams.append("offset", offset.toString());
            url.searchParams.append("limit", "100")

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + accessToken,
                },
            });

            // Process response
            if (!response.ok) throw new Error("Spotify GET /playlist/{id}/tracks failed with status " + response.status + ": " + response.statusText);
            const tracks = await response.json();
            return tracks;
        };

        // Fetch first page
        const items = [];
        const { items: pageItems, total } = await requestTracks();
        if (!Array.isArray(pageItems)) throw new Error("Unexpected response: items is not an array");
        if (typeof total !== "number") throw new Error("Unexpected response: total is not a number");
        items.push(...pageItems);

        // Fetch remaining pages
        const remainingRequests = [];
        for (let offset = items.length; offset < total; offset += 100) {
            remainingRequests.push(requestTracks(offset));
        };
        const remainingPages = await Promise.all(remainingRequests);
        remainingPages.forEach(({ items: pageItems }) => items.push(...pageItems));

        // Return to client
        return { items };
    }
    catch (error) {
        Logger.error("Server action fetchAllPlaylistTracks failed", error); // Log error server-side
        return {
            error: formatServerActionError(error), // Format error for HTTP body
        };
    }
};

export default fetchPlaylistTracks;
