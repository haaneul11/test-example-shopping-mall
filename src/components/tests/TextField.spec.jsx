import { screen } from '@testing-library/react';
import React from 'react';

import TextField from '@/components/TextField';
import render from '@/utils/test/render';

it('className prop으로 설정한 css class가 적용된다.', async () => {
  // Arrange - 테스트를 위한 환경 만들기
  // -> className을 지닌 컴포넌트 렌더링
  // Act - 테스트할 동작 발생
  // -> 렌더링에 대한 검증이기 때문에 이 단계는 생략
  // -> 클릭이나 메서드 호출, prop 변경 등등에 대한 작업이 여기에 해당
  //  Assert - 올바른 동작이 실행되었는지 검증
  // -> 렌더링 후 DOM에 해당 class가 존재하는지 검증

  // render API를 호출 -> 테스트 환경의 jsDOM에 리액트 컴포넌트가 렌더링된 DOM 구조가 반영
  // jsDOM : Node.js에서 사용하기 위해 많은 웹 표준을 순수 자바스크립트로 구현
  await render(<TextField className={'my-class'} />);

  // Assert 단계를 작성하기 위해서는 렌더링된 텍스트필드 요소를 조회해야한다. 테스트 대상이 되는 요소에 접근하기 위해서 React Testing Library에서 제공하는 다양한 API를 사용할 수 있다.
  //- 텍스트 필드는 placeholder가 있는 요소이기 때문에 getByPlaceholderText라는 React 테스팅 라이브러리의 query를 사용하여 조회한다.
  // - testing library에는 placeholder나 role, text 등의 값으로 요소를 조회하는 다양한 API가 있다.
  // → 이런 방식으로 요소를 조호하면 내부 DOM 구조와는 무관하게 원하는 테스트 요소만 조회할 수 있어 견고한 테스트를 만들 수 있다.
  //
  // 내부 구현에 종속적이지 않은 테스트가 좋은 코드이다. → 테스팅 라이브러리는 세주 구현에 영향받지 않는 테스트를 추구하기 때문에 그에 맞는 형태의 API를 제공한다.

  // 조회한 요소에 css 클래스가 적용되었는지 확인
  // 대부분의 테스트 프레임워크에서는 expect란 함수를 사용하여 원하는 결과가 나오는지 검증할 수 있다.

  // vitest의 expect 함수를 사용하여 기대 결과를 검증
  // toHaveClass는 렌더링된 요소에 지정된 CSS 클래스가 올바르게 적용되었는지 검증하는 역할을 수행한다.

  // className이란 내부 props이나 state 값을 검증 (x)
  // 렌더링되는 DOM 구조가 올바르게 변경되었는지 확인 (O) -> 최종적으로 사용자가 보는 결과는 DOM
  // -> 그 이유는 내부 구현에 대한 종속성을 피해야 하기 때문이기도 하고 결국 최종적인 상태가 반영된 결과물은 사용자가 보는 DOM 이기 때문이다.
  expect(screen.getByPlaceholderText('텍스트를 입력해 주세요.')).toHaveClass(
    'my-class',
  );

  // 단위 테스트 작성 끝!
});
