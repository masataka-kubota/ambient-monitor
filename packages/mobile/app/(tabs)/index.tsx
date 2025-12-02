import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { LiveMeasurementView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const Index = () => {
  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>Latest Measurement</Heading>
      <LiveMeasurementView />
    </KeyboardAvoidingScrollableView>
  );
};

export default Index;
