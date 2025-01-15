import fetchPlaylist from "@/app/actions/fetchPlaylist";
import { useEffect, useState } from "react";

const usePlaylist = (id: string) => {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchPlaylist(id)
            .then(playlist => {
                if (!playlist) {
                    setError(new Error("Failed to fetch playlist."));
                    return;
                }
                const items = playlist?.tracks?.items;
                if (!items) {
                    setError(new Error("'tracks.items' not found on Spotify playlist object."));
                    return;
                }
                setItems(items);
                setIsLoading(false);
            });
    }, [id]);

    return {
        items,
        isLoading,
        error,
    };
};

export default usePlaylist;
