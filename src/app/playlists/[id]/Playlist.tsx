"use client";

import { FC } from "react";
import usePlaylist from "./usePlaylist";
import PlaylistTable from "./PlaylistTable";

import "./loading-shimmer.css";

const Meta: FC<{ meta: any }> = ({ meta }) => {
    if (!meta) return (
        <div className="flex p-4 gap-4">
            <div className="w-32 h-32 loading-shimmer" />
            <div className="flex flex-col loading-shimmer">
                <h1>Look away! I'm loading!</h1>
                <p>It is so very rude to try and look at this content while it is still being fetched. Maybe you should fetch some manners.</p>
            </div>
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
    const { meta, items, isLoading, error } = usePlaylist(id);

    if (error) return (
        <>
            <div>Error: {error.message}</div>
        </>
    );

    if (isLoading) return (
        <>
            <Meta meta={ undefined } />
            <PlaylistTable items={ [] } />
            <p className="w-full text-center bg-white text-black">Loading...</p>
        </>
    );

    return (
        <>
            <Meta meta={meta} />
            <PlaylistTable items={ items } />
        </>
    );
};

export default Playlist;
