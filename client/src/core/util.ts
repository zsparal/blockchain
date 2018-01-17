export function repeat<R>(n: number, mapping: (index: number) => R): R[] {
  return Array.from(Array(n), (_, n) => mapping(n));
}
