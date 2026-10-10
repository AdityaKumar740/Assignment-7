import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-[min(100%-32px,1080px)] flex-col items-center justify-center px-5 py-12 text-center">
      <span
        aria-hidden="true"
        className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e9f2ea] text-3xl"
      >
        🔎
      </span>
      <p className="mb-0 mt-5 text-sm font-bold text-[#078641]">404</p>
      <h1 className="mb-0 mt-2 text-2xl font-bold text-[#26332b]">
        পৃষ্ঠাটি পাওয়া যায়নি
      </h1>
      <p className="mb-5 mt-2 max-w-md text-sm leading-6 text-[#69756d]">
        আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে অথবা ঠিকানাটি সঠিক নয়।
      </p>
      <Link
        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#078641] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#066f36]"
        href="/"
      >
        হোম পেজে ফিরে যান
      </Link>
    </main>
  );
}
