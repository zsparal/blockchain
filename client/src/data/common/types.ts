export interface TypedAction<T extends string> {
  readonly type: T;
}

export interface Dict<T> {
  [key: string]: T;
}

export type Reducer<S> = (state: S | undefined, action: TypedAction<any>) => S;

export const returnOf = <R>(_: (...args: any[]) => R): R => null!;
