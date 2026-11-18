/** One input of a reference function and what it should give, as the bits of doubles. */
export interface FdlibmCase {
  /** The input, as 16 hexadecimal digits. */
  readonly input: string;
  /** What fdlibm 5.3, compiled from C, gives for the input. */
  readonly fdlibm: string;
  /** The correctly rounded result, from a 100-digit computation. */
  readonly correctlyRounded: string;
}

/** The reference cases of each function; every `NaN` is written as `7ff8000000000000`. */
export interface FdlibmCases {
  /** Cases of the natural logarithm. */
  readonly log: readonly FdlibmCase[];
  /** Cases of the exponential. */
  readonly exp: readonly FdlibmCase[];
}
