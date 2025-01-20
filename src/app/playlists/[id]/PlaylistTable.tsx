import formatArtistNames from "@/lib/formatArtistNames";
import { FC } from "react";

const PlaylistTable: FC<{ items: any[] }> = ({ items }) => {
    return (
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
                { items.map((item, i) => (
                    <tr className="hover:bg-white hover:text-black flex">

                        <td className="w-12 text-center overflow-hidden">
                            <p className="whitespace-nowrap truncate">{ i+1 }</p>
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
                )) }
            </tbody>
        </table>
    );
};

export default PlaylistTable;
