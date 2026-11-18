"""Writes the reference cases of log and exp for the engine's tests.

For each input it records what fdlibm 5.3 gives (through fdlibm_oracle, built
from the C sources) and the correctly rounded result (Python's decimal, 100
digits). Inputs: special values, both sides of every branch of e_log.c and
e_exp.c, a seeded spread over the whole range, inputs like the engine's and
"near-midpoint" inputs: of a million seeded candidates, the thousand whose exact
result lies closest to the midpoint between two doubles.

Usage: python3 -I make_cases.py <fdlibm_oracle> <output .ts file>
"""

import decimal
import heapq
import math
import random
import struct
import subprocess
import sys

SEED = 20261118
NEAR_MIDPOINT_CANDIDATES = 1_000_000
NEAR_MIDPOINT_COUNT = 1000
CANONICAL_NAN = "7ff8000000000000"
LOG_OF_TWO = 0.6931471805599453

decimal.getcontext().prec = 100
decimal.getcontext().Emin = -999999
decimal.getcontext().Emax = 999999


def to_bits(value):
    if value != value:
        return CANONICAL_NAN

    return struct.pack(">d", value).hex()


def from_bits(bits):
    return struct.unpack(">d", bytes.fromhex(bits))[0]


def words(high, low):
    return f"{high:08x}{low:08x}"


def with_neighbors(bits):
    value = int(bits, 16)

    return [f"{value - 1:016x}", bits, f"{value + 1:016x}"]


def log_inputs(rng):
    special = [
        "0000000000000000", "8000000000000000", "bff0000000000000",
        "fff0000000000000", "7ff0000000000000", "7ff8000000000000",
        "fff8000000000000", "3ff0000000000000", "0000000000000001", "8000000000000001",
        "0008000000000000", "000fffffffffffff", "0010000000000000",
        "7fefffffffffffff", "4000000000000000", "3fe0000000000000",
        "4090000000000000",
    ]
    near_one = [to_bits(1 + k * 2.0**-52) for k in range(1, 51)]
    near_one += [to_bits(1 - k * 2.0**-53) for k in range(1, 51)]
    branches = []

    for exponent in (0x001, 0x3FE, 0x3FF, 0x400, 0x7FE):
        for mantissa in (
            0x6A09B, 0x6A09C,  # normalization, (hx + 0x95f64) & 0x100000
            0x6147A, 0x6147B, 0x6B850, 0x6B851,  # sign of i | j
            0xFFFFD, 0xFFFFE, 0xFFFFF, 0x00000, 0x00001,  # |f| < 2**-20
        ):
            for low in (0x00000000, 0x00000001, 0xFFFFFFFF):
                branches.append(words((exponent << 20) | mantissa, low))

    # Inputs where the |f| < 2**-20 shortcut of e_log.c and its general path
    # round differently, so a port that drops or changes the shortcut fails;
    # found by a seeded search over that region.
    shortcut = [
        "3feffffe37cb539d", "3feffffe38ee39cc", "3fefffff2d487e07", "3fefffff3626a717",
        "3ff00000f02b63b3", "3ff00000ff558342", "3ff000018081e4fd", "3ff00001f8f4f410",
    ]
    spread = [
        words((rng.randrange(0x001, 0x7FF) << 20) | rng.getrandbits(20), rng.getrandbits(32))
        for _ in range(800)
    ]
    spread += [f"{rng.randrange(1, 1 << 52):016x}" for _ in range(100)]
    uniforms = [rng.random() for _ in range(250)]
    engine = [to_bits(u) for u in uniforms] + [to_bits(1 - u) for u in uniforms]

    return special + near_one + branches + shortcut + spread + engine


