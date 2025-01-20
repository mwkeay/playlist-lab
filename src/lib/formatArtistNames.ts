function formatArtistNames(artists: { name: string }[]): string {
    const names = artists.map(artist => artist.name);

    if (names.length === 1) return names[0]; // Single artist case
    if (names.length === 2) return names.join(" and "); // Two artists case

    // Three or more artists
    const last = names.pop();
    return `${names.join(", ")} and ${last}`;
}

export default formatArtistNames;
