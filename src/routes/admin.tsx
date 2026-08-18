import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/site/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ammelne Trail" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});
