import { renderHook, act } from '@testing-library/react';

import useConfirmModal from './useConfirmModal';

// 리액트 훅은 반드시 리액트 컴포넌트에서만 호출되어야 정상적으로 실행
it('호출 시 initialValue 인자를 지정하지 않는 경우 isModalOpened 상태가 false로 설정된다.', () => {
  // result : Hook을 호출하여 얻은 결과를 반환 → result.current 값의 참조를 통해 최신 상태를 추적할 수 있다.
  // rerender : Hook을 원하는 인자와 함께 새로 호출하여 상태를 갱신한다.
  const { result, rerender } = renderHook(useConfirmModal);

  expect(result.current.isModalOpened).toBe(false);
  // -> 원시값의 동등을 판별하는 매처로 toBe를 사용.
  // -> 이 매처를 사용하여 Hook이 반환한 초기 isModalOpenedState가 false인지 단언하면 테스트 작성은 완료된다.
});
// => renderHook API를 사용하면 React의 기본 메커니즘에 따라 Hook의 최신 상태가 원하는 대로 변경되는지 result property를 사용하여 쉽게 검증할 수 있다.

// initialValue를 초기값으로 지정한 것 이외에는 이전 테스트와 대부분 동일하다.
it('호출 시 initialValue 인자를 boolean 값으로 지정하는 경우 해당 값으로 isModalOpened 상태가 설정된다.', () => {
  // renderHook 내에서 hook 호출 시 우리가 원하는 인자를 넘겨주기만 하면 된다.
  // 이 test에서는 true를 인자값으로 넘겼다
  const { result } = renderHook(() => useConfirmModal(true));

  // 위에서 설정한 true로 isModalOpened 상태가 지정되는지 단언
  expect(result.current.isModalOpened).toBe(true);
});

// 앞의 2개의 테스트들과는 다르게 isModalOpened 초기 상태를 검증하는 것이 아니라
// toggleIsModalOpened란 함수 호출에 따라 isModalOpened 상태가 변경되는지 확인해야한다.
it('훅의 toggleIsModalOpened()를 호출하면 isModalOpened 상태가 toggle된다.', () => {
  const { result } = renderHook(useConfirmModal);

  // 이 함수를 호출한 후에 다시 result.current에 참조를 통해 isModalOpened 상태가 true인지만 단언하면 된다.
  // toggleIsModalOpened처럼 React 테스팅 라이브러리에 render 함수나
  // 유저 이벤트의 모듈을 사용하지 않고 직접 상태를 변경하는 코드가 있을 경우에는 act 함수로 감싸 주어야 한다.
  // -> 그래야 toggleIsModalOpended 호출 후에 isModalOpened 상태가 정상적으로 반영된다.
  // 리액트 테스팅 라이브러리에서는 이런 경우를 위해 리액트 테스트 유틸에서 제공하는 Act 함수를 조금 더 개선한 별도의 액트 함수도 함께 제공하고 있다.
  act(() => {
    result.current.toggleIsModalOpened();
  });
  // -> Act 함수를 사용하여 toggleIsModalOpened 호출 후 상태가 정상적으로 반영되도록 코드를 수정

  expect(result.current.isModalOpened).toBe(true);
  // 커스텀 훅의 toggleIsModalOpened() 함수를 호출하였지만 상태값이 false로 되어있어 단언이 실패한다.
  // -> 이 문제를 해결하기 위해서는 React test util에서 제공하는 act 함수에 대해 알아야한다.
});
