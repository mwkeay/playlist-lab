import fetchPlaylistMeta from "@/app/actions/fetchPlaylistMeta";
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
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {        
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
    }, [items, sortOptions]);

    /**
     * Fetch playlist tracks
     */
    useEffect(() => {
        const wrapper = async () => {
            const { items: itemsArray, error } = await fetchPlaylistTracks(playlistId);
            if (error) {
                Logger.error(error.message, error);
                setError(new Error(error.message, { cause: error.cause }));
                return;
            }
            // Convert array to indexed dictionary and array of indexes
            const items = listToIndexedDictionary(itemsArray);
            const indexes = Array.from({ length: itemsArray.length }, (_, index) => index);
            
            // Set states
            setItems(items);
            setActiveIndexes(indexes);
        };
        wrapper();
    }, [playlistId]);

    /**
     * Fetch playlist meta
     */
    useEffect(() => {
        const wrapper = async () => {
            const { playlist: meta, error } = await fetchPlaylistMeta(playlistId);
            if (error) {
                Logger.error(error.message, error);
                setError(new Error(error.message, { cause: error.cause }));
                return;
            }
            setMeta(meta);
        };
        wrapper();
    }, [playlistId]);

    return {
        meta,
        items,
        activeIndexes,
        setSortOptions,
        error,
    };
};

export default usePlaylist;
