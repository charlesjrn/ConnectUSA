import CategoryPage from "@/pages/CategoryPage";
import InnerCircleGate from "@/components/InnerCircleGate";

export default function Visions() {
  return (
    <InnerCircleGate featureName="Visions and prophetic dreams">
      <CategoryPage
        category="vision"
        title="Visions"
        description="Share visions and prophetic dreams from the Lord."
      />
    </InnerCircleGate>
  );
}
