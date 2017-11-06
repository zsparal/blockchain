// @flow

import * as jdenticon from "jdenticon";

let lazyCache: ?Map<string, string>;
let cache = (function() {
  if (!lazyCache) {
    lazyCache = new Map();
  }
  return lazyCache;
})();

export function getIcon(value: string) {
  const icon = cache.get(value);
  if (icon) {
    return icon;
  }

  const generated = `data:image/svg+xml;base64,${btoa(
    jdenticon.toSvg(value, 300)
  )}`;
  cache.set(value, generated);
  return generated;
}
