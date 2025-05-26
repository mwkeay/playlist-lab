"use client";

import "./loading-shimmer.css";

import { FC, ReactNode, useEffect, useState } from "react";
import useSpotifyPlaylist from "./useSpotifyPlaylist";
import { Open_Sans } from "next/font/google";
import formatMilliseconds from "@/lib/formatMilliseconds";

export type ColumnType = "custom_order" | "name" | "artists" | "album" | "duration";

// Constants
const PAGE_LENGTH = 100;
const DEFAULT_COLUMNS: ColumnType[] = ["custom_order", "name", "artists", "album", "duration"];

// Fonts
const numberFont = Open_Sans({ subsets: ["latin"], weight: ["400", "700"] });

// Table Mapping
const columnHeaderMappings: Record<ColumnType, { label: ReactNode; className: string }> = {
    "custom_order": {
        className: "w-12 text-center",
        label: "#"
    },
    "name": {
        className: "flex-1",
        label: "Title"
    },
    "artists": {
        className: "flex-1",
        label: "Artists"
    },
    "album": {
        className: "flex-1",
        label: "Album"
    },
    "duration": {
        className: "w-20 text-right pr-5",
        label: <>&#x1F552;</>
    },
};
const columnDataMappings: Record<ColumnType, { className: string, render: (item: any, index?: number) => ReactNode }> = {
    "custom_order": {
        className: "w-12 text-center overflow-hidden",
        render: (_, index) => index != null ? index + 1 : undefined,
    },
    "name": {
        className: "flex-1 overflow-hidden",
        render: (item) => item?.track?.name ?? undefined,
    },
    "artists": {
        className: "flex-1 overflow-hidden",
        render: (item) =>
            item?.track?.artists?.length
                ? item.track.artists.map((artist: any) => artist.name).join(", ")
                : undefined,
    },
    "album": {
        className: "flex-1 overflow-hidden",
        render: (item) => item?.track?.album?.name ?? undefined,
    },
    "duration": {
        className: `w-20 text-right pr-4 overflow-hidden ${numberFont.className}`,
        render: (item) => item?.track?.duration_ms ? formatMilliseconds(item.track.duration_ms) : undefined,
    },
};

const Playlist: FC<{ id: string }> = ({ id }) => {

    const { meta, items, error } = useSpotifyPlaylist(id);

    const [order, setOrder] = useState<number[]>([]);
    const [activeColumns, setActiveColumns] = useState<ColumnType[]>(DEFAULT_COLUMNS);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setOrder(items ? Array.from({ length: Object.keys(items).length }, (_, index) => index) : []);
    }, [items]);

    return (
        <>
            <Meta meta={meta} />
            <Table items={items} order={order} activeColumns={activeColumns} page={page} />
        </>
    );
};

const Meta: FC<{ meta: any }> = ({ meta }) => {

    const [display, setDisplay] = useState<"LOADING" | "LOADED" | "ERROR">("LOADING");

    return (
        <div className="flex p-4 gap-4">
            <div className={`w-32 h-32 ${!meta ? "loading-shimmer" : ""}`}>

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
            <div className={`flex flex-col ${!meta ? "loading-shimmer" : ""}`}>
                <h1>{ meta?.name }</h1>
                <p>{ !meta ? "" : meta.description ? meta.description : <span className="text-gray-600 italic">No playlist description</span> }</p>
            </div>
        </div>
    );
};

const Table: FC<{
    items: Record<number, any> | undefined,
    order: number[],
    activeColumns: ColumnType[],
    page: number,
}> = ({
    items,
    order,
    activeColumns,
    page,
}) => {
    return (
        <table className="flex flex-col">
            <thead>
                <tr className="flex">
                    {activeColumns.map((columnType, i) => {
                        const { label, className } = columnHeaderMappings[columnType];
                        return <th key={i+1} className={className}>{label}</th>;
                    })}
                </tr>
            </thead>
            <tbody className={items ? "" : "loading-shimmer h-screen m-4"}>
                { order?.slice((page-1)*PAGE_LENGTH, page*PAGE_LENGTH).map((itemIndex, i) => {
                    const item = items?.[itemIndex];
                    return (
                        <tr key={i+1} className="hover:bg-white hover:text-black flex">
                            {activeColumns.map((columnType, i) => {
                                const { className, render } = columnDataMappings[columnType];
                                return <td key={i+1} className={className}>
                                    <p className="whitespace-nowrap truncate">{render(item, itemIndex)}</p>
                                </td>
                            })}
                        </tr>
                    );
                }) }
            </tbody>
        </table>
    );
};

export default Playlist;
