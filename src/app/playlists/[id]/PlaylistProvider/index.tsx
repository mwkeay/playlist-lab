import { FC, ReactNode, useEffect, useState } from "react";
import useSpotifyPlaylist from "../useSpotifyPlaylist";
import { PlaylistConsumerContext, PlaylistContext, PlaylistProviderContext, initContext } from "./context";
import { sortPlaylist } from "./sorting";

export const PlaylistProvider: FC<{
    children: ReactNode,
    id: string,
}> = ({
    children,
    id,
}) => {

    // Fetch playlist data from Spotify
    const {items, meta, error: fetchError} = useSpotifyPlaylist(id);

    // Create context object state
    const [providerContext, setProviderContext] = useState<PlaylistProviderContext>(initContext);

    // Create active indexes
    useEffect(() => {
        if (!items) setProviderContext(context => ({ ...context, activeIndexes: undefined }));
        else {
            const indexes = Array.from({ length: Object.keys(items).length }, (_, index) => index);
            setProviderContext(context => ({ ...context, activeIndexes: indexes }));
        }
    }, [items]);

    // Handle sorting
    useEffect(() => {
        if (!items) return;
        setProviderContext(prev => {
            const indexes = prev.activeIndexes ?? Array.from({ length: Object.keys(items).length }, (_, index) => index);
            const activeIndexes = sortPlaylist(items, indexes, providerContext.sortingRules);
            return { ...prev, activeIndexes };
        });
    }, [providerContext.sortingRules, items]);

    // Combine single context provider context and separated consumer context
    const consumerContext: PlaylistConsumerContext = {
        items,
        meta,
        ...providerContext,
    };
    
    return (
        <PlaylistContext.Provider value={consumerContext}>
            {children}
        </PlaylistContext.Provider>
    );
}
