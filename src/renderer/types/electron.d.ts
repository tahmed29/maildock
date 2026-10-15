export {};

declare global {
  interface Window {
    maildock: {
      getAppVersion: () => Promise<string>;
    };
  }
}