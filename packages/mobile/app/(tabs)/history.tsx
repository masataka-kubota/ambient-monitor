import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { MeasurementView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const History = () => {
  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>History</Heading>
      <MeasurementView />
    </KeyboardAvoidingScrollableView>
  );
};

export default History;
