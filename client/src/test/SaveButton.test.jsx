import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { AuthProvider } from '../context/AuthContext';
import { SavedProvider } from '../context/SavedContext';
import { ToastProvider } from '../context/ToastContext';
import SaveButton from '../components/SaveButton';
import { api } from '../services/api';

describe('SaveButton (guest)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Guest session: /auth/me returns no user.
    api.defaults.adapter = async (config) => ({ data: { success: true, data: { user: null } }, status: 200, statusText: 'OK', headers: {}, config });
  });

  it('saves to this device when signed out', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ToastProvider>
            <AuthProvider>
              <SavedProvider>
                <SaveButton type="place" doc={{ _id: 'p1', name: 'Bekal Fort', slug: 'bekal-fort' }} variant="button" />
              </SavedProvider>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const btn = screen.getByRole('button', { name: /save/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toHaveAttribute('aria-pressed', 'true'));
    expect(JSON.parse(localStorage.getItem('kt_guest_saved'))[0]).toMatchObject({ targetType: 'place', targetId: 'p1' });
  });
});
