import { addNumberPrefix } from '../src/utils/numberFormatter';

describe('addNumberPrefix', () => {
    it('should add a plus sign to positive numbers', () => {
        expect(addNumberPrefix(5)).toBe('+5');
    });

    it('should not add a plus sign to negative numbers', () => {
        expect(addNumberPrefix(-5)).toBe('-5');
    });

    it('should not add a plus sign to zero', () => {
        expect(addNumberPrefix(0)).toBe('0');
    });
});
