export default function BucketsView() {
  return (
    <section aria-labelledby="buckets-heading">
      <h1 id="buckets-heading">Smart Buckets</h1>
      <p>Create custom buckets to organize your mail with routing rules.</p>

      <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-8">
        <h2 className="text-lg font-semibold text-slate-100">
          No buckets yet
        </h2>
        <p className="mt-2">
          A bucket groups messages that match rules you choose.
        </p>
      </div>
    </section>
  );
}