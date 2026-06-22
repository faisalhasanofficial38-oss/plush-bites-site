import { createFileRoute, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPublicSnapshot } from "@/lib/restaurant.functions";
import { SiteNav, SiteFooter, WhatsAppFab } from "@/components/site-ui";

export const snapshotQuery = queryOptions({
  queryKey: ["public-snapshot"],
  queryFn: () => getPublicSnapshot(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/_site")({
  loader: ({ context }) => context.queryClient.ensureQueryData(snapshotQuery),
  component: SiteLayout,
});

function SiteLayout() {
  const { data } = useSuspenseQuery(snapshotQuery);
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <SiteNav settings={data.settings} />
      <main>
        <Outlet />
      </main>
      <SiteFooter settings={data.settings} socials={data.socials} />
      <WhatsAppFab settings={data.settings} />
    </div>
  );
}