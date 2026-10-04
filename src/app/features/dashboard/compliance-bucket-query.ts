import type { AzureUsersQueryParams } from '../azure-users/azure-users-filters';

/** Order matches the Log compliance bars: Zero, 1-50%, 51-79%, 80-100%, +100%. */
const BUCKET_BOUNDS = [
  { from: 0, to: 0 },
  { from: 0, to: 0.5 },
  { from: 0.5, to: 0.8 },
  { from: 0.8, to: 1 },
  { from: 1, to: null },
];

/**
 * Azure Users filters by hours, while the bars are a share of each user's own expected hours.
 * The bar is converted with the default target (6.5h x working days), rounded outward so
 * boundary users are kept. Users with a custom expected-hours rate can land one bar over.
 */
export function complianceBucketQuery(
  bucketIndex: number,
  targetHours: number,
): AzureUsersQueryParams | null {
  const bounds = BUCKET_BOUNDS[bucketIndex];
  if (!bounds || targetHours <= 0) return null;

  const isZeroBucket = bucketIndex === 0;
  return {
    minHours: Math.floor(bounds.from * targetHours) || null,
    // Open-ended top bar: no maxHours means "up to the largest logged total".
    maxHours: bounds.to === null ? null : Math.ceil(bounds.to * targetHours),
    zeroHours: isZeroBucket ? null : '0',
  };
}
