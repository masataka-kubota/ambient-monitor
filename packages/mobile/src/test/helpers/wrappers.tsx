import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';

/** Atom/value pair passed to `useHydrateAtoms` in tests. */
export type HydratedAtom = readonly [object, unknown];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: HydratedAtom[];
  children: ReactNode;
}) => {
  useHydrateAtoms(initialValues as unknown as Parameters<typeof useHydrateAtoms>[0]);
  return children;
};

export type CreateTestWrapperOptions = {
  atoms?: HydratedAtom[];
  queryClient?: QueryClient;
};

/**
 * Creates a test wrapper with TanStack Query and Jotai providers.
 * Pass `atoms` to hydrate initial Jotai state; `queryClient` overrides the default test client.
 */
export const createTestWrapper = ({
  atoms = [],
  queryClient = createTestQueryClient(),
}: CreateTestWrapperOptions = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms initialValues={atoms}>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  );

  return Wrapper;
};
