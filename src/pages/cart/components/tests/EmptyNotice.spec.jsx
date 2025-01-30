import { screen } from '@testing-library/react';
import React from 'react';

import EmptyNotice from '@/pages/cart/components/EmptyNotice';
import render from '@/utils/test/render';

// 실제 모듈을 모킹한 모듈로 대체하여 테스트 실행
// vi.mock을 사용하여 React 라우터 DOM 라이브러리를 모킹
// 모킹할 모듈에 이름을 작성하고 원하는 대체 구현을 함수 형태로 작성하면 된다.
// 여기서 모킹하고 싶은 것은 React 라우터의 모든 구현이 아니라 useNavigate hook만 모킹을 하고 싶을때
// -> 일부 모듈에 대해서만 모킹을 하고 나머지는 기존 모듈의 기능을 그대로 사용하고 싶은 경우에는 vi.importActual이라는 함수를 사용하여 진행할 수 있다.
// -> 여기서 검증하고 싶은건 useNavigate으로 반환받은 navigate함수가 올바르게 호출되었는가이다.
// 함수가 올바르게 호출되었는지 확인하기 위해서는 spy함수란 것을 사용한다.
// useNavigate 자체를 spy 함수로 모킹하여 React 라우터 DOM 모듈의 기존 구현을 대체할 수 있다.

const navigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');

  return { ...original, useNavigate: () => navigateFn };
  // 이런식으로 작성하면 React 라우터 DOM의 다른 모듈에 대해서는 불필요한 모의 구현없이 편리하게 모킹하여 테스트를 실행할 수 있다.
});

it('"홈으로 가기" 링크를 클릭할경우 "/"경로로 navigate함수가 호출된다', async () => {
  const { user } = await render(<EmptyNotice />);

  // 클릭 API를 사용해서 홈으로 가기 요소를 마찬가지로 React 테스팅 라이브러리의 GetByText API를 사용해서 조회한 후 클릭 이벤트를 실행하였다.
  await user.click(screen.getByText('홈으로 가기'));

  expect(navigateFn).toHaveBeenNthCalledWith(1, '/');
});
