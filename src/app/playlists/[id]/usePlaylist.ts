import fetchPlaylistMeta from "@/app/actions/fetchPlaylistMeta";
import fetchPlaylistTracks from "@/app/actions/fetchPlaylistTracks";
import listToIndexedDictionary from "@/lib/listToIndexedDictionary";
import Logger from "@/lib/logger";
import { useEffect, useState } from "react";

const usePlaylist = (playlistId: string) => {
    const [meta, setMeta] = useState<any>();
    const [items, setItems] = useState<Record<number, any>>();
    const [error, setError] = useState<Error | null>(null);

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
            const items = listToIndexedDictionary(itemsArray);            
            setItems(items);
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
        error,
    };
};

export default usePlaylist;
