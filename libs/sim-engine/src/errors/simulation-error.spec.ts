import { catchError } from '../tests/helpers/catch-error.js';
import { SimulationError } from './simulation-error.js';

describe('SimulationError', () => {
  it('a simulation error carries its code', () => {
    const error = new SimulationError('INVALID_PLANT', 'plant cannot run');

    expect(error.code).toBe('INVALID_PLANT');
  });

  it('a simulation error is named SimulationError in logs and stack traces', () => {
    const error = new SimulationError('INVALID_PLANT', 'plant cannot run');

    expect(error.name).toBe('SimulationError');
  });

  it('toMatchObject checks the code of a simulation error', () => {
    const error = catchError(() => {
      throw new SimulationError('INVALID_PLANT', 'plant cannot run');
    });

    expect(error).toMatchObject({ code: 'INVALID_PLANT' });
  });

  it('toMatchObject fails on a different code', () => {
    const error = new SimulationError('INVALID_PLANT', 'plant cannot run');

    const failure = catchError(() => {
      expect(error).toMatchObject({ code: 'SIMULATION_LIMIT_EXCEEDED' });
    });

    expect(failure).toBeInstanceOf(Error);
  });

  it('rejects.toMatchObject checks the code of a rejected simulation error', async () => {
    const promise = Promise.reject(
      new SimulationError('SIMULATION_LIMIT_EXCEEDED', 'too many events'),
    );

    await expect(promise).rejects.toMatchObject({
      code: 'SIMULATION_LIMIT_EXCEEDED',
    });
  });
});
