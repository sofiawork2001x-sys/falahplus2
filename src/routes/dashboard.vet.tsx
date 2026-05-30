import { createFileRoute } from "@tanstack/react-router";
import ConsultationsHub from "@/components/ConsultationsHub";

export const Route = createFileRoute("/dashboard/vet")({
  component: () => <ConsultationsHub mode="vet" />,
});
