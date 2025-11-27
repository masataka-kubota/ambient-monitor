import { Provider } from "jotai";

const AtomProviders = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

export default AtomProviders;
