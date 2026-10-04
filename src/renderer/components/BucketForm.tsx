import { useState } from "react";
type BucketFormProps = {
    onCreate: (name: string) => void;
};

export default function BucketsForm({ onCreate }: BucketFormProps) {
    const [name, setName] = useState("");

    return (
        <form 
            className="mt-6 max-w-md"
                onSubmit={(event) => {
                    event.preventDefault();
                    
                    const trimmedName = name.trim();
                    if (!trimmedName) return;

                    onCreate(trimmedName);
                    setName("");
                }}
            >
            <label
                htmlFor="bucket-name"
                className="mb-2 block text-sm font-medium text-slate-200"
            >
                Bucket Name
            </label>

            <input
                id="bucket-name"
                name="bucket-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                placeholder="e.g. Work or Receipts"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />

            <button
                type="submit"
                disabled={!name.trim()}
                className="mt-3 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Create Bucket
            </button>
        </form>
    );
}