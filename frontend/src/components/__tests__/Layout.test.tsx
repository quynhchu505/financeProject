import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Layout from '../Layout';
import { I18nProvider } from '@/i18n';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Demo User', email: 'demo@example.com' },
    logout: vi.fn(),
  }),
}));

vi.mock('../ChatbotPanel', () => ({
  default: () => null,
}));

describe('Layout', () => {
  it('renders main navigation', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <I18nProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            </Route>
          </Routes>
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Page')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Tổng quan/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Giao dịch/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ngân sách/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Báo cáo/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Tư vấn/i })).toBeTruthy();
  });
});
