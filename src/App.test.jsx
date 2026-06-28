import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

describe('App Component', () => {
  // App được bọc trong <SyncProvider>, gate render theo trạng thái đăng nhập.
  // Ở môi trường test (jsdom, chưa auth) màn hình đầu tiên là splash "kết nối tài khoản"
  // hiện sau 400ms. Test smoke: app mount được, không crash, và hiện màn hình chờ.
  it('mounts and shows the account/connect screen', async () => {
    render(<App />);
    expect(
      await screen.findByText(/kết nối tài khoản|SmartDoc/i, undefined, { timeout: 1500 }),
    ).toBeInTheDocument();
  });
});
