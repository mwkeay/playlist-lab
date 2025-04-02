import "./loading-shimmer.css";
import { Dispatch, FC, ReactNode, SetStateAction, useState } from "react";
import formatMilliseconds from "@/lib/formatMilliseconds";
import { Open_Sans } from "next/font/google";
import { usePlaylistContext } from "./PlaylistProvider/context";

// Constants
const PAGE_LENGTH = 100;
const DEFAULT_COLUMNS: ColumnType[] = ["CUSTOM_ORDER", "NAME", "ARTISTS", "ALBUM", "DURATION"];

// Types
export type ColumnType = "CUSTOM_ORDER" | "NAME" | "ARTISTS" | "ALBUM" | "DURATION";

// Fonts
const numberFont = Open_Sans({ subsets: ["latin"], weight: ["400", "700"] });

// Table Mapping
const columnHeaderMappings: Record<ColumnType, { label: ReactNode; className: string }> = {
    "CUSTOM_ORDER": {
        className: "w-12 text-center",
        label: "#"
    },
    "NAME": {
        className: "flex-1",
        label: "Title"
    },
    "ARTISTS": {
        className: "flex-1",
        label: "Artists"
    },
    "ALBUM": {
        className: "flex-1",
        label: "Album"
    },
    "DURATION": {
        className: "w-20 text-right pr-5",
        label: <>&#x1F552;</>
    },
};
const columnDataMappings: Record<ColumnType, { className: string, render: (item: any, index?: number) => ReactNode }> = {
    "CUSTOM_ORDER": {
        className: "w-12 text-center overflow-hidden",
        render: (_, index) => index != null ? index + 1 : undefined,
    },
    "NAME": {
        className: "flex-1 overflow-hidden",
        render: (item) => item?.track?.name ?? undefined,
    },
    "ARTISTS": {
        className: "flex-1 overflow-hidden",
        render: (item) =>
            item?.track?.artists?.length
                ? item.track.artists.map((artist: any) => artist.name).join(", ")
                : undefined,
    },
    "ALBUM": {
        className: "flex-1 overflow-hidden",
        render: (item) => item?.track?.album?.name ?? undefined,
    },
    "DURATION": {
        className: `w-20 text-right pr-4 overflow-hidden ${numberFont.className}`,
        render: (item) => item?.track?.duration_ms ? formatMilliseconds(item.track.duration_ms) : undefined,
    },
};

/** Table display for a playlists active indexes */
const PlaylistTable: FC = () => {

    const { items, activeIndexes } = usePlaylistContext();
    const [page, setPage] = useState(1);
    const [activeColumns, setActiveColumns] = useState<ColumnType[]>(DEFAULT_COLUMNS);

    return (
        <>
            <table className="flex flex-col">
                <thead>
                    <tr className="flex">
                        {activeColumns.map((columnType, i) => {
                            const { label, className } = columnHeaderMappings[columnType];
                            return <th key={i+1} className={className}>{label}</th>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    { activeIndexes?.slice((page-1)*PAGE_LENGTH, page*PAGE_LENGTH).map((itemIndex, i) => {
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
            <PageNavigator page={page} setPage={setPage} max={Math.ceil((activeIndexes?.length ?? 1) / PAGE_LENGTH)} />
        </>
    );
};

const PageNavigator: FC<{ page: number, setPage: Dispatch<SetStateAction<number>>, max: number }> = ({ page, setPage, max }) => {
    return (
        <div className="w-full flex justify-center items-center gap-4">
            <button
                onClick={() => setPage(page => page - 1)}
                disabled={page <= 1}
                className="p-2 w-10 enabled:hover:bg-white enabled:hover:text-black disabled:text-gray-600"
            >&larr;</button>
            Page {page} of {max}
            <button
                onClick={() => setPage(page => page + 1)}
                disabled={page >= max}
                className="p-2 w-10 enabled:hover:bg-white enabled:hover:text-black disabled:text-gray-600"
            >&rarr;</button>
        </div>
    );
};

export default PlaylistTable;
