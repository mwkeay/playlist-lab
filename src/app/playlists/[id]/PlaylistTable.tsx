import formatArtistNames from "@/lib/formatArtistNames";
import { Dispatch, FC, SetStateAction } from "react";
import { SortKey, SortOptions } from "./usePlaylist";

import "./loading-shimmer.css";

const PlaylistTable: FC<{
    items: Record<number, any>,
    activeIndexes: number[],
    setSortOptions: Dispatch<SetStateAction<SortOptions>>,
    ready?: boolean,
}> = ({
    items,
    activeIndexes,
    setSortOptions,
    ready = true,
}) => {
    const headerSort = (key: SortKey) => {
        setSortOptions(prev => {
            if (key === prev.key) return { key, direction: prev.direction === "ASC" ? "DESC" : "ASC" };
            else return { key, direction: "ASC" };
        });
    };

    if (!ready) return (
        <table className="flex flex-col">
            <thead>
                <tr className="flex">
                    <th className="w-12 text-center">#</th>
                    <th className="flex-1">Title</th>
                    <th className="flex-1">Artist</th>
                    <th className="flex-1">Album</th>
                </tr>
            </thead>
            <tbody>
                <tr className="flex h-96 m-4 loading-shimmer">
                    <td className="w-12 h-full" />
                    <td className="flex-1 h-full" />
                    <td className="flex-1 h-full" />
                    <td className="flex-1 h-full" />
                </tr>
            </tbody>
        </table>
    );

    return (
        <table className="flex flex-col">
            <thead>
                <tr className="flex">
                    <th
                        onClick={ () => headerSort("CUSTOM_ORDER") }
                        className="w-12 text-center cursor-pointer hover:bg-white hover:text-black"
                    >#</th>
                    <th
                        onClick={ () => headerSort("TITLE") }
                        className="flex-1 cursor-pointer hover:bg-white hover:text-black"
                    >Title</th>
                    <th
                        onClick={ () => headerSort("ARTIST") }
                        className="flex-1 cursor-pointer hover:bg-white hover:text-black"
                    >Artist</th>
                    <th
                        onClick={ () => headerSort("ALBUM") }
                        className="flex-1 cursor-pointer hover:bg-white hover:text-black"
                    >Album</th>
                </tr>
            </thead>
            <tbody>
                { activeIndexes.map((itemIndex, i) => {
                    const item = items[itemIndex];
                    return (
                        <tr key={i+1} className="hover:bg-white hover:text-black flex">

                            <td className="w-12 text-center overflow-hidden">
                                <p className="whitespace-nowrap truncate">{ itemIndex + 1 }</p>
                            </td>

                            <td className="flex-1 overflow-hidden">
                                <p className="whitespace-nowrap truncate">{ item?.track?.name ?? "-" }</p>
                            </td>

                            <td className="flex-1 overflow-hidden">
                                <p className="whitespace-nowrap truncate">{ item?.track?.artists ? formatArtistNames(item?.track?.artists) : "-" }</p>
                            </td>

                            <td className="flex-1 overflow-hidden">
                                <p className="whitespace-nowrap truncate">{ item?.track?.album?.name ?? "-" }</p>
                            </td>
                        </tr>
                    );
                }) }
            </tbody>
        </table>
    );
};

export default PlaylistTable;
