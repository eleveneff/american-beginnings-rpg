Headless Chromium smoke test (puppeteer-core). It plays Section 1 with 2 misses, then checks review, gear, badge, unlock, the parent report, persistence after reload, the under-80% retake path in Section 2, and the Grand Trial.

    python3 -m http.server 8765 &          # from the repo root
    npm i puppeteer-core@22
    BASE=http://localhost:8765/ SHOTS=/tmp/ node tests/smoke-test.js
