import { FC, ReactNode, useEffect, useState } from "react";
import usePlaylist from "../usePlaylist";
import { PlaylistConsumerContext, PlaylistContext, PlaylistProviderContext, initContext } from "./context";
import Logger from "@/lib/logger";

export const PlaylistProvider: FC<{
    children: ReactNode,
    id: string,
}> = ({
    children,
    id,
}) => {

    // ==================
    //     Initialise
    // ==================

    // Fetch playlist data from Spotify
    const {items, meta, error: fetchError} = usePlaylist(id);

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

    // ======================
    //     Return Context
    // ======================

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
