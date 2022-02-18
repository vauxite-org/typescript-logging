
export class Timeout {

  /**
   * Invoke function later with given delay (uses settimeout)
   * @param f Function
   * @param delay Delay
   */
  public static invokeLater(f: () => void, delay: number): void {
    setTimeout(f, delay);
  }

}
