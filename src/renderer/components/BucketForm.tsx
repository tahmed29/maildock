import { useState } from "react";
type BucketFormProps = {
    onCreate: (name: string) => void;
    existingNames: string[];
};

export default function BucketsForm({ 
    onCreate, 
    existingNames 
}: BucketFormProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    return (
        <form 
            className="mt-6 max-w-md"
                onSubmit={(event) => {
                    event.preventDefault();
                    
                    const trimmedName = name.trim();
                    if (!trimmedName) return;

                    const duplicate = existingNames.some(
                        (existing) => existing.trim().toLowerCase() === trimmedName.toLowerCase()
                    );

                    if (duplicate) {
                        setError("A bucket with that name already exists.");
                        return;
                    }
                    
                    onCreate(trimmedName);
                    setName("");
                    setError("");
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
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "bucket-name-error" : undefined}
                onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                }}
                maxLength={60}
                placeholder="e.g. Work or Receipts"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />

            {error && (
                <p id="bucket-name-error" role="alert" className="text-sm text-red-400">
                    {error}
                </p>
            )}

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