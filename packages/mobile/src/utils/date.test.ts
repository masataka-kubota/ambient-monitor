import { formatToLocalTime } from './date';

describe('formatToLocalTime', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Mocks the user's timezone for testing purposes.
   * @param timeZone - The timezone to mock (e.g., 'Asia/Tokyo').
   */
  const mockTimeZone = (timeZone: string) => {
    jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone,
    } as Intl.ResolvedDateTimeFormatOptions);
  };

  it('converts a UTC value to the local timezone using the default format', () => {
    mockTimeZone('Asia/Tokyo');

    expect(formatToLocalTime('2025-12-04 04:27:32')).toBe('2025-12-04 13:27:32');
  });

  it('supports a custom output format', () => {
    mockTimeZone('America/New_York');

    expect(formatToLocalTime('2025-12-04T04:27:32Z', 'yyyy/MM/dd HH:mm')).toBe('2025/12/03 23:27');
  });

  it('accepts an ISO string that already includes a trailing Z', () => {
    mockTimeZone('Asia/Tokyo');

    expect(formatToLocalTime('2025-12-04T04:27:32Z')).toBe('2025-12-04 13:27:32');
  });
});
