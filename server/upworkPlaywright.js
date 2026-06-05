import { chromium } from "playwright";

function buildUpworkUrl(filters) {
    const params = new URLSearchParams();

    params.set("nbs", "1");
    params.set("q", filters.query || "leaflet");
    params.set("sort", filters.sort || "recency");

    if (filters.contractorTier?.length) {
        params.set("contractor_tier", filters.contractorTier.join(","));
    }

    if (filters.paymentVerified) {
        params.set("payment_verified", "1");
    }

    if (filters.jobType?.length) {
        params.set("job_type", filters.jobType.join(","));
    }

    if (filters.duration?.length) {
        params.set("duration_v3", filters.duration.join(","));
    }

    if (filters.workload?.length) {
        params.set("workload", filters.workload.join(","));
    }

    if (filters.minHourlyRate) {
        params.set("hourly_rate", `${filters.minHourlyRate}-`);
    }

    if (filters.minBudget) {
        params.set("amount", `${filters.minBudget}-`);
    }

    if (filters.clientLocation) {
        params.set("client_location", filters.clientLocation);
    }

    if (filters.proposals) {
        params.set("proposals", filters.proposals);
    }

    return `https://www.upwork.com/nx/search/jobs/?${params.toString()}`;
}

export async function getUpworkJobs(filters = {}) {
    const context = await chromium.launchPersistentContext(
        "./chrome-upwork-profile",
        {
            channel: "chrome",
            headless: false,
            args: ["--disable-blink-features=AutomationControlled"],
        }
    );

    try {
        let page = context.pages()[0];
        if (!page) {
            page = await context.newPage();
        }

        await page.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
        });

        const url = buildUpworkUrl(filters);

        console.log("OPEN:", url);

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 90000,
        });

        // await page.waitForTimeout(10000);

        await page.waitForSelector("article[data-ev-job-uid]", {
            timeout: 100000,
        });

        const query = filters.query || "";
        const searchMode = filters.searchMode || "fulltext";

        const jobs = await page.evaluate(
            ({ query, searchMode }) => {
                const q = query.toLowerCase();

                const cards = Array.from(
                    document.querySelectorAll("article[data-ev-job-uid]")
                );

                return cards
                    .map((card) => {
                        const text = card.innerText || "";
                        const textLower = text.toLowerCase();

                        const titleLink =
                            card.querySelector('a[data-test="job-tile-title-link"]') ||
                            card.querySelector('a[href*="/jobs/"]');

                        const title = titleLink?.innerText?.trim();
                        const href = titleLink?.href;
                        const id = card.getAttribute("data-ev-job-uid");

                        return {
                            id,
                            title,
                            url: href,
                            preview: text.slice(0, 350),
                            _matchText:
                                searchMode === "title"
                                    ? (title || "").toLowerCase()
                                    : textLower,
                        };
                    })
                    .filter((job) => job.title && job.url)
                    .filter((job) => !q || job._matchText.includes(q))
                    .map(({ _matchText, ...job }) => job);
            },
            { query, searchMode }
        );

        console.log("DOM JOBS:", jobs.length);

        return jobs;
    } finally {
        await context.close();
    }
}

export async function getUpworkJobs1(query = "leaflet") {
    const context = await chromium.launchPersistentContext(
        "./chrome-upwork-profile",
        {
            channel: "chrome",
            headless: false,
            args: ["--disable-blink-features=AutomationControlled"],
        }
    );

    try {
        let page = context.pages()[0];
        if (!page) {
            page = await context.newPage();
        }

        await page.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
        });

        const url = `https://www.upwork.com/nx/search/jobs/?per_page=50&q=${encodeURIComponent(query)}&sort=recency`;

        console.log("OPEN:", url);

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 90000,
        });

        // await page.waitForTimeout(10000);

        await page.waitForSelector("article[data-ev-job-uid]", {
            timeout: 100000,
        });

        console.log("FINAL URL:", page.url());
        console.log("TITLE:", await page.title());

        const jobs = await page.evaluate((query) => {
            const q = query.toLowerCase();

            const cards = Array.from(
                document.querySelectorAll("article[data-ev-job-uid]")
            );

            return cards
                .map((card) => {
                    const text = card.innerText || "";
                    const textLower = text.toLowerCase();

                    const titleLink =
                        card.querySelector('a[data-test="job-tile-title-link"]') ||
                        card.querySelector('a[href*="/jobs/"]');

                    const title = titleLink?.innerText?.trim();
                    const href = titleLink?.href;

                    const jobUid = card.getAttribute("data-ev-job-uid");

                    return {
                        id: jobUid,
                        title,
                        url: href,
                        preview: text.slice(0, 300),
                        _fullText: textLower,
                    };
                })
                .filter((job) => job.title && job.url)
                .filter((job) => job._fullText.includes(q))
                .map(({ _fullText, ...job }) => job);
        }, query);

        console.log("DOM JOBS:", jobs.length);

        return jobs;
    } finally {
        await context.close();
    }
}