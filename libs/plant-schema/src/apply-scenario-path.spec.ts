import { applyScenario } from '@takt/plant-schema/apply-scenario';

describe('apply-scenario path', () => {
  it('exports applyScenario', () => {
    const exported = typeof applyScenario;

    expect(exported).toBe('function');
  });
});
