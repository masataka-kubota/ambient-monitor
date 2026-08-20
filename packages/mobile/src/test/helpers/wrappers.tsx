import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, type WritableAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';

/** Atom and initial value passed to `useHydrateAtoms` in tests. */
// oxlint-disable-next-line typescript/no-explicit-any -- WritableAtom write args are contravariant
export type HydrateAtomPair = readonly [WritableAtom<any, any[], any>, unknown];

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
  initialValues: HydrateAtomPair[];
  children: ReactNode;
}) => {
  useHydrateAtoms(initialValues);
  return children;
};

export type CreateTestWrapperOptions = {
  atoms?: HydrateAtomPair[];
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
