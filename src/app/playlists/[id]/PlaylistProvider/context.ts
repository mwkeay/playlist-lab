import { createContext, useContext } from "react";

export interface PlaylistProviderContext {
    activeIndexes?: number[]
    error: Error | null
}

export interface PlaylistConsumerContext extends PlaylistProviderContext {
    items?: Record<number, any>
    meta: any
}

export const initContext: PlaylistProviderContext = {
    activeIndexes: undefined,
    error: null,
};

export const PlaylistContext = createContext<PlaylistConsumerContext | undefined>(undefined);

export const usePlaylistContext = () => {
    const context = useContext(PlaylistContext);
    if (!context) throw Error("Playlist context module must be used within a playlist context provider.");
    return context;
}
