import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter } from 'react-router-dom';

export default async (component, options = {}) => {
  const { routerProps } = options;
  const user = userEvent.setup();

  // https://tanstack.com/query/v4/docs/react/guides/testing
  // 먼저 실제 API 호출을 담당할 쿼리 클라이어트를 생성한다.
  // 그리고 테스트 대상 컴포넌트 내에서 이 쿼리 클라이언트를 사용할 수 있도록 QueryClientProvider로 감싸주기만 하면 1차적으로 필요한 설정이 끝난다.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ turns retries off
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      // ✅ no more errors on the console for tests
      error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
    },
  });

  return {
    user,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>{component}</MemoryRouter>
        <Toaster />
      </QueryClientProvider>,
    ),
  };
};
