export default function CategoryLoading() {
  return (
    <main aria-busy="true" aria-label="বিভাগের পণ্য লোড হচ্ছে" className="mx-auto w-[min(100%-32px,1080px)] pb-12 pt-5 sm:pt-7">
      <div className="mb-4 flex min-h-[100px] items-center gap-3 rounded-2xl border border-[#e5ebe6] bg-[#f4f8f4] p-4">
        <span className="skeleton-block h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2">
          <span className="skeleton-block h-5 w-[120px] rounded" />
          <span className="skeleton-block h-3 w-[190px] rounded" />
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-[#e5ebe6] bg-white px-4 py-2">
        <span className="skeleton-block h-8 w-[88px] rounded-lg" />
      </div>
      <p className="my-3 text-[11px] text-[#6b776e]" role="status">
        পণ্য লোড হচ্ছে…
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="flex min-h-[92px] flex-col justify-between gap-3 rounded-xl border border-[#e5ebe6] bg-white p-3.5" key={index}>
            <div className="flex items-center gap-2.5">
              <span className="skeleton-block h-[38px] w-[38px] rounded-lg" />
              <span className="skeleton-block h-3 w-[100px] rounded" />
            </div>
            <span className="skeleton-block h-3 w-[85px] rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
