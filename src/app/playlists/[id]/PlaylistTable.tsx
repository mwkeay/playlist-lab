import formatArtistNames from "@/lib/formatArtistNames";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { SortKey, SortOptions } from "./usePlaylist";
import formatMilliseconds from "@/lib/formatMilliseconds";
import { Open_Sans } from "next/font/google";

import "./loading-shimmer.css";

const PAGE_LENGTH = 50;

const numberFont = Open_Sans({ subsets: ["latin"], weight: ["400", "700"] });

const PlaylistTable: FC<{
    items: Record<number, any>,
    activeIndexes: number[],
    setSortOptions: Dispatch<SetStateAction<SortOptions>>,
    ready?: boolean,
    page: number,
}> = ({
    items,
    activeIndexes,
    setSortOptions,
    ready = true,
    page,
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
                    <th className="w-20 text-right pr-5">&#x1F552;</th>
                </tr>
            </thead>
            <tbody>
                <tr className="flex h-screen m-4 loading-shimmer">
                    <td className="w-12 h-full" />
                    <td className="flex-1 h-full" />
                    <td className="flex-1 h-full" />
                    <td className="flex-1 h-full" />
                    <td className="w-20 h-full" />
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
                        className="w-12 cursor-pointer hover:bg-white hover:text-black"
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
                    <th
                        onClick={ () => headerSort("DURATION") }
                        className="w-20 text-right pr-5 cursor-pointer hover:bg-white hover:text-black"
                    >&#x1F552;</th>
                </tr>
            </thead>
            <tbody>
                { activeIndexes.slice((page-1)*PAGE_LENGTH, page*PAGE_LENGTH).map((itemIndex, i) => {
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

                            <td className="w-20 text-right pr-4 overflow-hidden">
                                <p className={`whitespace-nowrap truncate ${numberFont.className}`}>{ item?.track?.duration_ms ? formatMilliseconds(item.track.duration_ms) : "-" }</p>
                            </td>
                        </tr>
                    );
                }) }
            </tbody>
        </table>
    );
};

export default PlaylistTable;
