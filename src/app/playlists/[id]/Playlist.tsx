"use client";

import { FC, useState } from "react";
import usePlaylist from "./usePlaylist";
import PlaylistTable from "./PlaylistTable";

import "./loading-shimmer.css";

const Meta: FC<{ meta: any }> = ({ meta }) => {
    const [display, setDisplay] = useState<"LOADING" | "LOADED" | "ERROR">("LOADING");

    return (
        <div className="flex p-4 gap-4">
            <div className="w-32 h-32">

                {/* Loading */}
                {display === "LOADING" && <div className="loading-shimmer h-full" />}

                {/* Error */}
                {display === "ERROR" && <div className="loading-shimmer h-full" /> /* Need styling for error */}

                {meta?.images[0]?.url && <img
                    src={Array.isArray(meta?.images) ? meta.images[0].url : undefined}
                    className="w-full"
                    onLoad={() => setDisplay("LOADED")}
                    onError={() => setDisplay("ERROR")}
                />}
            </div>
            <div className="flex flex-col">
                <h1>{ meta?.name }</h1>
                <p>{ !meta ? "" : meta.description ? meta.description : <span className="text-gray-600 italic">No playlist description</span> }</p>
            </div>
        </div>
    );
};

const Playlist: FC<{ id: string }> = ({ id }) => {
    const { meta, items, activeIndexes, setSortOptions, error } = usePlaylist(id);

    if (error) return (
        <>
            <div className="flex h-screen justify-center items-center">Error: {error.message}</div>
        </>
    );

    return (
        <>
            <Meta meta={ meta } />
            <PlaylistTable items={ items } activeIndexes={ activeIndexes } ready={ activeIndexes.length == 0 ? false : true } setSortOptions={ setSortOptions } />
        </>
    );
};

export default Playlist;
