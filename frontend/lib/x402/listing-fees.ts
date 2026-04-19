/** USDC atomic amounts (6 decimals) — must match landlord UI tier prices. */
export const LISTING_DURATION_DAYS = [7, 14, 30] as const
export type ListingDurationDays = (typeof LISTING_DURATION_DAYS)[number]

export function listingFeeAtomicUsdc(days: ListingDurationDays): string {
  switch (days) {
    case 7:
      return "1000000"
    case 14:
      return "2000000"
    case 30:
      return "4000000"
    default:
      return "1000000"
  }
}

export function listingFeeDescription(days: ListingDurationDays): string {
  return `RentChain property listing (${days} days)`
}
