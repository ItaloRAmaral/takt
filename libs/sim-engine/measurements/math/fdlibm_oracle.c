/*
 * Prints what fdlibm 5.3 gives for each input, as the 64 bits of a double in
 * hexadecimal, one per line. It is the oracle for the engine's port of
 * __ieee754_log and __ieee754_exp; fdlibm itself is not in the repository.
 *
 * Build (see docs/architecture/sim-engine.md for where the sources come from):
 *   gcc -O0 -ffp-contract=off -fno-strict-aliasing -D__LITTLE_ENDIAN \
 *     -I <fdlibm> fdlibm_oracle.c <fdlibm>/e_log.c <fdlibm>/e_exp.c \
 *     -o fdlibm_oracle
 *
 * Usage: fdlibm_oracle log|exp < inputs, one 16-digit hexadecimal per line.
 */
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "fdlibm.h"

int main(int argc, char **argv) {
  double (*function)(double);
  char line[64];

  if (argc != 2) {
    return 2;
  }

  if (strcmp(argv[1], "log") == 0) {
    function = __ieee754_log;
  } else if (strcmp(argv[1], "exp") == 0) {
    function = __ieee754_exp;
  } else {
    return 2;
  }

  while (fgets(line, sizeof line, stdin) != NULL) {
    uint64_t bits;
    double input;
    double output;

    if (sscanf(line, "%" SCNx64, &bits) != 1) {
      return 3;
    }

    memcpy(&input, &bits, sizeof input);
    output = function(input);
    memcpy(&bits, &output, sizeof bits);
    printf("%016" PRIx64 "\n", bits);
  }

  return 0;
}
