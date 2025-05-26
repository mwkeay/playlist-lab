import { createContext, useContext } from "react";
import { SortingRules } from "./sorting";

// Column type
export type ColumnType = "custom_order" | "name" | "artists" | "album" | "duration";

// Context object for the Provider
export interface PlaylistProviderContext {
    activeIndexes?: number[]
    error: Error | null
    sortingRules: SortingRules
}

// Context object for the Consumer
export interface PlaylistConsumerContext extends PlaylistProviderContext {
    items?: Record<number, any>
    meta: any
}

// Initial null context object for startup
export const initContext: PlaylistProviderContext = {
    activeIndexes: undefined,
    error: null,
    sortingRules: [
        { field: "custom_order", direction: "asc" },
    ],
};

// Create context
export const PlaylistContext = createContext<PlaylistConsumerContext | undefined>(undefined);

// Consumer hook to access context
export const usePlaylistContext = () => {
    const context = useContext(PlaylistContext);
    if (!context) throw Error("Playlist context module must be used within a playlist context provider.");
    return context;
}
