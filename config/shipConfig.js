/**
 * Ship configuration lookup table.
 * shipConfig is stored as a string enum on the Team model.
 * This table maps ship type strings to their gameplay properties.
 *
 * Balance rationale:
 * - WARSHIP: High risk, high reward. 1.30x multiplier compensates for only 2 lives.
 * - MERCHANT: Baseline. Standard 1.00x multiplier with 3 lives.
 * - GHOST: Low risk, lower reward. 0.80x multiplier but 5 lives for more attempts.
 */
export const SHIP_CONFIGS = {
    WARSHIP: {
        multiplier: 1.30,
        round2Lives: 2,
        bonusRule: "Higher multiplier, fewer lives"
    },
    MERCHANT: {
        multiplier: 1.00,
        round2Lives: 3,
        bonusRule: "Base score, no modifier"
    },
    GHOST: {
        multiplier: 0.80,
        round2Lives: 5,
        bonusRule: "Lower multiplier, more lives"
    }
};

/**
 * Get the ship configuration for a given ship type string.
 * @param {string} shipType - One of "WARSHIP", "MERCHANT", "GHOST"
 * @returns {object} The ship config or null if not found
 */
export function getShipConfig(shipType) {
    return SHIP_CONFIGS[shipType] || null;
}
