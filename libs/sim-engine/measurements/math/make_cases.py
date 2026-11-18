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
        "3ff0000000000000", "0000000000000001", "8000000000000001",
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

    spread = [
        words((rng.randrange(0x001, 0x7FF) << 20) | rng.getrandbits(20), rng.getrandbits(32))
        for _ in range(800)
    ]
    spread += [f"{rng.randrange(1, 1 << 52):016x}" for _ in range(100)]
    uniforms = [rng.random() for _ in range(250)]
    engine = [to_bits(u) for u in uniforms] + [to_bits(1 - u) for u in uniforms]

    return special + near_one + branches + spread + engine


def exp_inputs(rng):
    special = [
        "0000000000000000", "8000000000000000", "7ff0000000000000",
        "fff0000000000000", "7ff8000000000000", "3ff0000000000000",
        "bff0000000000000", "0000000000000001", "8000000000000001",
    ]
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
            signed = f"{int(sign, 16) << 60 | int(bits, 16):016x}"
            branches += with_neighbors(signed)

    k_limit = [-745.2 + step * (745.2 - 707.0) / 200 for step in range(201)]
    spread = [rng.uniform(-745.2, 709.8) for _ in range(1000)]
    engine = [-((37 * rng.random()) ** 2) / 2 for _ in range(500)]

    return special + branches + [to_bits(x) for x in k_limit + spread + engine]


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


def cases(oracle, function, inputs):
    unique = list(dict.fromkeys(inputs))
    outputs = fdlibm_outputs(oracle, function, unique)
    lines = []

    for bits, output in zip(unique, outputs):
        reference = correctly_rounded(function, bits)
        lines.append(
            f"    {{ input: '{bits}', fdlibm: '{output}', correctlyRounded: '{reference}' }},"
        )

    return lines


def main():
    oracle, output_path = sys.argv[1], sys.argv[2]
    rng = random.Random(SEED)
    log_lines = cases(oracle, "log", log_inputs(rng) + near_midpoint_inputs("log", SEED + 1))
    exp_lines = cases(oracle, "exp", exp_inputs(rng) + near_midpoint_inputs("exp", SEED + 2))
    text = "\n".join(
        [
            "// Generated by libs/sim-engine/measurements/math/make_cases.py; do not edit.",
            "import type { FdlibmCases } from './fdlibm-case.js';",
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

    if to_bits(LOG_OF_TWO) != correctly_rounded("log", to_bits(2.0)):
        raise SystemExit("decimal reference does not give log 2")


if __name__ == "__main__":
    main()
