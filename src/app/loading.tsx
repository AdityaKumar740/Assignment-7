export default function HomeLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="পণ্যের তথ্য লোড হচ্ছে"
      className="mx-auto w-[min(100%,1080px)] px-5 pb-12 pt-5 sm:px-6"
    >
      <div className="skeleton-block mb-5 min-h-[220px] rounded-[19px] sm:min-h-[350px] sm:rounded-[28px]" />
      <div className="mb-8 rounded-2xl bg-[#f4faf5] p-4 sm:p-5">
        <span className="skeleton-block mb-3 h-6 w-40 rounded" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              aria-hidden="true"
              className="skeleton-block min-h-[108px] rounded-xl"
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="skeleton-block h-6 w-24 rounded" />
        <span className="skeleton-block h-4 w-48 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 max-[400px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            aria-hidden="true"
            className="skeleton-block min-h-[108px] rounded-xl"
            key={index}
          />
        ))}
      </div>
    </main>
  );
}
