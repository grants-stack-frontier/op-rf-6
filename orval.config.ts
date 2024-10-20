import { defineConfig } from 'orval';

export default defineConfig({
  'op-agora': {
    input: 'https://vote.optimism.io/api/v1/spec',
    output: {
      mode: 'split',
      target: './src/__generated__/api/agora.ts',
      client: 'react-query',
      baseUrl: '/api/agora/',
      mock: true,
      override: {
        mutator: {
          path: './src/lib/customFetch.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useInfinite: true,
        },
        operations: {
          '*': {
            requestOptions: {
              onError: `
                (error: unknown, toast: (options: { variant: string; title: string; description?: string }) => void, fallbackMessage: string) => {
                  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
                  toast({ 
                    variant: 'destructive', 
                    title: 'Error', 
                    description: errorMessage 
                  });
                  return Promise.reject(error);
                }
              `,
            },
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
