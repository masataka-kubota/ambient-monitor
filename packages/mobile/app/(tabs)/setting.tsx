import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { ThemeSetting } from "@/components/settings";
import { Heading } from "@/components/ui";

const Setting = () => {
  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>Theme Setting</Heading>
      <ThemeSetting />
    </KeyboardAvoidingScrollableView>
  );
};

export default Setting;
