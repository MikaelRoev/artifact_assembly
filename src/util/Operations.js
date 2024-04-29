/**
 * Clamps a numeric value between a minimum and maximum range.
 * @param {number} value - The numeric value to be clamped.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
}