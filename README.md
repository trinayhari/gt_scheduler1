# BuzzPlan

Independent Georgia Tech schedule-planning prototype. Built as a static, responsive site: no install, framework or backend required.

## Run locally
Serve `dist/` with any static HTTP server, for example `python3 -m http.server 8080 --directory dist`. Then open http://localhost:8080.

## Features
- Fictional demo sections are explicit and separate from real timetable snapshots.
- Course selection, section swaps, weekly calendar, conflict and travel-buffer detection.
- Ranked schedule alternatives honoring earliest/latest times and a free weekday.
- Manual completed-course-code checklist import, with explicit review.
- Local saved schedules and time-zone-aware .ics export.
- Optional browser fetch of Spring 2027 GT Scheduler's public CORS-enabled v3 feed.

## Data boundaries
Default data is illustrative, not official or registration-ready. Optional feed: `https://gt-scheduler.github.io/crawler-v2/202702.json`. It is periodically refreshed, not live seats. Only Atlanta, fully timed weekday, fixed positive-credit sections are supported. Courses with separate zero-credit components are omitted conservatively because required associations are not reliably inferred. All prerequisites, restrictions, co-requisites, associated components, campus, date ranges, holidays and enrollment availability require official verification. Course Critique is linked for user research; historical grades/ratings are not automatically ingested. DegreeWorks is not authenticated or scraped; PDF parsing and official degree-audit logic are not implemented.

The scheduler searches at most 50,000 nodes; results are ranked heuristic matches, not guaranteed globally optimal schedules. Calendars use America/New_York; user-entered range applies to all events, with no holiday/exam exclusions.

## Files
- `dist/index.html`: application shell
- `dist/styles.css`: responsive styling
- `dist/app.js`: UI, local persistence, dialogs
- `dist/planner.js`: data adapters, scheduler, conflict analysis, parser and calendar export

User data lives in browser localStorage (`buzzplan-v1`). No academic records are sent to a backend. Fonts may be fetched from Google Fonts; the optional timetable is fetched only on request. Clearing browser storage removes local plans.

To transfer to a future repository, copy `dist/` and this README. `.openai/hosting.json` is specific to the existing private Sites deployment and should not be copied into an unrelated new Site.
