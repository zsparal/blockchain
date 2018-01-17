declare global {
  interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
  }

  interface Window {
    requestIdleCallback(cb: (deadline: IdleDeadline) => void): number;
    cancelIdleCallback(id: number): void;
  }
}

export {};
