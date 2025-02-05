import { screen, within } from '@testing-library/react';
import React from 'react';

import data from '@/__mocks__/response/products.json';
import ProductList from '@/pages/home/components/ProductList';
import { formatPrice } from '@/utils/formatter';
import {
  mockUseUserStore,
  mockUseCartStore,
} from '@/utils/test/mockZustandStore';
import render from '@/utils/test/render';

const PRODUCT_PAGE_LIMIT = 5;

const navigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => navigateFn,
    useLocation: () => ({
      state: {
        prevPath: 'prevPath',
      },
    }),
  };
});

it('로딩이 완료된 경우 상품 리스트가 제대로 모두 노출된다', async () => {
  // 컴포넌트 렌더링
  // PRODUCT_PAGE_LIMIT -> 5로 설정되어있음
  await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

  // 컴포넌트를 렌더링 한 후에는 상품 목록 내의 모든 상품 카드를 쿼리로 조회해야 한다.
  // 카드의 경우에는 정해진 role이나 텍스트로 일괄 조회하기 어렵기 때문에 미리 지정한 ID로 조회하여 모든 상품 카드를 조회한다.

  // 테스트 코드는 동기적으로 실행되기 때문에 기본적으로 promise를 반환하거나 비동기로 동작하는 코드는 실행되지 않는다.
  // 상품 목록을 가져오는 API 호출도 내부적으로 서버에서 데이터를 가져오는 promise를 반환한다.
  // -> 결과적으로 테스트 코드는 promise를 반환하는 API의 응답이 완료될 때가지 기다리지 않고 실행이 끝나버리기 때문에 테스트가 실패하게 된다.
  // 기본적으로 1초 동안 50ms마다 요소가 있는지 조회
  const productCards = await screen.findAllByTestId('product-card');
  // 상품 카드에 대한 모든 항목을 가져와서 설정한 PRODUCT_PAGE_LIMIT에 맞게 5개의 product 카드가 나오는지 단언
  expect(productCards).toHaveLength(PRODUCT_PAGE_LIMIT);

  // 반복적인 데이터 포맷을 기준으로 검증이 필요한 경우에는 forEach문을 사용하면 더 깔끔하게 작성 가능.
  productCards.forEach((el, index) => {
    // 특정 요소를 대상으로 React 테스팅 라이브러리의 query를 사용하고 싶은 경우에는 within 함수를 사용한다.
    // 테스트 코드에서는 각각의 productCard를 대상으로 요소를 조회하고 단언할 예정이라 within 함수를 사용하여 상품 카드 요소를 감싸두었다.
    const productCard = within(el);
    // 렌더링된 상품 카드 데이터가 모킹 데이터인 data.product와 동일한지 확인하면 된다.
    // productCard의 인덱스에 해당하는 모킹 데이터가 올바르게 productCard 내에 렌더링되었다면 상품 카드가 올바르게 렌더링 되었음을 보장할 수 있다.
    const product = data.products[index];

    // product 데이터가 productCard 내에 잘 렌더링 되었는지만 단언
    // getByText를 사용하여 모킹 데이터인 product에 설정된 title과 category.name 등이 productCard 내에 잘 렌더링 되었는지 단언
    expect(productCard.getByText(product.title)).toBeInTheDocument();
    expect(productCard.getByText(product.category.name)).toBeInTheDocument();
    // 가격도 동일하게 단언
    expect(
      productCard.getByText(formatPrice(product.price)),
    ).toBeInTheDocument();
    // 장바구니 버튼과 포맷 버튼이 잘 나오는지 getByRoll 쿼리를 사용하여 조회한 후 단언
    expect(
      productCard.getByRole('button', { name: '장바구니' }),
    ).toBeInTheDocument();
    expect(
      productCard.getByRole('button', { name: '구매' }),
    ).toBeInTheDocument();
  });
});

it('보여줄 상품 리스트가 더 있는 경우 show more 버튼이 노출되며, 버튼을 누르면 상품 리스트를 더 가져온다.', async () => {
  //컴포넌트 렌더링
  const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

  // Show More 버튼의 노출 야부는 API에서 상품 목록 데이터를 가져와 렌더링 된 후에 알 수 있다.
  // show more 버튼의 노출 여부를 정확하게 판단하기 위해
  // findBy 쿼리를 사용하여 먼저 첫 페이지에 해당하는 상품 목록이 렌더링되는 것을 기다려야 한다.
  await screen.findAllByTestId('product-card');

  // show more 버튼의 존재 여부도 명확하게 확인하기 위해 1차적으로 단언(Show more 버튼이 정상적으로 나오는지 확인)
  expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();

  // Show more 버튼을 시뮬레이션하여 5개의 데이터를 더 가져오는지 확인
  const moreBtn = screen.getByRole('button', { name: 'Show more' });
  await user.click(moreBtn);

  // 최종적으로 상품 카드의 개수가 5개에서 10개로 바뀌었는지 단언
  expect(await screen.findAllByTestId('product-card')).toHaveLength(
    PRODUCT_PAGE_LIMIT * 2,
  );
});

