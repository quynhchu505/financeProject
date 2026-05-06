import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Login from '../Login';
import { I18nProvider } from '@/i18n';

const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
    register: registerMock,
  }),
}));

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it('submits login form', async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Login />
        </I18nProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('email@example.com'), {
      target: { value: 'demo@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(loginMock).toHaveBeenCalledWith('demo@example.com', 'secret123');
  });
});
