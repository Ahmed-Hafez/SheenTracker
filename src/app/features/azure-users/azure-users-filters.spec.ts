import { convertToParamMap } from '@angular/router';
import { filtersFromParams, hoursRangeMax, paramsFromFilters } from './azure-users-filters';

describe('azure users filters <-> query params', () => {
  it('defaults to the full range with zero-hour users included', () => {
    const filters = filtersFromParams(convertToParamMap({}), 240);
    expect(filters).toEqual({
      searchTerm: '',
      projects: [],
      hoursRange: [0, 240],
      zeroHoursUsers: true,
    });
    expect(paramsFromFilters(filters, 240)).toEqual({
      search: null,
      projects: null,
      minHours: null,
      maxHours: null,
      zeroHours: null,
    });
  });

  it('round-trips a filtered state', () => {
    const params = convertToParamMap({
      search: 'ada',
      projects: ['NBO', 'NDC Portal'],
      minHours: '10',
      maxHours: '90',
      zeroHours: '0',
    });
    const filters = filtersFromParams(params, 240);
    expect(filters).toEqual({
      searchTerm: 'ada',
      projects: ['NBO', 'NDC Portal'],
      hoursRange: [10, 90],
      zeroHoursUsers: false,
    });
    expect(paramsFromFilters(filters, 240)).toEqual({
      search: 'ada',
      projects: ['NBO', 'NDC Portal'],
      minHours: 10,
      maxHours: 90,
      zeroHours: '0',
    });
  });

  it('ignores a non-numeric range instead of filtering everyone out', () => {
    const filters = filtersFromParams(convertToParamMap({ minHours: 'x', maxHours: 'y' }), 200);
    expect(filters.hoursRange).toEqual([0, 200]);
  });

  it('keeps the slider at least 200 and above the largest logged total', () => {
    expect(hoursRangeMax([])).toBe(200);
    expect(hoursRangeMax([12, 318.2])).toBe(319);
  });
});
