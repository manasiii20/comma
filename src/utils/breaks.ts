export type BreakSettings = { every: number; length: number }

export const breakLabel = (b: BreakSettings) => `Every ${b.every} min · ${b.length} min breaks`
