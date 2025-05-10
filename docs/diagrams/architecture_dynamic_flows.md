# Dynamic Interaction Flows

This document provides an overview of key dynamic interaction flows within the NipahTV browser extension's Service Worker and its communication with Content Scripts. These flows are illustrated using a combination of Sequence Diagrams and Activity Diagrams to provide clarity on different aspects of the system's behavior.

Each diagram focuses on a specific workflow or scenario.

## Core Workflows

### 1. Service Worker Initialization

-  **Diagram:** [`sequence_sw_initialization.mmd`](./sequence_sw_initialization.mmd) (Sequence Diagram)
-  **Description:** Details the startup process of the Service Worker, including the instantiation and initial configuration of core services, emote providers, and integration managers. This shows the boot-up sequence before any client interaction.

### 2. Client Subscription & Initial Setup

-  **Diagram:** [`activity_client_subscription.mmd`](./activity_client_subscription.mmd) (Activity Diagram)
-  **Description:** Illustrates the end-to-end process when a Content Script connects to the Service Worker, subscribes to a specific chat room, and requests its initial set of emote sources. This diagram highlights the roles of different Service Worker components in establishing and configuring a client's session.

### 3. Emote Data Flow (Fetch/Update)

-  **Diagram:** [`sequence_emote_data_flow.mmd`](./sequence_emote_data_flow.mmd) (Sequence Diagram)
-  **Description:** Shows the sequence of events when the system needs to fetch or update emote data for a given emote source/context. This includes interaction with external emote provider APIs, updating the internal `EmoteRegistry`, and publishing events to notify other parts of the system (like the `MessageProcessorService` for cache invalidation).

### 4. Message Processing & Broadcast

-  **Diagram:** [`activity_message_processing.mmd`](./activity_message_processing.mmd) (Activity Diagram)
-  **Description:** Details the "hot path" for a new chat message. It covers the flow from the `PlatformAdapter` receiving a raw message, through storage, cache checks (hit/miss), processing via the `MessageFeedProcessorPipeline`, caching the processed result, and finally broadcasting the processed message data to the subscribed Content Script(s).

### 5. Client Disconnection & Cleanup

-  **Diagram:** [`activity_client_disconnect.mmd`](./activity_client_disconnect.mmd) (Activity Diagram)
-  **Description:** Illustrates the process and stages of resource cleanup when a Content Script disconnects or unsubscribes from a room. This includes decrementing reference counts for emote sources, notifying integration managers to clean up their state, and deactivating platform-specific connections if no longer needed.

## Cache Invalidation Flows

### Cache Invalidation Details

-  **Diagram:** [`architecture_cache_invalidation_sequence.mmd`](./architecture_cache_invalidation_sequence.mmd) (Sequence Diagrams)
-  **Description:** This file contains two detailed sequence diagrams illustrating specific cache invalidation scenarios:
   -  **Scenario A: EmoteSetUpdateEvent:** Shows how an update to an emote set triggers cache invalidation in the `MessageProcessorService`.
   -  **Scenario B: Third-Party State Change (e.g., 7TV User State):** Shows how an external or third-party state change (like a user's cosmetic update from 7TV) leads to an event that triggers cache invalidation for relevant messages.
