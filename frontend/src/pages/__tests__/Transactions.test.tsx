import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Transactions from '../Transactions';
import { I18nProvider } from '@/i18n';

const apiMock = vi.hoisted(() => ({
  getTransactions: vi.fn(),
  getCategories: vi.fn(),
  getAccounts: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  api: {
    ...apiMock,
  },
}));

describe('Transactions page', () => {
  beforeEach(() => {
    apiMock.getTransactions.mockResolvedValue({
      items: [
        {
          id: 1,
          user_id: 1,
          account_id: 1,
          category_id: 1,
          amount: 100000,
          transaction_type: 'expense',
          description: 'Cafe',
          date: new Date().toISOString(),
          is_ai_categorized: false,
          created_at: new Date().toISOString(),
          category: { id: 1, user_id: 1, name: 'Ăn uống', icon: 'tag', color: '#f00', parent_id: null, is_system: true },
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
      pages: 1,
    });
    apiMock.getCategories.mockResolvedValue([]);
    apiMock.getAccounts.mockResolvedValue([]);
  });

  it('renders fetched transactions', async () => {
    render(
      <I18nProvider>
        <Transactions />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cafe')).toBeTruthy();
      expect(screen.getByText(/1 giao dịch/)).toBeTruthy();
    });
  });
});
