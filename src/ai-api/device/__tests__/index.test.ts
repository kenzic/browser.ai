import {
  EmbedRequest as OllamaEmbedRequest,
  ChatRequest as OllamaChatRequest,
  Ollama,
} from 'ollama';
import { models } from '../index';
import { Session, connectSession } from '../session';
import { ChatOptions, EmbedOptions } from '../../types';

describe('connectSession', () => {
  test('should create a session and return active status', async () => {
    const sessionOptions = { model: 'test-model' };
    const result = await connectSession(sessionOptions);
    expect(result).toEqual({ active: true, model: 'test-model' });
  });

  test('should return inactive status if chat throws an error', async () => {
    const sessionOptions = { model: 'test-model' };
    const result = await connectSession(sessionOptions, {
      chat: jest.fn().mockRejectedValue(new Error('Chat error')),
    } as unknown as Ollama);
    expect(result).toEqual({ active: false, model: null });
  });
});

describe('session.chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call session.chat with minimal required options', async () => {
    // eslint-disable-next-line no-underscore-dangle
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Why is the sky blue' }],
    };

    const result = await session.chat(options);

    const ollama = new Ollama();

    const ollamaResponse = (await ollama.chat(
      Session.convertChatOptions(options),
    )) as any;

    expect(result).toEqual({
      ...Session.convertOllamaChatResponse(ollamaResponse),
      id: expect.any(String),
    });
  });

  test('should call session.chat with all provided options', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Why is the sky blue' }],
      options: {
        temperature: 0.5,
        stop: undefined,
        seed: undefined,
        repeat_penalty: 1.0,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        top_k: 50,
        top_p: 1.0,
      },
    };

    const result = await session.chat(options);

    const ollama = new Ollama();
    const ollamaResponse = await ollama.chat(
      Session.convertChatOptions(options),
    );

    expect(result).toEqual({
      ...Session.convertOllamaChatResponse(ollamaResponse),
      id: expect.any(String),
    });
  });

  test('should throw validation error if session.chat messages format is incorrect', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: 'Hello',
    } as unknown as ChatOptions;

    await expect(async () => {
      return session.chat(options);
    }).rejects.toThrow(/Validation errors:/);
  });

  test('should throw validation error if session.chat options contain invalid values', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Why is the sky blue' }],
      options: {
        temperature: 'HOT',
      },
    } as unknown as ChatOptions;

    await expect(async () => {
      return session.chat(options);
    }).rejects.toThrow(/Validation errors:/);
  });
});

describe('session.embed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call session.embed with minimal required options', async () => {
    // eslint-disable-next-line no-underscore-dangle
    const session = Session.create();

    const options: EmbedOptions = {
      model: 'test-model',
      input: 'Hello',
    };

    const result = await session.embed(options);

    const ollama = new Ollama();

    const ollamaResponse = (await ollama.embed(
      options as OllamaEmbedRequest,
    )) as any;

    expect(result).toEqual({
      ...Session.convertOllamaEmbedResponse(ollamaResponse),
      id: expect.any(String),
    });
  });

  test('should call session.chat with all provided options', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Why is the sky blue' }],
      options: {
        temperature: 0.5,
        stop: undefined,
        seed: undefined,
        repeat_penalty: 1.0,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        top_k: 50,
        top_p: 1.0,
      },
    };

    const result = await session.chat(options);

    const ollama = new Ollama();

    const ollamaResponse = (await ollama.chat(
      Session.convertChatOptions(options),
    )) as any;

    expect(result).toEqual({
      ...Session.convertOllamaChatResponse(ollamaResponse),
      id: expect.any(String),
    });
  });

  test('should throw validation error if session.chat messages format is incorrect', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: 'Hello',
    } as unknown as ChatOptions;

    await expect(async () => {
      return session.chat(options);
    }).rejects.toThrow(/Validation errors:/);
  });

  test('should throw validation error if session.chat options contain invalid values', async () => {
    const session = Session.create();

    const options: ChatOptions = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Why is the sky blue' }],
      options: {
        temperature: 'HOT',
      },
    } as unknown as ChatOptions;

    await expect(async () => {
      return session.chat(options);
    }).rejects.toThrow(/Validation errors:/);
  });
});

describe('models.isAvailable', () => {
  test('should return true if the model is available', async () => {
    const result = await models.isAvailable('test-model');
    expect(result).toBe(true);
  });
});
