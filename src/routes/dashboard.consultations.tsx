import { createFileRoute } from "@tanstack/react-router";
import ConsultationsHub from "@/components/ConsultationsHub";

export const Route = createFileRoute("/dashboard/consultations")({
  component: () => <ConsultationsHub mode="non_vet" />,
});
