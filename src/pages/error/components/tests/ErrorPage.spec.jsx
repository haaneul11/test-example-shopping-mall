import { screen } from '@testing-library/react';
import React from 'react';

import ErrorPage from '@/pages/error/components/ErrorPage';
import render from '@/utils/test/render';

// 에러페이지 컴포넌트를 렌더링한 후에 뒤로 이동 버튼을 조회할 때 getByRole API를 사용
// getByRole API를 사용하여 버튼 롤을 가진 요소를 조회
// 이때 네임을 지정하면 버튼 중에서도 뒤로 이동이란 텍스트를 가진 요소를 명확하게 지정할 수 있어
// 이후에 해당 버튼을 클릭했을 때 앞선 테스트와 마찬가지로 페이지 이동이 정상적으로 실행되는지 확인하기 위해 React 라우터 돔의 useNavigate를 spy함수로 모킹해야한다.

const navigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');

  return { ...original, useNavigate: () => navigateFn };
  // 이런식으로 작성하면 React 라우터 DOM의 다른 모듈에 대해서는 불필요한 모의 구현없이 편리하게 모킹하여 테스트를 실행할 수 있다.
});

it('"뒤로 이동" 버튼 클릭시 뒤로 이동하는 navigate(-1) 함수가 호출된다', async () => {
  const { user } = await render(<ErrorPage />);

  const button = await screen.getByRole('button', { name: '뒤로 이동' });

  await user.click(button);

  // spy 함수가 원하는 인자와 함께 호출되는지 단언하면 된다.
  expect(navigateFn).toHaveBeenNthCalledWith(1, -1);
});
