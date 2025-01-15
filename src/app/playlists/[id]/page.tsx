import { FC } from "react";
import Playlist from "./Playlist";

const Page: FC<{ params: { id: string } }> = async ({ params }) => {
    return (
        <main>
            <Playlist id={ params.id } />
        </main>
    );
};

export default Page
