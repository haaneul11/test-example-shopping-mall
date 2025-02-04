import { screen, within } from '@testing-library/react';
import React from 'react';

import ProductInfoTable from '@/pages/cart/components/ProductInfoTable';
import {
  mockUseCartStore,
  mockUseUserStore,
} from '@/utils/test/mockZustandStore';
import render from '@/utils/test/render';

// ProductInfoTable 컴포넌트는 zustand의 데이터를 가져와 사용하기 때문에 장바구니에 데이터가 있는 것처럼 설정하기 위해 모킹한 zustand 모드를 사용하여 초기 데이터를 설정해야 한다.
// -> beforeEach를 사용하면 편리하게 초기 데이터를 설정할 수 있다.
beforeEach(() => {
  mockUseUserStore({ user: { id: 10 } });
  mockUseCartStore({
    cart: {
      6: {
        id: 6,
        title: 'Handmade Cotton Fish',
        price: 809,
        description:
          'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality',
        images: [
          'https://user-images.githubusercontent.com/35371660/230712070-afa23da8-1bda-4cc4-9a59-50a263ee629f.png',
          'https://user-images.githubusercontent.com/35371660/230711992-01a1a621-cb3d-44a7-b499-20e8d0e1a4bc.png',
          'https://user-images.githubusercontent.com/35371660/230712056-2c468ef4-45c9-4bad-b379-a9a19d9b79a9.png',
        ],
        count: 3,
      },
      7: {
        id: 7,
        title: 'Awesome Concrete Shirt',
        price: 442,
        description:
          'The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J',
        images: [
          'https://user-images.githubusercontent.com/35371660/230762100-b119d836-3c5b-4980-9846-b7d32ea4a08f.png',
          'https://user-images.githubusercontent.com/35371660/230762118-46d965ab-7ea8-4e8a-9c0f-3ed90f96e1cd.png',
          'https://user-images.githubusercontent.com/35371660/230762139-002578da-092d-4f34-8cae-2cf3b0dfabe9.png',
        ],
        count: 4,
      },
    },
  });
});

