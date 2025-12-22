import { describe, it, expect, afterEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, cleanup } from '@testing-library/react';
import { AdminGuard } from '../components/AdminGuard';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AdminGuard', () => {
  it('redirects unauthenticated users to login', () => {
    useAuth.mockReturnValue({ isAdmin: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <div>Secret</div>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('renders children for admins', () => {
    useAuth.mockReturnValue({ isAdmin: true });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <div>Secret</div>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Secret/i)).toBeInTheDocument();
  });
});

