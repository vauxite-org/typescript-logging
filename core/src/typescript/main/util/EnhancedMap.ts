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
   * @return Existing value if the key already existed, or the newly computed value.
   */
  public computeIfAbsent(key: K, computer: (currentKey: K) => V): V {
    if (this.has(key)) {
      return this.get(key) as V;
    }
    const newValue = computer(key);
    this.set(key, newValue);
    return newValue;
  }

  /**
   * Computes a value for given key, the computer can return a value V (in which case the map
   * will set the value for given key), if it returns undefined the mapping for key K will be
   * removed.
   * @param key Key to compute
   * @param computer Computer which is called, note that the currentValue argument contains the existing
   *                 value or is undefined when no mapping exists for the key.
   */
  public compute(key: K, computer: (currentKey: K, currentValue: V | undefined) => V | undefined) {
    const currentValue = this.get(key);
    const newValue = computer(key, currentValue);
    if (newValue) {
      this.set(key, newValue);
    }
    else {
      this.delete(key);
    }
    return newValue;
  }
}
