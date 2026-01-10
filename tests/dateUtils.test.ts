// @ts-nocheck
import { getDaysSinceSunday, getSundayTimestamp } from '../src/utils/dateUtils';

describe('getDaysSinceSunday', () => {
    let dateSpy: jest.SpyInstance;

    afterEach(() => {
        dateSpy.mockRestore();
    });

    it('should return 0 for Sunday', () => {
        const mockSunday = new Date('2024-03-10T12:00:00Z'); // A known Sunday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockSunday);
        expect(getDaysSinceSunday()).toBe(0);
    });

    it('should return 1 for Monday', () => {
        const mockMonday = new Date('2024-03-11T12:00:00Z'); // A known Monday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockMonday);
        expect(getDaysSinceSunday()).toBe(1);
    });

    it('should return 6 for Saturday', () => {
        const mockSaturday = new Date('2024-03-16T12:00:00Z'); // A known Saturday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockSaturday);
        expect(getDaysSinceSunday()).toBe(6);
    });
});

describe('getSundayTimestamp', () => {
    let dateSpy: jest.SpyInstance;

    afterEach(() => {
        dateSpy.mockRestore();
    });

    it('should return the timestamp for the most recent Sunday', () => {
        const mockDate = new Date('2024-03-13T12:00:00Z'); // A Wednesday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const expectedSunday = new Date('2024-03-10T00:00:00Z'); // The preceding Sunday
        expect(getSundayTimestamp()).toEqual(expectedSunday);
    });

    it('should return the timestamp for the current day if it is a Sunday', () => {
        const mockSunday = new Date('2024-03-10T12:00:00Z'); // A Sunday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockSunday);
        
        const expectedSunday = new Date('2024-03-10T00:00:00Z');
        expect(getSundayTimestamp()).toEqual(expectedSunday);
    });

    it('should return the timestamp for the previous Sunday when weeksBack is 1', () => {
        const mockDate = new Date('2024-03-13T12:00:00Z'); // A Wednesday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const expectedSunday = new Date('2024-03-03T00:00:00Z');
        expect(getSundayTimestamp(1)).toEqual(expectedSunday);
    });

    it('should return the timestamp for two Sundays ago when weeksBack is 2', () => {
        const mockDate = new Date('2024-03-13T12:00:00Z'); // A Wednesday
        dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const expectedSunday = new Date('2024-02-25T00:00:00Z');
        expect(getSundayTimestamp(2)).toEqual(expectedSunday);
    });
});