def exp_inputs(rng):
    special = [
        "0000000000000000", "8000000000000000", "7ff0000000000000",
        "fff0000000000000", "7ff8000000000000", "fff8000000000000",
        "3ff0000000000000", "bff0000000000000", "0000000000000001",
        "8000000000000001",
    ]
    # Far beyond the overflow and underflow limits, where a port without
    # those checks would scale the exponent around and give garbage.
    special += [to_bits(x) for x in (1000.0, 2.0**64, 1e300, -1000.0, -(2.0**64), -1e300)]
    branches = []

    for bits in (
        "40862e42fefa39ef",  # o_threshold
        "c0874910d52d3051",  # u_threshold
        "40862e4200000000",  # |x| >= 709.78..., the high-word filter
        "3fd62e4200000000", "3fd62e42ffffffff", "3fd62e4300000000",  # 0.5 ln2
        "3ff0a2b1ffffffff", "3ff0a2b200000000",  # 1.5 ln2
        "3e2fffffffffffff", "3e30000000000000",  # 2**-28
    ):
        for sign in ("0", "8"):
            magnitude = int(bits, 16) & ~(1 << 63)
            signed = f"{int(sign, 16) << 60 | magnitude:016x}"
            branches += with_neighbors(signed)

    # Inputs where the |x| < 2**-28 shortcut of e_exp.c (1 + x) and its general
    # path round differently, below 2**-28 and at it, so a port that drops the
    # shortcut or moves its limit fails; found by a seeded search.
    shortcut = [
        "3e2000002ff7c0fc", "3e2000006fcfd73d", "3e201000cffaea0c", "3e202000efeffc4f",
        "3e2030008fbff9ba", "3e2030006ffd7de0", "3e205000cff4ffa4", "3e205000efea1afe",
        "3e30000067888144", "3e30000047e4ee73", "be300000846503c2", "be3000005c7809e4",
    ]
    # Inputs whose high word is exactly at the 0.5 ln2 and 1.5 ln2 limits, where
    # moving a limit by one changes the reduction and the rounding; found by a
    # seeded search.
    shortcut += [
        "3fd62e422335e9e2", "3fd62e42cd425ec3", "bfd62e42de27660b", "bfd62e428e8b88c2",
        "3ff0a2b2c0d64421", "3ff0a2b2f391361a", "bff0a2b2cf8f95c3", "bff0a2b2d6c500f4",
    ]
    k_limit = [-745.2 + step * (745.2 - 707.0) / 200 for step in range(201)]
    spread = [rng.uniform(-745.2, 709.8) for _ in range(1000)]
    engine = [-((37 * rng.random()) ** 2) / 2 for _ in range(500)]

    return special + branches + shortcut + [to_bits(x) for x in k_limit + spread + engine]


def distance_to_midpoint(function, value):
    """How far the exact result is from the midpoint of the two doubles around
    it, in units in the last place: 0 is the hardest to round, 0.5 the easiest."""
    exact = decimal.Decimal(value)
    result = exact.ln() if function == "log" else exact.exp()
    nearest = float(result)
    toward = math.inf if result > decimal.Decimal(nearest) else -math.inf
    neighbor = math.nextafter(nearest, toward)
    midpoint = (decimal.Decimal(nearest) + decimal.Decimal(neighbor)) / 2
    ulp = abs(decimal.Decimal(neighbor) - decimal.Decimal(nearest))

    return abs(result - midpoint) / ulp


def near_midpoint_inputs(function, seed):
    """Of NEAR_MIDPOINT_CANDIDATES seeded inputs with normal results, keeps the
    NEAR_MIDPOINT_COUNT whose exact result lies closest to a rounding midpoint:
    there, a correctly rounded library and one that is not give different bits."""
    rng = random.Random(seed)
    candidates = []

    for _ in range(NEAR_MIDPOINT_CANDIDATES):
        if function == "log":
            candidates.append(from_bits(words((rng.randrange(0x001, 0x7FF) << 20) | rng.getrandbits(20), rng.getrandbits(32))))
        else:
            candidates.append(rng.uniform(-708.0, 709.0))

    hardest = heapq.nsmallest(
        NEAR_MIDPOINT_COUNT,
        candidates,
        key=lambda value: distance_to_midpoint(function, value),
    )

    return [to_bits(value) for value in hardest]


