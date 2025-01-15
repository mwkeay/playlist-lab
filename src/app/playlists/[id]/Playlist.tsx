"use client";

import { FC } from "react";
import usePlaylist from "./usePlaylist";

const Playlist: FC<{ id: string }> = ({ id }) => {

    const { items, isLoading, error } = usePlaylist(id);

    if (error) return (
        <div>Error: {error.message}</div>
    );

    if (isLoading) return (
        <div>Loading...</div>
    );

    return (
        <div>
            {items.map((item, i) => (
                <p key={i}>{i + 1}: {JSON.stringify(item)}</p>
            ))}
        </div>
    );
};

export default Playlist;
