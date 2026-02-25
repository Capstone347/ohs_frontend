import { describe, expect, it } from 'vitest';
import { getPaymentTitle } from '../pages/Success';

describe('getPaymentTitle', () => {
    it('maps processing to Processing payment', () => {
        expect(getPaymentTitle('processing')).toBe('Processing payment');
    });

    it('maps success to Payment confirmed', () => {
        expect(getPaymentTitle('succeeded')).toBe('Payment confirmed');
        expect(getPaymentTitle('paid')).toBe('Payment confirmed');
    });

    it('maps action-required to Action required', () => {
        expect(getPaymentTitle('requires_action')).toBe('Action required');
    });

    it('maps failures to Payment failed — try again', () => {
        expect(getPaymentTitle('payment_failed')).toBe('Payment failed — try again');
        expect(getPaymentTitle('requires_payment_method')).toBe('Payment failed — try again');
        expect(getPaymentTitle('unpaid')).toBe('Payment failed — try again');
    });
});