def correctly_rounded(function, bits):
    value = from_bits(bits)

    if value != value:
        return CANONICAL_NAN

    try:
        exact = decimal.Decimal(value)
        result = exact.ln() if function == "log" else exact.exp()
    except decimal.InvalidOperation:
        return CANONICAL_NAN
    except decimal.Overflow:
        # Only exp overflows: e^x beyond the context's exponent range is far
        # above the largest double, so it rounds to +Infinity.
        return to_bits(math.inf)

    return to_bits(float(result))


def fdlibm_outputs(oracle, function, inputs):
    completed = subprocess.run(
        [oracle, function],
        input="\n".join(inputs) + "\n",
        capture_output=True,
        text=True,
        check=True,
    )
    outputs = completed.stdout.split()

    if len(outputs) != len(inputs):
        raise SystemExit(f"{function}: {len(outputs)} outputs for {len(inputs)} inputs")

    return [to_bits(from_bits(bits)) for bits in outputs]


def cases(oracle, function, inputs, near_midpoint):
    unique = list(dict.fromkeys(inputs + near_midpoint))
    near = set(near_midpoint)
    outputs = fdlibm_outputs(oracle, function, unique)
    lines = []

    for bits, output in zip(unique, outputs):
        reference = correctly_rounded(function, bits)
        flag = "true" if bits in near else "false"
        lines.append(f"    toCase('{bits}', '{output}', '{reference}', {flag}),")

    return lines


def check_references(oracle):
    """Stops before anything is written if the oracle or the decimal reference
    gives a wrong value on cases whose results are known."""
    known = [
        ("log", "3ff0000000000000", "0000000000000000"),  # log 1 = 0
        ("log", "4000000000000000", to_bits(LOG_OF_TWO)),  # log 2
        ("exp", "0000000000000000", "3ff0000000000000"),  # exp 0 = 1
    ]

    for function, bits, expected in known:
        if fdlibm_outputs(oracle, function, [bits]) != [expected]:
            raise SystemExit(f"the oracle does not give {function}({bits}) = {expected}")

        if correctly_rounded(function, bits) != expected:
            raise SystemExit(f"decimal does not give {function}({bits}) = {expected}")


def main():
    oracle, output_path = sys.argv[1], sys.argv[2]
    check_references(oracle)
    rng = random.Random(SEED)
    log_lines = cases(oracle, "log", log_inputs(rng), near_midpoint_inputs("log", SEED + 1))
    exp_lines = cases(oracle, "exp", exp_inputs(rng), near_midpoint_inputs("exp", SEED + 2))
    text = "\n".join(
        [
            "// Generated by libs/sim-engine/measurements/math/make_cases.py; do not edit.",
            "import type { FdlibmCase, FdlibmCases } from './fdlibm-case.js';",
            "",
            "// Each case goes through a typed call: thousands of object literals with a",
            "// boolean field make TypeScript build a union too complex to represent.",
            "function toCase(",
            "  input: string,",
            "  fdlibm: string,",
            "  correctlyRounded: string,",
            "  nearMidpoint: boolean,",
            "): FdlibmCase {",
            "  return { input, fdlibm, correctlyRounded, nearMidpoint };",
            "}",
            "",
            "/** Reference cases of log and exp: fdlibm 5.3 and the correctly rounded results. */",
            "export const fdlibmCases: FdlibmCases = {",
            "  log: [",
            *log_lines,
            "  ],",
            "  exp: [",
            *exp_lines,
            "  ],",
            "};",
            "",
        ]
    )

    with open(output_path, "w", encoding="ascii") as output:
        output.write(text)


if __name__ == "__main__":
    main()
