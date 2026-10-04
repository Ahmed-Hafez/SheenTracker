import { complianceBucketQuery } from './compliance-bucket-query';

describe('complianceBucketQuery', () => {
  const target = 143; // 22 working days x 6.5h

  it('maps the zero bar to exactly zero hours, keeping zero-hour users', () => {
    expect(complianceBucketQuery(0, target)).toEqual({
      minHours: null,
      maxHours: 0,
      zeroHours: null,
    });
  });

  it('maps middle bars to hour ranges rounded outward, excluding zero-hour users', () => {
    expect(complianceBucketQuery(1, target)).toEqual({
      minHours: null,
      maxHours: 72,
      zeroHours: '0',
    });
    expect(complianceBucketQuery(2, target)).toEqual({
      minHours: 71,
      maxHours: 115,
      zeroHours: '0',
    });
    expect(complianceBucketQuery(3, target)).toEqual({
      minHours: 114,
      maxHours: 143,
      zeroHours: '0',
    });
  });

  it('leaves the +100% bar open-ended', () => {
    expect(complianceBucketQuery(4, target)).toEqual({
      minHours: 143,
      maxHours: null,
      zeroHours: '0',
    });
  });

  it('returns null when there is no target or the bar is unknown', () => {
    expect(complianceBucketQuery(2, 0)).toBeNull();
    expect(complianceBucketQuery(9, target)).toBeNull();
  });
});
