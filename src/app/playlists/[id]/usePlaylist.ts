import fetchPlaylistPage from "@/app/actions/fetchPlaylistPage";
import { useEffect, useState } from "react";

type PlaylistErrorCode = "PLAYLIST_FETCH_FAILED" | "PLAYLIST_INVALID_RESPONSE" | "PLAYLIST_UNEXPECTED_ERROR";

class PlaylistError extends Error {
    code: PlaylistErrorCode;
    cause?: unknown;
    constructor(code: PlaylistErrorCode, message: string, cause?: unknown) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "PlaylistError";
    }
}

const usePlaylist = (playlistId: string) => {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Define recursive function
        const fetchPlaylistTracks = async (fetched: number = 0): Promise<any[]> => {

            // Fetch
            const { playlistTracks, error } = await fetchPlaylistPage(playlistId, {
                offset: fetched,
                fields: "total,items(track(name,artists(name,external_urls),album(name,external_urls),external_urls))",
            });
            const tracks = playlistTracks?.items;
            const total = playlistTracks?.total;

            // Catch errors
            if (error) throw error;
            if (!Array.isArray(tracks)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'items' property is not an array");
            if (tracks.length == 0) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Received empty 'items' array");
            if (!Number.isInteger(total)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property is not an integer");
            if (fetched + tracks.length > total) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Fetched more tracks than playlist total");
            
            // Recurse
            if (fetched + tracks.length < total) {
                const remainingTracks = await fetchPlaylistTracks(fetched + tracks.length);
                tracks.push(...remainingTracks);
                return tracks;
            }
            
            // Complete final recursion
            return tracks;
        }
        // Call recursive function
        fetchPlaylistTracks()
        .then((tracks) => {
            setItems(tracks);
            setIsLoading(false);
        })
        .catch((error) => {
            setError(
                error instanceof PlaylistError
                    ? error
                    : new PlaylistError("PLAYLIST_UNEXPECTED_ERROR", "Caught unexpected error", error)
            );
        });
    }, [playlistId]);

    return {
        items,
        isLoading,
        error,
    };
};

export default usePlaylist;
