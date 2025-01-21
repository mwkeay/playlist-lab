function formatMilliseconds(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000); // Convert milliseconds to seconds
    const seconds = totalSeconds % 60;         // Remaining seconds
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;         // Remaining minutes
    const hours = Math.floor(totalMinutes / 60); // Total hours

    if (hours > 0) {
        // Format as "H:MM:SS"
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        // Format as "M:SS"
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
}

export default formatMilliseconds;
