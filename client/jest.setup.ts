import '@testing-library/jest-dom';

// Polyfill for Headers and Response first (needed for fetch)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeFetch = require('node-fetch');
  if (nodeFetch.Headers && typeof global.Headers === 'undefined') {
    global.Headers = nodeFetch.Headers;
    (globalThis as any).Headers = nodeFetch.Headers;
  }
  if (nodeFetch.Response && typeof global.Response === 'undefined') {
    global.Response = nodeFetch.Response;
    (globalThis as any).Response = nodeFetch.Response;
  }
} catch {
  // Fallback: create minimal mocks
  if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers {
      private headers = new Map<string, string>();
      get(name: string) {
        return this.headers.get(name.toLowerCase()) || null;
      }
      set(name: string, value: string) {
        this.headers.set(name.toLowerCase(), value);
      }
      has(name: string) {
        return this.headers.has(name.toLowerCase());
      }
    } as typeof Headers;
    (globalThis as any).Headers = global.Headers;
  }
  if (typeof global.Response === 'undefined') {
    global.Response = class Response {
      ok = true;
      status = 200;
      statusText = 'OK';
      headers = new (global.Headers as typeof Headers)();
      async json() {
        return {};
      }
      async text() {
        return '';
      }
    } as typeof Response;
    (globalThis as any).Response = global.Response;
  }
}

// Polyfill for fetch (required for Firebase and other libraries)
// Node.js 18+ has built-in fetch, but Jest's jsdom environment doesn't expose it
if (typeof global.fetch === 'undefined') {
  // Try to use node-fetch (available as transitive dependency)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFetch = require('node-fetch');
    // node-fetch v2 exports default, v3+ exports named
    const fetchImpl = nodeFetch.default || nodeFetch;
    global.fetch = fetchImpl as typeof fetch;
    (globalThis as any).fetch = fetchImpl;
  } catch (e) {
    // Fallback: create a minimal fetch mock
    const mockFetch = async () => {
      return {
        ok: false,
        status: 500,
        statusText: 'Not Implemented',
        json: async () => ({}),
        text: async () => '',
        headers: new (global.Headers as typeof Headers)(),
      } as Response;
    };
    global.fetch = mockFetch as typeof fetch;
    (globalThis as any).fetch = mockFetch;
  }
}

// Polyfill for AbortController
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    signal = { aborted: false };
    abort() {
      this.signal.aborted = true;
    }
  } as typeof AbortController;
  (globalThis as any).AbortController = global.AbortController;
}

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

export {};

