import fetchPlaylistPage from "@/app/actions/fetchPlaylistPage";
import { useEffect, useMemo, useState } from "react";

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

const usePlaylist = (id: string) => {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const { playlist, error } = await fetchPlaylistPage(id);
                if (error) throw new PlaylistError("PLAYLIST_FETCH_FAILED", error.message)
                const items = playlist?.tracks?.items;
                if (!items) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' not found in playlist response.");
                if (!Array.isArray(items)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' was not an array.");
                setItems(items);
                setIsLoading(false);
            }
            catch (error) {
                if (!(error instanceof PlaylistError)) {
                    setError(new PlaylistError("PLAYLIST_UNEXPECTED_ERROR", "Caught unexpected error.", error));
                    return;
                }
                setError(error);
            }
        };
        fetchPlaylist();
    }, [id]);

    return {
        items,
        isLoading,
        error,
    };
};

export default usePlaylist;
