import fetchPlaylist from "@/app/actions/fetchPlaylist";
import fetchPlaylistTracks from "@/app/actions/fetchPlaylistTracks";
import listToIndexedDictionary from "@/lib/listToIndexedDictionary";
import Logger from "@/lib/logger";
import { useEffect, useState } from "react";

export type SortKey = "CUSTOM_ORDER" | "TITLE" | "ARTIST" | "ALBUM" | "DURATION";

export interface SortOptions {
    key: SortKey
    direction: "ASC" | "DESC"
}

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
    // Playlist content
    const [meta, setMeta] = useState<any>();
    const [items, setItems] = useState<Record<number, any>>({});
    // Local content
    const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
    const [sortOptions, setSortOptions] = useState<SortOptions>({ key: "CUSTOM_ORDER", direction: "ASC"});
    // Handling
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isLoading) return;
        
        const { key, direction } = sortOptions;

        const getSortKey = (i: number): string | number => {
            switch (key) {
                case "CUSTOM_ORDER": return i;
                case "TITLE": return items[i]?.track?.name || "";
                case "ARTIST": return items[i]?.track?.artists?.[0]?.name || "";
                case "ALBUM": return items[i]?.track?.album?.name || "";
                case "DURATION": return items[i]?.track?.duration_ms || "";
                default: return "";
            }
        };

        const compare = (a: string | number, b: string | number) => {
            if (typeof a === "string" && typeof b === "string") {
                return direction === "ASC" ? a.localeCompare(b) : b.localeCompare(a);
            }
            if (typeof a === "number" && typeof b === "number") {
                return direction === "ASC" ? a - b : b - a;
            }
            else {
                Logger.error("Unexpected types in playlist bubble sort comparison");
                // Handle corrupted items by always sorting them to the end
                if (typeof a !== "string" && typeof a !== "number") {
                    return 1; // `a` is corrupted, so place it after `b`
                }
                if (typeof b !== "string" && typeof b !== "number") {
                    return -1; // `b` is corrupted, so place it after `a`
                }
                return 0;
            }
        };

        const indexes = Array.from({ length: Object.keys(items).length }, (_, index) => index);
        const sortedIndexes = indexes.sort((a, b) =>
            compare(getSortKey(a), getSortKey(b))
        );
        setActiveIndexes(sortedIndexes);
    }, [items, sortOptions, isLoading]);

    useEffect(() => {
        // Recursive function
        const fetchRemainingItems = async (fetched: number): Promise<any[]> => {

            // Fetch
            const { playlistTracks, error } = await fetchPlaylistTracks(playlistId, {
                offset: fetched,
                fields: "total,items(track(name,duration_ms,artists(name),album(name)))",
            });
            const itemsArray = playlistTracks?.items;
            const total = playlistTracks?.total;

            // Catch errors
            if (error) throw error;
            if (!itemsArray) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'items' property not found in playlist/{id}/tracks response");
            if (!Array.isArray(itemsArray)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'items' property is not an array in playlist/{id}/tracks response");
            if (itemsArray.length == 0) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Received empty 'items' array in playlist/{id}/tracks response");
            if (!Number.isInteger(total)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property is not an integer in playlist/{id}/tracks response");
            if (fetched + itemsArray.length > total) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "Fetched more tracks than playlist total in playlist/{id}/tracks response");
            
            // Fetch remaining items
            if (fetched + itemsArray.length < total) {
                const remainingItems = await fetchRemainingItems(fetched + itemsArray.length);
                itemsArray.push(...remainingItems);
            }
            return itemsArray;
        };
        // Async wrapper function
        const fetchEntirePlaylist = async () => {
            try {
                // Fetch
                const { playlist, error } = await fetchPlaylist(playlistId, {
                    fields: "tracks(total,items(track(name,duration_ms,artists(name),album(name)))),name,description,images"
                });
                if (error) throw error;
                const { tracks: { items: itemArray, total }, ...meta } = playlist;

                // Validate response
                if (!total) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property not found in playlist response");
                if (!Number.isInteger(total)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'total' property is not an integer in playlist response");
                if (!itemArray) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' property not found in playlist response");
                if (!Array.isArray(itemArray)) throw new PlaylistError("PLAYLIST_INVALID_RESPONSE", "'tracks.items' property is not an array in playlist response");

                // Set meta
                setMeta(meta);

                // Fetch remaining items
                if (itemArray.length < total) {
                    const remainingItemsArray = await fetchRemainingItems(itemArray.length);
                    itemArray.push(...remainingItemsArray);
                }

                // Convert array to indexed dictionary and array of indexes
                const items = listToIndexedDictionary(itemArray);
                const indexes = Array.from({ length: itemArray.length }, (_, index) => index);
                
                // Set states
                setItems(items);
                setActiveIndexes(indexes);
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
        activeIndexes,
        setSortOptions,
        isLoading,
        error,
    };
};

export default usePlaylist;
