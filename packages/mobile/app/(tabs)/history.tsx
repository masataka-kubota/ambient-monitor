import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HistoryMeasurementView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const History = () => {
  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>History</Heading>
      <HistoryMeasurementView />
    </KeyboardAvoidingScrollableView>
  );
};

export default History;
