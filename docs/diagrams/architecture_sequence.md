## Key Decisions & Assumptions

-  **Architecture:** Centralized model using the MV3 Service Worker as the hub.
-  **Communication:** Content Scripts use `chrome.runtime.connect` for persistent communication channels (ports).
-  **Data Flow:** WebSocket -> Service Worker (Processing) -> Subscribed Content Scripts.
-  **Lifecycle Assumption:** Relies on keeping the Service Worker alive via active ports/heartbeats. The robustness of this mechanism is critical.
-  **Goal:** Avoid redundant connections/processing across multiple tabs viewing the same feed.
