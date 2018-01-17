export interface Dict<T> {
  [key: string]: T;
}

export namespace Dict {
  export function fromArray<T>(array: T[], keySelector: (value: T) => string): Dict<T> {
    const result: Dict<T> = {};
    for (const item of array) {
      result[keySelector(item)] = item;
    }
    return result;
  }
}
