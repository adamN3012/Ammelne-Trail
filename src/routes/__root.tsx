import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { ToastContainer } from "@/components/ui/toast-notify";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ammelne Trail — Marathon de Tafraout" },
      { name: "description", content: "Ammelne Trail — Le marathon annuel au cœur des montagnes de Tafraout, Anti-Atlas, Maroc. Organisé par l'A.S.V.L.A." },
      { name: "author", content: "A.S.V.L.A" },
      { property: "og:title", content: "Ammelne Trail — Marathon de Tafraout" },
      { property: "og:description", content: "Vivez une expérience sportive unique entre nature, culture et aventure dans la vallée de lumières Ammelne." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicFavicon />
      <Outlet />
      <ToastContainer />
    </QueryClientProvider>
  );
}

// Met à jour le favicon avec le logo stocké dans les settings
function DynamicFavicon() {
  useEffect(() => {
    const API = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ?? "";
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        const url = data?.logo_url;
        if (!url) return;
        // Supprimer les anciens favicons
        document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
        const link = document.createElement("link");
        link.rel  = "icon";
        link.type = url.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
        link.href = url;
        document.head.appendChild(link);
      })
      .catch(() => {});
  }, []);
  return null;
}
