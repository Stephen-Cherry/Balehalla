const getDaysSinceSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
    return dayOfWeek; // Days since Sunday
};

const getSundayTimestamp = (weeksBack: number = 0): Date => {
    const today = new Date();
    const daysSinceSunday = getDaysSinceSunday() + (weeksBack * 7);
    const sunday = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - daysSinceSunday, 0, 0, 0);
    return sunday;
};

export { getDaysSinceSunday, getSundayTimestamp };