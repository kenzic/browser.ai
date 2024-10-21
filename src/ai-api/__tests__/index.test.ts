import { handleAPI } from '../index';

describe('handleAPI api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be able to request permissions', async () => {
    const result1 = await handleAPI.permissions.request({
      model: 'gemma2',
    });
    const result2 = await handleAPI.permissions.request({
      model: 'unavailable-model',
    });
    expect(result1).toEqual(true);
    expect(result2).toEqual(false);
  });

  test('should be able to list avilable models', async () => {
    const result = await handleAPI.permissions.models();
    expect(result).toEqual([{ enabled: true, model: 'gemma2' }]);
  });

  test('should be able to return empty list if no models avilable', async () => {
    jest.resetModules();

    // Mock the module for this specific test
    jest.doMock('../../lib/store', () => ({
      getStore: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      }),
    }));

    // Re-import the module that uses the store
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { handleAPI } = await import('../index');

    const result = await handleAPI.permissions.models();
    expect(result).toEqual([]);
  });

  test('should be able to get model info', async () => {
    jest.resetModules();

    const result = await handleAPI.model.info({ model: 'llama3.1' });
    expect(result).toEqual({
      details: {
        families: ['llama'],
        family: 'llama',
        format: 'gguf',
        parameter_size: '3.2B',
        parent_model: '',
        quantization_level: 'Q4_K_M',
      },
      license: 'Model license text',
      model: 'llama3.1',
    });
  });

  test('should connect to model', async () => {
    jest.resetModules();

    // Re-import the module that uses the store
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { handleAPI } = await import('../index');

    const result = await handleAPI.model.connect({ model: 'llama3.1' });
    expect(result).toEqual({ active: true, model: 'llama3.1' });
  });
});
