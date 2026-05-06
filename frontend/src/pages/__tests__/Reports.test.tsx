import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Reports from '../Reports';
import { I18nProvider } from '@/i18n';

const apiMock = vi.hoisted(() => ({
  getMonthlyReports: vi.fn(),
  getCashFlowPrediction: vi.fn(),
}));

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<any>('@/services/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      ...apiMock,
    },
  };
});

describe('Reports page', () => {
  beforeEach(() => {
    apiMock.getMonthlyReports.mockResolvedValue([
      { month: '2026-05', income: 1000, expense: 500, net: 500, categories: [] },
    ]);
    apiMock.getCashFlowPrediction.mockResolvedValue([]);
  });

  it('renders report controls', async () => {
    render(
      <I18nProvider>
        <Reports />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeTruthy();
      expect(screen.getByText('PDF')).toBeTruthy();
      expect(screen.getByText('2026-05')).toBeTruthy();
    });
  });
});
