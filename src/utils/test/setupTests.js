import '@testing-library/jest-dom';

// 해당 teardown은 모킹한 모듈의 히스토리를 초기화(다른 테스트에 영향 X)
// -> teardown을 사용하여 모든 테스트가 완료된 후에 항상 이전의 모킹 실행 히스토리를 초기화하도록 설정하면 테스트의 독립성을 보장할 수 있다.
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
});

// https://github.com/vitest-dev/vitest/issues/821
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 테스트 환경에 Node.js이여서 어쩔 수 없이 전역에서 모킹이 필요한 경우가 있다.
// 예를 들어 matchMedia가 JSDOM 환경에 존재하지 않아 테스트 실행 시 에러가 나는 경우가 있다.
// 이러한 경우 테스트 실행을 위해 사전 매치 미디어에 구현을 모킹해서 테스트 실행에 문제가 없도록 해야 한다.

// -> 이 파일은 매처를 확장하거나 추가하고 싶을 때도 등록한다.
// 여기서는 DOM에 관련된 매처를 사용하기 위해 테스팅 라이브러리 Jest DOM을 추가하여 확장했다.
