import { useEffect, useState } from "react";

const STORAGE_KEY = "upwork-filters";

const defaultFilters = {
    query: "leaflet",
    sort: "recency",
    contractorTier: [],
    paymentVerified: false,
    jobType: [],
    duration: [],
    workload: [],
    minHourlyRate: "",
    minBudget: "",
    clientLocation: "",
    proposals: "",
    searchMode: "fulltext",
};

function loadFilters() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultFilters;
    } catch {
        return defaultFilters;
    }
}

function toggleArrayValue(array, value) {
    return array.includes(value)
        ? array.filter((item) => item !== value)
        : [...array, value];
}

export default function UpworkJobs() {
    const [filters, setFilters] = useState(loadFilters);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);

    function updateFilter(key, value) {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function searchJobs() {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3001/api/upwork/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(filters),
            });

            const data = await res.json();

            if (!Array.isArray(data)) {
                setError(data.error || "Invalid response");
                setJobs([]);
                return;
            }

            setJobs(data);
        } catch (err) {
            setError(err.message);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }

    function applyPreset(query) {
        setFilters((prev) => ({
            ...prev,
            query,
            sort: "recency",
            paymentVerified: true,
            contractorTier: ["2", "3"],
            searchMode: "fulltext",
        }));
    }

    return (
        <div className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-900">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-semibold tracking-tight">
                        Upwork Job Finder
                    </h1>
                    <p className="mt-2 text-zinc-500">
                        Search for vacancies with filters and saving settings.
                    </p>
                </div>

                <div className="rounded-md border border-white/70 bg-white/80 p-6 shadow-xl shadow-zinc-200/70 backdrop-blur">
                    <div className="mb-6 flex flex-wrap gap-2">
                        {["leaflet", "react leaflet", "gis", "geojson", "mapbox", "arcgis"].map(
                            (preset) => (
                                <button
                                    key={preset}
                                    onClick={() => applyPreset(preset)}
                                    className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
                                >
                                    {preset}
                                </button>
                            )
                        )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Search query
                            </label>
                            <input
                                value={filters.query}
                                onChange={(e) => updateFilter("query", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="leaflet, react leaflet, gis..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Sort
                            </label>
                            <select
                                value={filters.sort}
                                onChange={(e) => updateFilter("sort", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="recency">Newest</option>
                                <option value="relevance">Relevance</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Experience level
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["1", "Entry"],
                                    ["2", "Intermediate"],
                                    ["3", "Expert"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() =>
                                            updateFilter(
                                                "contractorTier",
                                                toggleArrayValue(filters.contractorTier, value)
                                            )
                                        }
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${filters.contractorTier.includes(value)
                                            ? "bg-black text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Job type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["hourly", "Hourly"],
                                    ["fixed", "Fixed price"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() =>
                                            updateFilter(
                                                "jobType",
                                                toggleArrayValue(filters.jobType, value)
                                            )
                                        }
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${filters.jobType.includes(value)
                                            ? "bg-black text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Duration
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["month", "Less than 1 month"],
                                    ["quarter", "1-3 months"],
                                    ["semester", "3+ months"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() =>
                                            updateFilter(
                                                "duration",
                                                toggleArrayValue(filters.duration, value)
                                            )
                                        }
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${filters.duration.includes(value)
                                            ? "bg-black text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Workload
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["as_needed", "As needed"],
                                    ["part_time", "Part time"],
                                    ["full_time", "Full time"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() =>
                                            updateFilter(
                                                "workload",
                                                toggleArrayValue(filters.workload, value)
                                            )
                                        }
                                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${filters.workload.includes(value)
                                            ? "bg-black text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Min hourly rate
                            </label>
                            <input
                                type="number"
                                value={filters.minHourlyRate}
                                onChange={(e) => updateFilter("minHourlyRate", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Min fixed budget
                            </label>
                            <input
                                type="number"
                                value={filters.minBudget}
                                onChange={(e) => updateFilter("minBudget", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Client location
                            </label>
                            <input
                                value={filters.clientLocation}
                                onChange={(e) => updateFilter("clientLocation", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="United States"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-600">
                                Search mode
                            </label>
                            <select
                                value={filters.searchMode}
                                onChange={(e) => updateFilter("searchMode", e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="fulltext">Full text in job card</option>
                                <option value="title">Title only</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={filters.paymentVerified}
                                onChange={(e) =>
                                    updateFilter("paymentVerified", e.target.checked)
                                }
                                className="h-5 w-5 rounded border-zinc-300"
                            />
                            <span className="text-sm font-medium text-zinc-700">
                                Payment verified only
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={searchJobs}
                            disabled={loading}
                            className="rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {loading ? "Searching..." : "Search jobs"}
                        </button>

                        <button
                            onClick={() => {
                                setFilters(defaultFilters);
                                setJobs([]);
                            }}
                            className="rounded-md bg-zinc-100 px-6 py-3 font-medium text-zinc-700 transition hover:bg-zinc-200"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-4">
                    {jobs.map((job) => (
                        <article
                            key={job.id}
                            className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <h2 className="text-xl font-semibold tracking-tight">
                                {job.title}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-zinc-600">
                                {job.preview}
                            </p>

                            <a
                                href={job.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                            >
                                Open job
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}