import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Keep local development and builds without project credentials out of analytics.
if (process.env.NODE_ENV === "production" && projectToken && host) {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    person_profiles: "identified_only",
    disable_session_recording: true,
  });
}
