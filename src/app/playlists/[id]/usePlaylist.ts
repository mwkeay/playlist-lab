import fetchPlaylist from "@/app/actions/fetchPlaylist";
import fetchPlaylistTracks from "@/app/actions/fetchPlaylistTracks";
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
    const [meta, setMeta] = useState<any>();
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Recursive function
        const fetchRemainingItems = async (fetched: number): Promise<any[]> => {

            // Fetch
            const { playlistTracks, error } = await fetchPlaylistTracks(playlistId, {
                offset: fetched,
                fields: "total,items(track(name,artists(name),album(name)))",
            });
            const items = playlistTracks?.items;
            const total = playlistTracks?.total;

            // Catch errors
            if (error) throw error;
            if (!items) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'items' property not found in playlist/{id}/tracks response");
            if (!Array.isArray(items)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'items' property is not an array in playlist/{id}/tracks response");
            if (items.length == 0) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Received empty 'items' array in playlist/{id}/tracks response");
            if (!Number.isInteger(total)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property is not an integer in playlist/{id}/tracks response");
            if (fetched + items.length > total) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Fetched more tracks than playlist total in playlist/{id}/tracks response");
            
            // Fetch remaining items
            if (fetched + items.length < total) {
                const remainingItems = await fetchRemainingItems(fetched + items.length);
                items.push(...remainingItems);
            }
            return items;
        };
        // Async wrapper function
        const fetchEntirePlaylist = async () => {
            try {
                // Fetch
                const { playlist, error } = await fetchPlaylist(playlistId, {
                    fields: "tracks(total,items(track(name,artists(name),album(name)))),name,description,images"
                });
                if (error) throw error;
                const { tracks: { items, total }, ...meta } = playlist;

                // Validate response
                if (!total) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property not found in playlist response");
                if (!Number.isInteger(total)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property is not an integer in playlist response");
                if (!items) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' property not found in playlist response");
                if (!Array.isArray(items)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' property is not an array in playlist response");

                // Fetch remaining items
                if (items.length < total) {
                    const remainingItems = await fetchRemainingItems(items.length);
                    items.push(...remainingItems);
                }
                
                // Set states
                setMeta(meta);
                setItems(items);
                setIsLoading(false);
            }
            catch (error) {
                setError(
                    error instanceof PlaylistError
                        ? error
                        : new PlaylistError("PLAYLIST_UNEXPECTED_ERROR", "Caught unexpected error", error)
                );
            }
        };
        fetchEntirePlaylist()
    }, [playlistId]);

    return {
        meta,
        items,
        isLoading,
        error,
    };
};

export default usePlaylist;
