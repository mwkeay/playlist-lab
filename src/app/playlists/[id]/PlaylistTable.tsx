import "./loading-shimmer.css";
import formatArtistNames from "@/lib/formatArtistNames";
import { Dispatch, FC, SetStateAction, useState } from "react";
import formatMilliseconds from "@/lib/formatMilliseconds";
import { Open_Sans } from "next/font/google";
import { usePlaylistContext } from "./PlaylistProvider/context";
import Logger from "@/lib/logger";

const PAGE_LENGTH = 50;

const numberFont = Open_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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

const PlaylistTable: FC = () => {

    const { items, activeIndexes } = usePlaylistContext();
    const [page, setPage] = useState(1);

    return (
        <>
            <table className="flex flex-col">
                <thead>
                    <tr className="flex">
                        <th className="w-12">#</th>
                        <th className="flex-1">Title</th>
                        <th className="flex-1">Artist</th>
                        <th className="flex-1">Album</th>
                        <th className="w-20 text-right pr-5">&#x1F552;</th>
                    </tr>
                </thead>
                <tbody>
                    { activeIndexes?.slice((page-1)*PAGE_LENGTH, page*PAGE_LENGTH).map((itemIndex, i) => {
                        const item = items?.[itemIndex];
                        // Indexing error
                        if (!item) {
                            Logger.error("Playlist index's item not found in records.");
                            return <tr key={i+1} className="error-bg flex">
                                <td className="w-12 text-center overflow-hidden">
                                    <p className="whitespace-nowrap truncate">{ itemIndex + 1 }</p>
                                </td>
                            </tr>;
                        }
                        // Item found
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
            <PageNavigator page={page} setPage={setPage} max={Math.ceil((activeIndexes?.length ?? 1) / PAGE_LENGTH)} />
        </>
    );
};

export default PlaylistTable;
