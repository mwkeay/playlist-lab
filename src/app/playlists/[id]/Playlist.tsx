"use client";

import { FC } from "react";
import usePlaylist from "./usePlaylist";
import PlaylistTable from "./PlaylistTable";

const Playlist: FC<{ id: string }> = ({ id }) => {

    const { items, isLoading, error } = usePlaylist(id);

    if (error) return (
        <>
            <div>Error: {error.message}</div>
        </>
    );

    if (isLoading) return (
        <>
            <PlaylistTable items={ [] } />
            <p className="w-full text-center bg-white text-black">Loading...</p>
        </>
    );

    return (
        <>
            <PlaylistTable items={ items } />
        </>
    );
};

export default Playlist;
