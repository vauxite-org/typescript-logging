/**
 * Extends Map and adds a few convenient functions.
 */
export class EnhancedMap<K,V> extends Map<K, V> {

  /**
   * If key has a mapping already returns the currently associated value. If
   * there is no mapping, calls the computer which must return a value V.
   * The value is then stored for given key and returned.
   * @param key Key
   * @param computer Computer which is called only if key has no mapping yet.
   */
  public computeIfAbsent(key: K, computer: (currentKey: K) => V): V | undefined {
    if (this.has(key)) {
      return this.get(key);
    }
    const newValue = computer(key);
    this.set(key, newValue);
    return newValue;
  }
}
