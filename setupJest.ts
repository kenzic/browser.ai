const ollamaClient = {
  Ollama: jest.fn().mockImplementation(() => {
    return {
      chat: jest.fn().mockReturnValue({
        model: 'llama3.2',
        created_at: new Date('2024-10-08T19:50:39.718631Z'),
        message: {
          role: 'assistant',
          content:
            "The sky appears blue to our eyes due to a phenomenon called Rayleigh scattering, named after the British physicist Lord Rayleigh, who first explained it in the late 19th century.\n\nHere's what happens:\n\n1. **Sunlight enters Earth's atmosphere**: When sunlight enters our atmosphere, it consists of a spectrum of colors, including all the colors of the visible light spectrum.\n2. **Light interacts with nitrogen and oxygen molecules**: As sunlight travels through the atmosphere, it encounters tiny molecules of nitrogen (N2) and oxygen (O2). These molecules scatter the light in all directions.\n3. **Shorter wavelengths are scattered more**: The shorter (blue) wavelengths of light are scattered more than the longer (red) wavelengths by the smaller nitrogen and oxygen molecules. This is because the smaller molecules have a larger cross-sectional area, which allows them to scatter the shorter wavelengths more efficiently.\n4. **Blue light is dispersed in all directions**: As a result of this scattering, the blue light is dispersed in all directions and reaches our eyes from every part of the sky.\n5. **Our eyes perceive the scattered blue light as the dominant color**: Because of the way that the light is scattered, our eyes perceive the blue light as the dominant color, making the sky appear blue to us.\n\nIt's worth noting that during sunrise and sunset, the sky can take on a range of colors, including pink, orange, and red. This is because the sunlight has to travel through more of the Earth's atmosphere to reach our eyes, which scatters the shorter wavelengths even further, leaving mainly longer wavelengths (like red and orange) to be visible.\n\nSo, in short, the sky appears blue because of the way that sunlight interacts with the tiny molecules of nitrogen and oxygen in our atmosphere, scattering the shorter wavelengths more than the longer ones.",
        },
        done_reason: 'stop',
        done: true,
        total_duration: 39007631218,
        load_duration: 34515208,
        prompt_eval_count: 31,
        prompt_eval_duration: 117012000,
        eval_count: 370,
        eval_duration: 38854044000,
      }),
      ps: jest.fn().mockReturnValue({
        models: [
          {
            name: 'mistral:latest',
            model: 'mistral:latest',
            size: 5137025024,
            digest:
              '2ae6f6dd7a3dd734790bbbf58b8909a606e0e7e97e94b7604e0aa7ae4490e6d8',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'llama',
              families: ['llama'],
              parameter_size: '7.2B',
              quantization_level: 'Q4_0',
            },
            expires_at: '2024-06-04T14:38:31.83753-07:00',
            size_vram: 5137025024,
          },
        ],
      }),
      pull: jest.fn().mockReturnValue({ status: 'success' }),
      list: jest.fn().mockReturnValue({
        models: [
          {
            name: 'gemma2:latest',
            model: 'gemma2:latest',
            modified_at: '2024-09-29T18:48:29.085228211-04:00',
            size: 5443152417,
            digest: '123',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'gemma2',
              families: ['gemma2'],
              parameter_size: '9.2B',
              quantization_level: 'Q4_0',
            },
          },
          {
            name: 'llama3.1:latest',
            model: 'llama3.1:latest',
            modified_at: '2024-09-29T18:48:27.795520534-04:00',
            size: 4661230766,
            digest:
              '42182419e9508c30c4b1fe55015f06b65f4ca4b9e28a744be55008d21998a093',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'llama',
              families: ['llama'],
              parameter_size: '8.0B',
              quantization_level: 'Q4_0',
            },
          },
          {
            name: 'llama3.2:latest',
            model: 'llama3.2:latest',
            modified_at: '2024-09-29T18:48:26.599147061-04:00',
            size: 2019393189,
            digest: '234',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'llama',
              families: ['llama'],
              parameter_size: '3.2B',
              quantization_level: 'Q4_K_M',
            },
          },
          {
            name: 'qwen2.5:latest',
            model: 'qwen2.5:latest',
            modified_at: '2024-09-28T16:42:21.537757929-04:00',
            size: 4683087332,
            digest: '456',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'qwen2',
              families: ['qwen2'],
              parameter_size: '7.6B',
              quantization_level: 'Q4_K_M',
            },
          },
          {
            name: 'llava:latest',
            model: 'llava:latest',
            modified_at: '2024-09-13T21:38:28.050957108-04:00',
            size: 4733363377,
            digest:
              '8dd30f6b0cb19f555f2c7a7ebda861449ea2cc76bf1f44e262931f45fc81d081',
            details: {
              parent_model: '',
              format: 'gguf',
              family: 'llama',
              families: ['llama', 'clip'],
              parameter_size: '7B',
              quantization_level: 'Q4_0',
            },
          },
        ],
      }),
      show: jest.fn().mockReturnValue({
        license: 'Model license text',
        modelfile: 'blah blah blah',
        parameters: 'blah blah blah',
        template: 'blah blah blah',
        details: {
          parent_model: '',
          format: 'gguf',
          family: 'llama',
          families: ['llama'],
          parameter_size: '3.2B',
          quantization_level: 'Q4_K_M',
        },
        model_info: {
          'general.architecture': 'llama',
          'general.basename': 'Llama-3.2',
          'general.file_type': 15,
          'general.finetune': 'Instruct',
          'general.languages': ['en', 'de', 'fr', 'it', 'pt', 'hi', 'es', 'th'],
          'general.parameter_count': 3212749888,
          'general.quantization_version': 2,
          'general.size_label': '3B',
          'general.tags': [
            'facebook',
            'meta',
            'pytorch',
            'llama',
            'llama-3',
            'text-generation',
          ],
          'general.type': 'model',
          'llama.attention.head_count': 24,
          'llama.attention.head_count_kv': 8,
          'llama.attention.key_length': 128,
          'llama.attention.layer_norm_rms_epsilon': 0.00001,
          'llama.attention.value_length': 128,
          'llama.block_count': 28,
          'llama.context_length': 131072,
          'llama.embedding_length': 3072,
          'llama.feed_forward_length': 8192,
          'llama.rope.dimension_count': 128,
          'llama.rope.freq_base': 500000,
          'llama.vocab_size': 128256,
          'tokenizer.ggml.bos_token_id': 128000,
          'tokenizer.ggml.eos_token_id': 128009,
          'tokenizer.ggml.merges': null,
          'tokenizer.ggml.model': 'gpt2',
          'tokenizer.ggml.pre': 'llama-bpe',
          'tokenizer.ggml.token_type': null,
          'tokenizer.ggml.tokens': null,
        },
        modified_at: '2024-09-29T18:48:26.599147061-04:00',
      }),
    };
  }),
};

jest.mock('ollama', () => ollamaClient);

jest.mock('./src/lib/config');
jest.mock('./src/lib/store', () => ({
  getStore: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue([
      {
        name: 'test-model',
        installed: true,
      },
      {
        name: 'gemma2',
        installed: true,
      },
    ]),
    set: jest.fn(),
  }),
}));

jest.mock('electron-store');

// eslint-disable-next-line no-underscore-dangle
(global as any).__mocks__ = {
  ollamaClient,
};
