import { screen } from '@testing-library/react';
import React from 'react';

import NotFoundPage from '@/pages/error/components/NotFoundPage';
import render from '@/utils/test/render';

// 이 컴포넌트는 replace: true를 옵션으로 넘기기 때문에 spy 함수의 인자로 올바르게 전달되는지까지 확인해야한다.
const navigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');

  return { ...original, useNavigate: () => navigateFn };
});

it('Home으로 이동 버튼 클릭시 홈 경로로 이동하는 navigate가 실행된다', async () => {
  const { user } = await render(<NotFoundPage />);

  const button = await screen.getByRole('button', { name: 'Home으로 이동' });

  await user.click(button);

  expect(navigateFn).toHaveBeenLastCalledWith(1, '/', { replace: true });
});
