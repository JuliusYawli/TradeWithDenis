export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-snow">
      <div className="container-page py-10">
        <div className="mb-8">
          <div className="h-10 w-72 max-w-full animate-pulse rounded-lg bg-line" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-line/70" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden rounded-xl border border-line bg-white p-3 shadow-sm lg:block">
            <div className="border-b border-line px-3 pb-4 pt-2">
              <div className="h-3 w-24 animate-pulse rounded bg-line" />
              <div className="mt-3 h-6 w-32 animate-pulse rounded bg-line/80" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-lg bg-snow" />
              ))}
            </div>
          </aside>

          <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="h-7 w-40 animate-pulse rounded bg-line" />
            <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-line/70" />
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-line bg-snow p-5">
                  <div className="h-5 w-5 animate-pulse rounded bg-line" />
                  <div className="mt-4 h-4 w-24 animate-pulse rounded bg-line/70" />
                  <div className="mt-2 h-8 w-14 animate-pulse rounded bg-line" />
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm font-medium text-neutral-500">Waking up admin workspace...</p>
          </section>
        </div>
      </div>
    </main>
  );
}
