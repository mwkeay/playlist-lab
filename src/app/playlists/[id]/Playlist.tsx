"use client";

import { FC } from "react";
import usePlaylist from "./usePlaylist";
import PlaylistTable from "./PlaylistTable";

const Meta: FC<{ meta: any }> = ({ meta }) => (
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
