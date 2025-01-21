"use client";

import { FC } from "react";
import usePlaylist from "./usePlaylist";
import PlaylistTable from "./PlaylistTable";

import "./loading-shimmer.css";

const Meta: FC<{ meta: any }> = ({ meta }) => {
    if (!meta) return (
        <div className="flex p-4 gap-4">
            <div className="w-32 h-32 loading-shimmer" />
            <div className="flex flex-col loading-shimmer w-full" />
        </div>
    );
    return (
        <div className="flex p-4 gap-4">
            <div className="w-32 h-32">
                <img
                    src={ Array.isArray(meta?.images) ? meta.images[0].url : undefined }
                    className="w-full"
                />
            </div>
            <div className="flex flex-col">
                <h1>{ meta?.name }</h1>
                <p>{ meta?.description }</p>
            </div>
        </div>
    );
};

const Playlist: FC<{ id: string }> = ({ id }) => {
    const { meta, items, activeIndexes, setSortOptions, isLoading, error } = usePlaylist(id);

    if (error) return (
        <>
            <div className="flex h-screen justify-center items-center">Error: {error.message}</div>
        </>
    );

    return (
        <>
            <Meta meta={ meta } />
            <PlaylistTable items={ items } activeIndexes={ activeIndexes } ready={ !isLoading } setSortOptions={ setSortOptions } />
        </>
    );
};

export default Playlist;
