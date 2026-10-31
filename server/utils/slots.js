
const TIME_ZONE_OFFSET = "+05:00";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time) {
    if (typeof time !== "string" || !TIME_PATTERN.test(time)) {
        return NaN;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function toTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const remainder = String(minutes % 60).padStart(2, "0");

    return `${hours}:${remainder}`;
}

function isValidDate(date) {
    if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
}

function generateSlots({
    date,
    workStart,
    workEnd,
    sessionMinutes,
    breaks = [],
    holidays = [],
    leaveDays = [],
    bookedSlots = [],
    now = new Date(),
}) {
    if (!isValidDate(date)) return [];

    if (
        !Number.isSafeInteger(sessionMinutes) ||
        sessionMinutes < 1
    ) {
        return [];
    }

    if (
        (Array.isArray(holidays) && holidays.includes(date)) ||
        (Array.isArray(leaveDays) && leaveDays.includes(date))
    ) {
        return [];
    }

    const start = toMinutes(workStart);
    const end = toMinutes(workEnd);

    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
        return [];
    }

    if (!Array.isArray(breaks) || !Array.isArray(bookedSlots)) {
        return [];
    }

    const normalizedBreaks = [];

    for (const item of breaks) {
        const breakStart = toMinutes(item?.start);
        const breakEnd = toMinutes(item?.end);

        if (
            !Number.isFinite(breakStart) ||
            !Number.isFinite(breakEnd) ||
            breakStart >= breakEnd
        ) {
            return [];
        }

        normalizedBreaks.push({
            start: breakStart,
            end: breakEnd,
        });
    }

    const booked = new Set(
        bookedSlots.filter((slot) => typeof slot === "string")
    );

    const nowDate = now instanceof Date ? now : new Date(now);
    const nowTimestamp = nowDate.getTime();

    if (!Number.isFinite(nowTimestamp)) return [];

    const free = [];

    for (
        let current = start;
        current + sessionMinutes <= end;
        current += sessionMinutes
    ) {
        const slotEnd = current + sessionMinutes;

        const overlapsBreak = normalizedBreaks.some(
            (item) =>
                current < item.end &&
                slotEnd > item.start
        );

        if (overlapsBreak) continue;

        const label = toTime(current);

        if (booked.has(label)) continue;

        // Always interpret the selected time as Pakistan local time.
        const slotDate = new Date(
            `${date}T${label}:00${TIME_ZONE_OFFSET}`
        );

        if (
            Number.isNaN(slotDate.getTime()) ||
            slotDate.getTime() <= nowTimestamp
        ) {
            continue;
        }

        free.push(label);
    }

    return free;
}

module.exports = { generateSlots };
