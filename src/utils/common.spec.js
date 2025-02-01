import { pick, debounce } from './common';

describe('pick util 단위테스트', () => {
  it('단일 인자로 전달된 키의 값을 객체에 담아 반환한다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj, 'a')).toEqual({ a: 'A' });
  });

  it('2개 이상의 인자로 전달된 키의 값을 객체에 담아 반환한다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj, 'a', 'b')).toEqual({ a: 'A', b: { c: 'C' } });
  });

  it('대상 객체로 아무 것도 전달 하지 않을 경우 빈 객체가 반환된다', () => {
    expect(pick()).toEqual({});
  });

  it('propNames를 지정하지 않을 경우 빈 객체가 반환된다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj)).toEqual({});
  });
});

describe('debounce', () => {
  // 타이머 모킹 -> 0.3초 흐른것으로 타이머 조작 -> spy 함수 호출 확인
  // vitest에서는 타이머의 시간을 조작하는 API로 advanceTimersByTime이라는 API가 있다.
  // -> 이 API를 사용하면 원하는 밀리세컨즈만큼 시간이 지난 것으로 타이머를 조작할 수 있다.
  beforeEach(() => {
    // teardown에서 모킹 초기화 - 다른 테스트에 영향이 없어야 한다.
    // -> 모킹 초기화를 해야 다른 테스트에 영향을 미치지 않고 안정적으로 테스트를 실행할 수 있다.

    // 타이머 모킹도 초기화 필수!
    // 3rd 파티 라이브러리, 전역의 teardown에서 타이머에 의존하는 로직 - fakeTimer로 인해 제대로 동작하지 않을 수 있다.
    vi.useFakeTimers();

    // setSystemTime API는 테스트가 실행되는 현재 시간을 정의하는 API이다.
    // -> useFakeTimers라는 API를 호출한 뒤 setSystemTime에 원하는 날짜를 나타내는 객체 또는 값을 넣어 현재 시간을 정의할 수 있다.
    // 시간은 계속 흐르기 때문에 매일 달라진다.
    // -> 테스트 당시의 시간에 의존하는 테스트의 경우 시간을 고정하지 않으면 테스트가 깨질 수 있다.
    // -> 이런 문제를 해결하기 위해 setSystemTimeAPI를 사용해서 시간을 고정하면 일관된 환경에서 테스트 가능
    vi.setSystemTime(new Date('2023-12-25')); // 23년 12월 25일에 테스트를 하는 환경을 만들 수 있다.
  });
  // -> 또한 setup의 beforeEach 함수는 디바운스(debounced) describe 스코프 내에서만 실행되기 때문에
  // Pick 유틸과 관련되니 테스트가 실행될 때는 불필요하게 실행되지 않는다는 장점이 있다.

  afterEach(() => {
    // 타이머를 원상태로 복구하는 API는 useRealTimers라는 API이다.
    vi.useRealTimers();
  });

  // 디바운스 함수의 테스트를 위해서는 콜백 함수를 하나 넘겨 특정 시간이 지났을 때 호출되는지 검증
  // 함수의 호출 여부를 확인하기 위해 spy 함수 사용
  // -> vi.useFakeTimers() 코드 없이 테스트를 실행하면 spy 함수가 호출되지 않았다고 테스트가 실패한다.
  // -> 현재 테스트 코드에서는 아무리 toHaveBeenCalled 매체를 사용해서 단원해도 테스트는 실패한다.
  // 그 이유는 테스트 코드는 비동기 타이머와 무관하게 동기적으로 실행
  // -> 비동기 함수가 실행되기 전에 단언이 실행된다.
  // -> 따라서 테스트 코드 실행 도중 우리가 원하는 시간 0.3초만큼 딜레이를 해야만 정상적으로 검증할 수 있다.
  it('특정 시간이 지난 후 함수가 호출된다.', () => {
    // 원하는 시점에 0.3초 딜레이
    // -> vitest와 같은 대부분의 프레임워크에서는 테스트 실행 시 타이머를 모킹하여 원하는 대로 제어할 수 있는 API를 제공

    // 타이머를 모킹하는 방법
    // -> 테스트를 실행하기 전에 vitest에서 제공하는 useFakeTimers 함수만 호출해주면 된다.

    // spy 함수를 생성하여 디바운스 함수를 실행
    const spy = vi.fn();

    // 콜백 함수를 첫번째 인자로 넘기고 타이머 시간을 두번째 인자로 디바운스 함수에 넘겨야한다.
    // 타이머 시간을 0.3초로 300으로 설정
    const debouncedFn = debounce(spy, 300);

    // debouncedFn 함수 호출 후
    debouncedFn();

    // 디바운스 함수가 실행된 후에 advanceTimersByTime() 함수를 호출해서 0.3초가 흐른 것처럼 조작
    vi.advanceTimersByTime(300);

    // 위에서 지정한 0.3초 타이머가 지난 후 콜백으로 넘긴 스파이 함수가 호출되는지 확인한다.
    // toHaveBeenCalled 매처는 단순히 spy 함수의 호출 여부만 확인할 수 있는 매처
    // -> 함수의 호출 횟수까지 단원 X
    expect(spy).toHaveBeenCalled();
  });

  // 핵심 기능!!
  // 이 테스트에서도 spy 함수를 만들어서 debounced 함수를 호출
  it('연이어 호출해도 마지막 호출 기준으로 지정된 타이머 시간이 지난 경우에만 함수가 호출된다.', () => {
    const spy = vi.fn();

    const debouncedFn = debounce(spy, 300);

    // debouncedFn를 5번 호출해보자

    //최초 호출
    debouncedFn();

    // 최초 호출 후 0.2초 후 호출
    vi.advanceTimersByTime(200);
    debouncedFn();

    // 두번째 호출 후 0.1초 후 호출
    vi.advanceTimersByTime(100);
    debouncedFn();

    // 세번째 호출 후 0.2초 후 호출
    vi.advanceTimersByTime(200);
    debouncedFn();

    // 네번째 호출 후 0.3초 후 호출
    // 최초 호출 후에 함수 호출 간격이 0.3초 이상 -> 다섯번째 호출이 유일
    vi.advanceTimersByTime(300);
    debouncedFn();

    // 다섯번을 호출했지만 실제 spy 함수는 단 한번만 호출
    // 함수의 호출 횟수를 단언하기 위해 toHaveBeenCalledTimes 매처 사용
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
