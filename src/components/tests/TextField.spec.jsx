import { screen } from '@testing-library/react';
import React from 'react';

import TextField from '@/components/TextField';
import render from '@/utils/test/render';

let someCondition = false;

// my-class란 class가 항상 적용된 컴포넌트를 렌더링
// -> 이러한 렌더링 과정을 매 테스트마다 작성하기보다는 셋업으로 설정하면 훨씬 편리하게 테스트 가능
beforeEach(async () => {
  if (someCondition) {
    await render(<TextField className={'my-class'} />);
  } else {
    // ...
  }
});
// -> 테스트 컨텍스트마다 이와 같이 반복적인 컴포넌트 렌더링 패턴이 있는 경우
// 이 경우에 셋업을 사용하거나 별도 함수로 만들어 호출하여 사용하면 깔끔하게 테스트 코드를 관리할 수 있다.

it('className prop으로 설정한 css class가 적용된다.', async () => {
  await render(<TextField className={'my-class'} />);

  const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

  expect(textInput).toHaveClass('my-class');
});

describe('placeholder', () => {
  beforeEach(() => {
    console.log('placeholder - beforeEach');
  });

  it('기본 placeholder "텍스트를 입력해 주세요."가 노축된다.', async () => {
    await render(<TextField />);

    const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

    expect(textInput).toBeInTheDocument();
    // 단언(assertion) -> 테스트가 통과하기 위한 조건 -> 검증 실행
  });

  it('placeholder props에 따라 placeholder가 변경된다.', async () => {
    //placeholder props가 올바르게 적용되는지 확인해야하기 때문에 렌더링 할 때 placeholder를 지정해준다.
    await render(<TextField placeholder="상품명을 입력해 주세요." />);

    const textInput = screen.getByPlaceholderText('상품명을 입력해 주세요.');

    expect(textInput).toBeInTheDocument();
    // 단언(assertion) -> 테스트가 통과하기 위한 조건 -> 검증 실행
  });

  it('텍스트를 입력하면 onChange prop으로 등록한 함수가 호출된다.', async () => {
    // vi.fn()은 spy 함수를 만드는데 사용된다.
    // spy 함수는 테스트 코드에서 특정 함수가 호출되었는지, 함수의 인자로 어떤것이 넘어왔는지, 어떤 값을 반환하는지 등 다양한 값들을 저장하고 있다.
    // 보통 콜백 함수나 이벤트 핸들러가 올바르게 호출되었는지 검증하고 싶을 때 spy 함수를 활용한다.
    // 예제 테스트의 경우 입력한 텍스트 즉 테그트 문자열을 인자로 받아 onChange 이벤트 핸들러가 호출되는지 확인해야 한다.
    // spy 함수를 사용하면 이러한 함수 호출에 대한 검증을 쉽게 할 수 있다.
    const spy = vi.fn();

    //onChange={spy} 로 spy를 넘겨주면 onChangeHandler로 지정한 spy함수가 원하는 인자와 함께 호출되었는지 검증할 수 있다.
    const { user } = await render(<TextField onChange={spy} />);

    const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

    await user.type(textInput, 'test');

    // 검증을 위해서는 매처가 필요하다.
    // toHaveBeenCalledWith -> spy 함수가 내가 원하는 test란 문자열과 함께 올바르게 호출되었는지 단원할 수 있다.
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('엔터키를 입력하면 onEnter props으로 등록한 함수가 호출된다.', async () => {
    // onEnterEventHandler가 올바르게 호출되는지 검증하는 것이기 때문에 spy 함수 필요
    const spy = vi.fn();

    const { user } = await render(<TextField onEnter={spy} />);

    const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

    // Enter키를 입력하기 위해 type API에서는 중괄호를 열고 엔터 문자열을 입력하면 엔터키 입력 이벤트가 발생한다.
    // 이 외에도 타입 API를 사용하면 Shift, Space, Alt 등의 키도 이런 식으로 작성할 수 있다.
    await user.type(textInput, 'test{Enter}');

    expect(spy).toHaveBeenCalledWith('test');
  });

  it('포커스가 활성화되면 onFocus prop으로 등록한 함수가 호출된다.', async () => {
    // 포커스 활성화 방법
    // 1. 탭 키로 인풋 요소로 포커스 이동
    // 2. 인풋 요소를 클릭했을 때
    // 3. textInput.focus()로 직접 발생

    const spy = vi.fn();

    // onFocusEventHandler를 호출할때는 별도의 인자를 넘기지 않는다. -> spy 함수의 호출 여부만 단원하면 된다.
    const { user } = await render(<TextField onFocus={spy} />);

    const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

    await user.click(textInput);

    // spy 함수의 호출 여부만 단원하는 매체로 toHaveBeenCalled 매처를 사용()
    expect(spy).toHaveBeenCalled();
  });

  it('포커스가 활성화되면 border 스타일이 추가된다.', async () => {
    // 포커스를 활성화하기 위해서는 이전과 동일하게 텍스트 인풋 요소의 클릭 이벤트를 사용
    // 단, 여기서는 input 요소에 border-style이 제대로 적용되는지 단언해야 한다.
    const { user } = await render(<TextField />);

    const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

    await user.click(textInput);

    // DOM에서 CSS 클래스가 아닌 style 속성을 검증하기 위해서는 toHabeStyle 매처를 사용
    expect(textInput).toHaveStyle({
      borderWidth: 2,
      borderColor: 'rgb(25, 118, 210)',
    });
  });
});