it('보여줄 상품 리스트가 없는 경우 show more 버튼이 노출되지 않는다.', async () => {
  // 컴포넌트를 렌더링 할 때, Limit props를 전체 모킹 데이터보다 많게 설정하면 이 상황을 재현할 수 있다.
  // 모킹 데이터 20개보다 많은 수 50으로 limit을 설정
  await render(<ProductList limit={50} />);

  // findBy 쿼리를 사용하여 먼저 첫 페이지에 해당하는 상품 목록이 렌더링되는 것을 기다려야 한다.
  await screen.findAllByTestId('product-card');

  // Show more 버튼이 DOM에 존재하지 않는지 단언
  // queryByText를 사용해야 DOM 요소가 없을 때도 에러가 발생하지 않고 정상적으로 단언할 수 있다.
  expect(screen.queryByText('Show more')).not.toBeInTheDocument();
});

describe('로그인 상태일 경우', () => {
  // 테스트 전에 로그인을 실행한 상태로 셋팅
  // -> beforeEach setup 함수에서 가짜 사용자로 항상 로그인되어 있도록 mockUseUserStore 유틸 함수를 사용하여 설정
  beforeEach(() => {
    mockUseUserStore({ isLogin: true, user: { id: 10 } });
  });

  it('구매 버튼 클릭시 addCartItem 메서드가 호출되며, "/cart" 경로로 navigate 함수가 호출된다.', async () => {
    // 통합 테스트 역시 좀 더 큰 범위로 비즈니스 로직을 검증할 수 있지만,
    // 이처럼 다른 페이지의 로직을 검증할 수는 없기 때문에 이러한 모킹 작업이 필요
    const addCartItemFn = vi.fn();
    mockUseCartStore({ addCartItem: addCartItemFn });

    // 모킹 오나료 후 상품의 구매 버튼 클릭을 위해 이전과 마찬가지로 API에서 데이터를 가져와 모두 렌더링 될 때까지 기다린다.
    const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

    await screen.findAllByTestId('product-card');

    // 첫번째 상품을 대상으로 검증한다.
    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '구매' })[productIndex],
    );

    // addCartItemFn이 원하는 인자와 한번 호출되었는지 toHaveBeenNthCalledWith 매처와 함께 단언
    expect(addCartItemFn).toHaveBeenNthCalledWith(
      1,
      data.products[productIndex],
      10,
      1,
    );

    // 최종적으로 장바구니 페이지로 이동하는지 NavigateFn spy 함수를 사용하여 단언
    expect(navigateFn).toHaveBeenNthCalledWith(1, '/cart');
  });

  it('장바구니 버튼 클릭시 "장바구니 추가 완료!" toast를 노출하며, addCartItem 메서드가 호출된다.', async () => {
    const addCartItemFn = vi.fn();
    // 장바구니 추가에 대한 액션을 모킹
    mockUseCartStore({ addCartItem: addCartItemFn });

    // 상품 목록이 모두 정상적으로 렌더링 될 때까지 기다린다.
    const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

    await screen.findAllByTestId('product-card');

    // 첫번째 상품을 대상으로 검증한다.
    // -> 첫번째 상품의 장바구니 버튼을 눌러 시뮬레이션한다.
    // -> API를 통해 모든 상품의 데이터가 렌더링 될 때까지 기다린 후에 첫번째 상품에 장바구니 버튼을 누른 상황을 시뮬레이션 하는 것이다.
    const productIndex = 0;
    const product = data.products[productIndex];
    await user.click(
      screen.getAllByRole('button', { name: '장바구니' })[productIndex],
    );

    // addCartItemFn 액션이 toHaveBeenNthCalledWith 매처를 사용하여 정상적으로 호출되었는지 단언
    expect(addCartItemFn).toHaveBeenNthCalledWith(1, product, 10, 1);
    // getByTextQuery를 사용하여 장바구니 추가 완료란 toast가 DOM에 제대로 렌더링 되었는지 단언
    expect(
      screen.getByText(`${product.title} 장바구니 추가 완료!`),
    ).toBeInTheDocument();
  });
});

describe('로그인이 되어 있지 않은 경우', () => {
  // 장바구니 구매 버튼을 눌렀을 때 로그인 페이지로 이동만 하는 것이 전부인 테스트
  // user 스토어에 대한 모킹을 하지 않으면 기본적으로 비로그인 상태이기 때문에 별도 setup 함수 작성 없이 바로 테스트를 실행할 수 있다.
  it('구매 버튼 클릭시 "/login" 경로로 navigate 함수가 호출된다.', async () => {
    const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

    await screen.findAllByTestId('product-card');

    // 첫번째 상품을 대상으로 검증한다.
    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '구매' })[productIndex],
    );

    expect(navigateFn).toHaveBeenNthCalledWith(1, '/login');
  });

  it('장바구니 버튼 클릭시 "/login" 경로로 navigate 함수가 호출된다.', async () => {
    const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

    await screen.findAllByTestId('product-card');

    // 첫번째 상품을 대상으로 검증한다.
    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '장바구니' })[productIndex],
    );

    expect(navigateFn).toHaveBeenNthCalledWith(1, '/login');
  });
});

it('상품 클릭시 "/product/:productId" 경로로 navigate 함수가 호출된다.', async () => {
  const { user } = await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

  const [firstProduct] = await screen.findAllByTestId('product-card');

  // 첫번째 상품을 대상으로 검증한다.
  await user.click(firstProduct);

  expect(navigateFn).toHaveBeenNthCalledWith(1, '/product/6');
});