it('장바구니에 포함된 아이템들의 이름, 수량, 합계가 제대로 노출된다', async () => {
  // Handmade Cotton Fish와 Awesome Concrete Shirt의 상품명, 수량, 가격이 제대로 노출되는지 확인
  // 컴포넌트를 먼저 렌더링하기
  await render(<ProductInfoTable />);

  // 컴포넌트를 렌더링 후 상품 데이터를 가져오기
  // 상품 데이터는 테이블 형태이기 때문에 각 테이블 행에 해당하는 요소를 조회해야 한다.
  // 이때 테이블의 행은 row라는 롤로 조회할 수 있다.

  // 상품 리스트 테이블은 여러 row가 있기 때문에 getAllByRowQuery를 사용하여 row를 가진 모든 요소를 가져올 수 있습니다.
  //또한, 모킹 데이터에서 두 개의 상품 목록 데이터를 설정했기 때문에 두 개의 테이블 row를 기준으로 기능을 검증할 것이다.
  const [firstItem, secondItem] = screen.getAllByRole('row');

  // 각 테이블 행별로 설정한 상품 목 데이터가 잘 렌더링 되는지만 확인하면 된다.
  // First 아이템을 대상으로 상품명이나 가격 정보가 잘 나오는지 확인
  // 이미 조회한 요소를 기준으로 React 테스팅 라이브러리의 query를 사용하고 싶다면 within 함수를 사용해야 한다.
  // within 함수를 사용하면 First 아이템 내에서 Handmade Cotton Fish 라는 텍스르를 가진 요소를 줘야한다.
  // firstItem
  expect(
    // 이처럼 특정 요소 내에서만 Query를 하고 싶은 경우 Whthin 함수를 사용하여 React 테스팅 라이브러리에서
    // 제공하는 Query를 사용하면 유용하다.
    within(firstItem).getByText('Handmade Cotton Fish'),
  ).toBeInTheDocument();
  // 상품명 외에도 수량, 가격에 대한 정보도 원하는 대로 렌더링 되는지 단언
  expect(within(firstItem).getByRole('textbox')).toHaveValue('3');
  expect(within(firstItem).getByText('$2,427.00')).toBeInTheDocument();

  // secondItem
  expect(
    // 이처럼 특정 요소 내에서만 Query를 하고 싶은 경우 Whthin 함수를 사용하여 React 테스팅 라이브러리에서
    // 제공하는 Query를 사용하면 유용하다.
    within(secondItem).getByText('Awesome Concrete Shirt'),
  ).toBeInTheDocument();
  // 상품명 외에도 수량, 가격에 대한 정보도 원하는 대로 렌더링 되는지 단언
  expect(within(secondItem).getByRole('textbox')).toHaveValue('4');
  expect(within(secondItem).getByText('$1,768.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 변경되었을 때 값이 재계산되어 올바르게 업데이트 된다', async () => {
  // 수량 텍스트를 입력하는 사용자 인터랙션이 필요하다.
  // 컴포넌트 렌더링
  const { user } = await render(<ProductInfoTable />);
  // 모든 상품 로우 요소를 조회 -> 첫 번째 상품을 대상으로 수량을 변경
  const [firstItem] = screen.getAllByRole('row');

  // 첫 번째 상품에 텍스트 필드 요소를 조회해야 한다.
  // 텍스트 인풋의 경우 플레이스 홀더로 가져올 수 있으나 이 경우 플레이스 홀더 속성이 따로 지정된 것이 없기 때문에 텍스트 박스로 조회해야 한다.
  const input = within(firstItem).getByRole('textbox');

  // 수량 변경 시뮬레이션
  await user.clear(input);
  // 수량을 5로 변경
  await user.type(input, '5');

  // 변경한 수량에 따라 가격이 제대로 계산되는지 확인
  // 기존 : 가격 809인 상품 3개(2427) -> 변경 5개(4045, 가격 포맷은 달러 포맷으로 노출되기 때문에 이 부분까지 테스트에서 한 번에 검증할 수 있다.)
  // 2427 + 809 * 2 = 4045
  // 최종적으로 계산된 달러 포맷의 가격이 도움에 존재하는지 getByText()로 조회하고 toBeInTheDocument 매처를 사용하여 검증
  expect(screen.getByText('$4,045.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 1000개로 변경될 경우 "최대 999개 까지 가능합니다!"라고 경고 문구가 노출된다', async () => {
  // 숫자 1000을 입력하여 윈도우에 alert함수가 호출되는지 확인해야 한다.
  // 즉, 윈도우에 alert 함수가 최대 999개까지 가능하다.
  // 문자열과 함께 호출되었는지 spy 함수를 사용하여 단언해야 한다.

  // alert 함수를 대체할 spy 함수를 정의
  const alertSpy = vi.fn();
  // vitest에서 stubGlobal() 함수를 사용하여 JS DOM 내의 윈도우 객체에 대한 기본 동작을 변경할 수 있다.
  // window.alert -> alertSpy로 대체
  vi.stubGlobal('alert', alertSpy);

  // 컴포넌트 렌더링
  const { user } = await render(<ProductInfoTable />);

  // row와 textbox 조회
  const [firstItem] = screen.getAllByRole('row');

  const input = within(firstItem).getByRole('textbox');

  await user.clear(input);
  await user.type(input, '1000');

  // 숫자 1000을 입력했을 때 모킹한 alertSpy에 최대 999개까지 가능합니다. 문자열이 전달되어 호출되는지만 단언하면 된다.
  expect(alertSpy).toHaveBeenNthCalledWith(1, '최대 999개 까지 가능합니다!');
});

it('특정 아이템의 삭제 버튼을 클릭할 경우 해당 아이템이 사라진다', async () => {
  // 삭제 버튼을 클릭하는 클릭 이벤트 시뮬레이션이 필요하다.

  // 컴포넌트 렌더링
  const { user } = await render(<ProductInfoTable />);

  // 여기서는 두 번째 상품을 대상으로 작성
  const [, secondItem] = screen.getAllByRole('row');
  // 두 번째 상품 내에 삭제 버튼을 조회
  // 버튼의 경우 getByRole에서 buttonRoll로 조회할 수 있다.
  const deleteButton = within(secondItem).getByRole('button');

  // 삭제 버튼을 클릭하기 전에 두번째 아이템이 정상적으로 존재하는지 확인
  expect(screen.getByText('Awesome Concrete Shirt')).toBeInTheDocument();

  // 삭제 버튼을 클릭하는 시뮬레이션
  await user.click(deleteButton);

  // -> 삭제 버튼을 클릭했을 때 Awesome Concreate Shirt 컨텐츠가 DOM에서 존재하지 않는지,
  // 즉 삭제되었는지 확인하면 된다.
  // 여기서 주의할 점은 getByText가 아니라 queryByText로 단언해야한다.
  // React 테스팅 라이브러리에서 qeuryBy로 시작하는 함수는 요소의 존재 유무를 판단할 때 사용하는 query이다.
  // getBy로 시작하는 함수와 다르게 요소가 존재하지 않아도 에러를 던지지 않기 때문에 요소가 DOM에 존재하지 않는 경우에
  // queryBy로 시작하는 함수를 사용하여 단언하는 요소가 DOM에 존재하지 않는 경우에 queryBy로 시작하는 함수를 사용하여 단언하는 것을 공식 문서에서도 권장하고 있다.
  // 이외의 요소가 없을 때 왜 해당 요소가 없는지 명확한 에러 피드백을 주는 get 함수를 사용하는 것이 좋고
  // 요소가 DOM에 존재하지 않는지 단언할 때만 queryBy 함수를 사용하는 것이 좋다.
  expect(screen.queryByText('Awesome Concrete Shirt')).not.toBeInTheDocument();
});
