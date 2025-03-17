import type { Messages } from "global";

/**
 * Create a high-performance object property selector function
 * @template T Source object type
 * @template K type of key to select (must be a key of T)
 * @param {K[]} keys Array of keys to select from object
 * @returns {(obj: T) => Pick<T, K>} Returns a function that takes the source object and returns a new object containing only the specified keys
 */
function createFastPicker<T extends object, K extends keyof T>(
  keys: K[],
): (obj: T) => Pick<T, K> {
  // Pre-compile a specialized picker function
  const fnBody = `
    return {
      ${keys.map((key) => `"${String(key)}": obj["${String(key)}"]`).join(",\n      ")}
    };
  `;

  // Creating a new function using the Function constructor - note that TypeScript requires type assertions.
  return new Function("obj", fnBody) as (obj: T) => Pick<T, K>;
}

export const pickPublic = createFastPicker<Messages, "Public">(["Public"]);
