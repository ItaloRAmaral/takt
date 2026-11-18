"""Compares what each environment computed in the D4 measurement.

Reads every <engine>-<platform>.json that measure-math wrote and prints Markdown:
- the environments and their versions;
- on the reference cases, how many results differ from fdlibm 5.3 and from the
  correctly rounded value, overall and on the near-midpoint cases;
- on every set, the groups of environments that gave identical bits and, for
  each pair of groups, how many values differ and the first index that does.

Stops if a measurement was made against other reference cases than the current
fixture, because the results would no longer line up with their inputs.

Usage: python3 -I compare.py <folder> [--require-identical PREFIX ...]

With --require-identical, exits with an error if a set whose name starts with
one of the prefixes differs between environments or is missing in one.
"""

import argparse
import json
import pathlib
import re
import string

FIXTURE = pathlib.Path(__file__).resolve().parents[2] / "src/tests/fixtures/fdlibm-cases.ts"
CANONICAL_NAN = "7ff8000000000000"
# RFC 9923, FNV-1a 64, the same hash as fixtureDigest in measure-math.ts
FNV_OFFSET_BASIS = 0xCBF29CE484222325
FNV_PRIME = 0x100000001B3
CASE = re.compile(r"toCase\('(\w+)', '(\w+)', '(\w+)', (true|false)\)")


def fnv1a64(text):
    value = FNV_OFFSET_BASIS

    for byte in text.encode("ascii"):
        value = ((value ^ byte) * FNV_PRIME) % (1 << 64)

    return f"{value:016x}"


def ordered(bits):
    value = int(bits, 16)

    return -(value ^ (1 << 63)) if value >> 63 else value


def ulp_distance(left, right):
    if CANONICAL_NAN in (left, right):
        return 0 if left == right else float("inf")

    return abs(ordered(left) - ordered(right))


def read_fixture():
    text = FIXTURE.read_text(encoding="ascii")
    fixture = {}

    for function in ("log", "exp"):
        part = text.split(f"  {function}: [")[1].split("  ],")[0]
        fixture[function] = [
            {"input": found[0], "fdlibm": found[1], "correct": found[2], "near": found[3] == "true"}
            for found in CASE.findall(part)
        ]

    digest = fnv1a64(
        ",".join(case["input"] for case in fixture["log"])
        + ";"
        + ",".join(case["input"] for case in fixture["exp"])
    )

    return fixture, digest


def read_measurements(folder, digest):
    measurements = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in sorted(pathlib.Path(folder).glob("*-*.json"))
    ]

    for measurement in measurements:
        if measurement["fixtureDigest"] != digest:
            raise SystemExit(
                f"{measurement['environment']} was measured against other reference cases "
                f"({measurement['fixtureDigest']}, current {digest}); measure it again"
            )

    return sorted(measurements, key=lambda measurement: measurement["environment"])


def differences(results, expected):
    return sum(1 for got, want in zip(results, expected, strict=True) if got != want)


def print_environments(measurements):
    print("| Ambiente | Versões |\n| --- | --- |")

    for measurement in measurements:
        print(f"| `{measurement['environment']}` | {measurement['details']} |")


def print_fixture(measurements, fixture, set_names):
    print(
        "\n| Conjunto | Ambiente | ≠ fdlibm | ≠ correto | ≠ correto (quase difíceis) | maior distância (ulps) |"
        "\n| --- | --- | --- | --- | --- | --- |"
    )

    for function, cases in fixture.items():
        fdlibm = [case["fdlibm"] for case in cases]
        correct = [case["correct"] for case in cases]
        near = [index for index, case in enumerate(cases) if case["near"]]

        for name in (name for name in set_names if name.endswith(f".{function}.cases")):
            for measurement in measurements:
                results = measurement["sets"].get(name)

                if results is None:
                    print(f"| `{name}` | `{measurement['environment']}` | ausente | | | |")
                    continue

                near_differences = sum(1 for index in near if results[index] != correct[index])
                largest = max(ulp_distance(got, want) for got, want in zip(results, correct, strict=True))
                print(
                    f"| `{name}` | `{measurement['environment']}` | {differences(results, fdlibm)} "
                    f"| {differences(results, correct)} | {near_differences} de {len(near)} | {largest} |"
                )


def group_environments(measurements, name):
    """Groups the environments that gave identical bits for a set, and lists
    those that lack it."""
    groups = {}
    missing = []

    for measurement in measurements:
        results = measurement["sets"].get(name)

        if results is None:
            missing.append(measurement["environment"])
            continue

        groups.setdefault("\n".join(results), (results, []))[1].append(measurement["environment"])

    return groups, missing


def check_identical(measurements, set_names, prefixes):
    """Names every set starting with one of the prefixes that is not identical
    in all environments; an empty list means the check passed."""
    failures = []

    for name in set_names:
        if not name.startswith(tuple(prefixes)):
            continue

        groups, missing = group_environments(measurements, name)

        if len(groups) > 1 or missing:
            failures.append(f"{name}: {len(groups)} groups, missing in {len(missing)}")

    return failures


def print_groups(measurements, set_names):
    print(
        "\n| Conjunto | Valores | Grupos de ambientes com bits iguais | Pares de grupos: valores diferentes (primeiro índice) |"
        "\n| --- | --- | --- | --- |"
    )

    for name in set_names:
        groups, missing = group_environments(measurements, name)

        if len(groups) > len(string.ascii_uppercase):
            raise SystemExit(f"{name}: {len(groups)} groups, more than there are labels")

        labeled = list(zip(string.ascii_uppercase, groups.values()))
        listed = [
            f"{label}: " + ", ".join(f"`{environment}`" for environment in environments)
            for label, (_, environments) in labeled
        ]

        if missing:
            listed.append("ausente em " + ", ".join(f"`{environment}`" for environment in missing))

        pairs = []

        for position, (left_label, (left, _)) in enumerate(labeled):
            for right_label, (right, _) in labeled[position + 1 :]:
                mismatches = [index for index, (a, b) in enumerate(zip(left, right, strict=True)) if a != b]
                pairs.append(f"{left_label}×{right_label}: {len(mismatches)} ({mismatches[0]})")

        values = len(labeled[0][1][0]) if labeled else 0
        print(f"| `{name}` | {values} | {'; '.join(listed)} | {'; '.join(pairs) or '—'} |")


def main():
    parser = argparse.ArgumentParser(description="Compares the D4 measurements.")
    parser.add_argument("folder", help="folder with the <engine>-<platform>.json files")
    parser.add_argument(
        "--require-identical",
        nargs="+",
        default=[],
        metavar="PREFIX",
        help="fail unless every set starting with a prefix is identical in all environments",
    )
    arguments = parser.parse_args()
    fixture, digest = read_fixture()
    measurements = read_measurements(arguments.folder, digest)

    if not measurements:
        raise SystemExit("no measurements found")

    set_names = sorted({name for measurement in measurements for name in measurement["sets"]})
    print_environments(measurements)
    print_fixture(measurements, fixture, set_names)
    print_groups(measurements, set_names)
    failures = check_identical(measurements, set_names, arguments.require_identical)

    if failures:
        raise SystemExit("not identical in every environment:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
