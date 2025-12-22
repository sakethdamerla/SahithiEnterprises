import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../components/Header';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/ProductsContext', () => ({
  useProducts: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderHeader = () => {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
};

describe('Header', () => {
  it('hides admin link for non-admin users', () => {
    useAuth.mockReturnValue({ isAdmin: false, logout: vi.fn() });
    useProducts.mockReturnValue({ getCategories: () => ['electronics', 'furniture'] });

    renderHeader();

    expect(screen.queryByText(/Admin Dashboard/i)).toBeNull();
  });

  it('shows admin link for admins', () => {
    useAuth.mockReturnValue({ isAdmin: true, logout: vi.fn() });
    useProducts.mockReturnValue({ getCategories: () => ['electronics'] });

    renderHeader();

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });
});

