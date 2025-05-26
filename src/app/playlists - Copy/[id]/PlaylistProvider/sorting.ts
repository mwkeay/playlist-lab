type PlaylistSortField = "custom_order" | "name" | "artists" | "album" | "duration";

export type SortingRules = {
    field: PlaylistSortField
    direction: "asc" | "desc"
}[]

export function sortPlaylist(
    items: Record<number, any>,
    activeIndexes: number[],
    rules: SortingRules,
): number[] {
    
    const indexes = [...activeIndexes];
    indexes.sort((a, b) => {
        // Iterate through sorting rules
        for (let i = 0; i < rules.length; i++) {
            const { field, direction } = rules[i];
            switch (field) {
                
                case "custom_order":
                    if (direction === "asc") return a - b;
                    else return b - a;

                case "name":
                    // Convert indexes to lowercase track names
                    const nameA = items[a]?.track?.name?.toLowerCase() ?? "";
                    const nameB = items[b]?.track?.name?.toLowerCase() ?? "";
                    // Compare names (pass if equal)
                    if (nameA != nameB) {
                        if (direction === "asc") return nameA.localeCompare(nameB);
                        else return nameB.localeCompare(nameA);
                    }
                    break;
                
                case "album":
                    // Convert indexes to lowercase album names
                    const albumA = items[a]?.track?.album?.name?.toLowerCase() ?? "";
                    const albumB = items[b]?.track?.album?.name?.toLowerCase() ?? "";
                    // Compare album names (pass if equal)
                    if (albumA != albumB) {
                        if (direction === "asc") return albumA.localeCompare(albumB);
                        else return albumB.localeCompare(albumA);
                    }
                    break;
                
                case "duration":
                    const durationA = items[a]?.track?.duration_ms ?? 0;
                    const durationB = items[b]?.track?.duration_ms ?? 0;
                    // Compare durations (pass if equal)
                    if (durationA != durationB) {
                        if (direction === "asc") return durationA - durationB;
                        else return durationB - durationA; 
                    }
                    break;
            }
        }
        return 0;
    });
    return indexes;
}
