import { z } from 'zod';
import { plantSchema } from './structure/plant.js';

describe('published JSON Schema', () => {
  it('the generated JSON Schema matches the published file', async () => {
    const jsonSchema = z.toJSONSchema(plantSchema);

    await expect(
      `${JSON.stringify(jsonSchema, null, 2)}\n`,
    ).toMatchFileSnapshot('../plant.schema.v1.json');
  });
});
