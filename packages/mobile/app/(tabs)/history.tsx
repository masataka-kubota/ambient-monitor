import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HistoryMeasurementView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const History = () => {
  return (
    <KeyboardAvoidingScrollableView>
      <Heading iconName="line-graph" align="center">
        History
      </Heading>
      <HistoryMeasurementView />
    </KeyboardAvoidingScrollableView>
  );
};

export default History;
