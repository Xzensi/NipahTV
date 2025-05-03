# Architecture Overview

This document outlines the architecture of the NipahTV browser extension, focusing on the class structure and interactions within the Service Worker and its communication with Content Scripts.

**Note:** This document describes the high-level component interactions shown in `architecture_classes.puml`. For detailed definitions and relationships of data structures (like `Emote`, `BaseEvent`, `User`, `RoomSubscription`, etc.), please refer to the separate **`architecture_datatypes.puml`** diagram file.

## Core Concepts & Goals

-  **Centralized Service Worker:** The MV3 Service Worker acts as the central hub, managing connections, processing data, and coordinating events.
-  **Event-Driven:** An internal `EventBus` facilitates decoupled communication between Service Worker components.
-  **Room-Based Subscriptions:** Data processing and storage are scoped to specific "Rooms" (e.g., a Twitch channel's chat feed), identified by a `RoomIdentifier`. Each `RoomSubscription` manages its own state.
-  **Room-Scoped User State:** Platform-specific user data (display name, badges, etc.) is stored per user within the scope of a `RoomSubscription`'s `UserStore`, updated as messages arrive.
-  **Client-Defined Session Scopes:** Clients generate unique `emoteScopeId`s (GUID/ULID) to group rooms that should share the exact same set of emote contexts. This is referred to as a "Session Scope".
-  **Contextual Emote Fetching & Lifecycle:** Emotes are fetched based on specific `EmoteFetchRequest`s. The `EmoteLifecycleManager` tracks which active scopes need which requests, ensuring resources are active only when necessary via reference counting.
-  **On-Demand Message Processing:** Messages are stored raw. Processing (emote replacement, cosmetic application) happens only when a message needs to be sent to a client, orchestrated by the `MessageProcessorService`.
-  **Processed Message Caching:** Results of message processing are cached per room (`LRUMessageCache`) to avoid redundant work, with invalidation triggered by relevant updates (e.g., emote changes).
-  **Decentralized Third-Party Logic:** Third-party extensions (like 7TV) manage their own state (e.g., cosmetics) and integrate via middleware in the `MessageFeedProcessorPipeline`.
-  **Efficient Resource Usage:** Avoids redundant provider subscriptions. Caching minimizes reprocessing.
-  **Extensibility:** Designed to easily add support for new platforms, emote providers, or features (via pipeline middleware).
-  **Decoupling:** Components are loosely coupled through events and well-defined interfaces/data structures.

## Key Components & Responsibilities

### 1. Service Worker Core (`ServiceWorkerCore` Namespace)

-  **`ServiceWorkerOrchestrator`:**

   -  Responsible for the initial setup (`init`) of the Service Worker.
   -  Owns and manages the lifecycle of the core services (`ClientConnectionManager`, `ClientMessageHandler`, `ClientEventNotifier`, `EventBus`, `ClientSubscriptionManager`, `MessageProcessorService`, `MessageFeedProcessorPipeline`) and the `EmoteSystem` components (`EmoteLifecycleManager`, `EmoteManager`).

-  **`ClientConnectionManager`:**

   -  Manages the lifecycle of client `Port` connections from `ContentScriptManager`.
   -  Handles connection establishment (`handleConnection`), disconnection (`handleDisconnect`), and errors (`handleConnectionError`).
   -  Listens for messages on connected ports and forwards them to `ClientMessageHandler`.
   -  On port disconnection, notifies `ClientSubscriptionManager` to clean up associated subscriptions.

-  **`ClientMessageHandler`:**

   -  Receives incoming messages from `ClientConnectionManager`.
   -  Routes messages based on their type to the appropriate service (e.g., `registerSessionScope` -> `EmoteLifecycleManager`, `subscribeToRoom` -> `ClientSubscriptionManager` & `EmoteLifecycleManager`).

-  **`ClientEventNotifier`:**

   -  Subscribes only to `ReadyToBroadcastMessageEvent` on the `EventBus`.
   -  Uses `ClientSubscriptionManager` to determine which client `Port`(s) are associated with the room related to the event.
   -  Broadcasts the final `ProcessedChatMessageData` contained in the event to the appropriate `ContentScriptManager`(s) via their `Port`.

-  **`EventBus`:**

   -  A simple publish/subscribe service for internal communication within the Service Worker.
   -  Allows components like Platform Adapters, `EmoteManager`, and `MessageProcessorService` to publish events without direct dependencies on subscribers.

-  **`ClientSubscriptionManager`:**

   -  Manages active subscriptions to chat "Rooms" using `RoomIdentifier`.
   -  Tracks which client `Port` is connected to which `RoomIdentifier`.
   -  Owns and manages the lifecycle of `RoomSubscription` objects. Each `RoomSubscription` contains the room's `UserStore`, `MessageStore`, and `LRUMessageCache`.
   -  Provides lookup for a room's `emoteScopeId` (`getScopeIdForRoom`).
   -  Provides lookup for ports associated with a room (`getPortsForRoom`), used by `ClientEventNotifier`.
   -  Provides lookup for the entire `RoomSubscription` object (`getRoomSubscription`), used by `PlatformAdapter` and `MessageProcessorService`.
   -  Handles `removeSubscription` calls from `ClientConnectionManager` on disconnect, notifying the `EmoteLifecycleManager` and cleaning up the `RoomSubscription`.

-  **`MessageProcessorService`:**

   -  Subscribes to raw `ChatMessageReceivedEvent` and `EmoteSetUpdateEvent` from the `EventBus`.
   -  Orchestrates on-demand message processing:
      -  On `ChatMessageReceivedEvent`: Checks the room's `LRUMessageCache` for the message ID.
      -  Cache Miss: Retrieves the raw `MessageFeedEntry` (from `MessageStore`), the sender's `User` object (from `UserStore`), and relevant `emoteContextKey`s (`EmoteLifecycleManager`). Invokes `MessageFeedProcessorPipeline.process()` with this context. Caches the resulting `ProcessedChatMessageData` in the `LRUMessageCache`.
      -  Publishes a `ReadyToBroadcastMessageEvent` containing the `ProcessedChatMessageData` (either from cache or fresh processing).
   -  Handles cache invalidation: On `EmoteSetUpdateEvent`, invalidates the relevant room's `LRUMessageCache`.

-  **`MessageFeedProcessorPipeline`:**

   -  Invoked on-demand by `MessageProcessorService`.
   -  Receives the raw `MessageFeedEntry`, the sender's `User` object (containing platform entitlements), and the relevant `emoteContextKey`s.
   -  Applies middleware transformations:
      -  Core middleware uses the `User` object for platform entitlements.
      -  Core middleware uses `EmoteRegistry` (queried with `emoteContextKey`s) for emote replacement.
      -  Third-party middleware accesses its own internal state (e.g., for 7TV cosmetics) and modifies the data.
   -  Returns the final `ProcessedChatMessageData`.

-  **`UserStore` (Room Scoped):**

   -  A store within each `RoomSubscription`, holding `User` objects for that specific room.
   -  Stores the latest known state of users, including `userId`, `displayName`, and platform-specific entitlements (`PlatformEntitlementData`).
   -  Updated by `PlatformAdapter`s as new messages arrive.
   -  Queried by `MessageProcessorService` to provide the sender's `User` object to the pipeline.

-  **`LRUMessageCache` (Room Scoped):**

   -  A cache within each `RoomSubscription`.
   -  Stores the output of the `MessageFeedProcessorPipeline` (`ProcessedChatMessageData`), keyed by message ID.
   -  Used by `MessageProcessorService` to avoid redundant processing.
   -  Invalidated by `MessageProcessorService` when relevant `EmoteSetUpdateEvent`s occur.

-  **`RoomSubscription` (Datatype):**

   -  A data structure representing an active subscription to a specific room.
   -  Managed by `ClientSubscriptionManager`.
   -  Contains connected `ports`, the associated `emoteScopeId`, and the room-scoped `UserStore`, `MessageStore`, and `LRUMessageCache`.

-  **`MessageStore` (Room Scoped):**
   -  A store within each `RoomSubscription`, holding raw `MessageFeedEntry` objects.
   -  Its lifecycle is tied to its parent `RoomSubscription`.
   -  Used by `MessageProcessorService` to retrieve raw message data on cache misses.

### 2. Emote System (`EmoteSystem` Namespace)

-  **`EmoteLifecycleManager`:**

   -  Manages the lifecycle of client-defined Session Scopes (`EmoteScope`s) and the underlying `EmoteFetchRequest`s.
   -  Stores the state for each scope (`EmoteScopeState`), including associated rooms and requested emote context keys.
   -  Tracks which rooms are associated with which scopes (`roomToScopeId`).
   -  Reference counts unique `EmoteFetchRequest`s (via their derived `emoteContextKey`) using `emoteContextRefCounts`.
   -  Triggers `EmoteManager.subscribeToEmoteSource` / `unsubscribeFromEmoteSource` based on ref counts.
   -  Handles client messages routed via `ClientMessageHandler`.
   -  Handles cleanup via `disassociateRoom` (called by `ClientSubscriptionManager`).
   -  Provides lookup for emote context keys associated with a scope (`getEmoteContextKeysForScope`), used by `MessageProcessorService`.

-  **`EmoteManager`:**

   -  Orchestrates the actual interaction with `IEmoteProvider`s based on calls from `EmoteLifecycleManager`.
   -  Calls provider methods (`fetchEmotes`, `subscribeToUpdates`, `unsubscribeFromUpdates`).
   -  Updates the `EmoteRegistry` with fetched/updated emote data.
   -  Publishes `EmoteSetUpdateEvent` to the `EventBus`.
   -  Manages active provider subscriptions.

-  **`EmoteRegistry`:**

   -  Central storage for `EmoteSet`s and `Emote`s.
   -  Stores sets mapped from the `emoteContextKey` that fetched them.
   -  Provides efficient lookup of emotes by name within specific contexts (`getEmoteByName`), used by the pipeline.
   -  Provides retrieval of all sets relevant to given contexts (`getAllEmoteSetsForContexts`).

-  **`IEmoteProvider` (Interface):**
   -  Defines the contract for emote providers.
   -  Specifies methods for fetching and optionally subscribing to emote updates.

### 3. Content Script (`ContentScriptUI` Namespace)

-  **`ContentScriptManager`:**

   -  Runs within the context of a web page.
   -  Detects context, generates `emoteScopeId`, determines required `EmoteFetchRequest`s.
   -  Establishes and maintains a `Port` connection to the Service Worker.
   -  Sends messages to the Service Worker (`registerSessionScope`, `subscribeToRoom`, `addEmoteSourceToScope`).
   -  Receives final processed messages (`ProcessedChatMessageData`) and other events broadcast by the `ClientEventNotifier`.
   -  Manages the `MessageFeedView` UI component.

-  **`MessageFeedView`:**
   -  The UI component responsible for rendering the chat overlay.
   -  Receives `ProcessedChatMessageData`, emote updates, etc., from the `ContentScriptManager` to update the display.

### 4. Platform Adapters (e.g., `TwitchPlatformAdapter`)

-  Platform-specific implementations responsible for:
   -  Connecting to the platform's data sources.
   -  Parsing raw platform data, extracting user info and platform entitlements.
   -  Finding the correct `RoomSubscription` (via `ClientSubscriptionManager`) and updating its `UserStore` with the latest user state.
   -  Publishing _raw_ standardized internal events (e.g., `ChatMessageReceivedEvent`) onto the `EventBus`.
   -  Exposing capabilities (`PlatformCapabilities`).

## Data Structures & Storage (Overview)

This section provides a brief overview of key data structures. **See `architecture_datatypes.puml` for detailed definitions and relationships.**

-  **`RoomIdentifier`:** Uniquely identifies a specific chat room instance.
-  **`EmoteScopeState`:** Internal state managed by `EmoteLifecycleManager`, representing a client-defined scope.
-  **`EmoteFetchRequest`:** Defines an emote source/context to be fetched. An `emoteContextKey` is derived from this.
-  **`RoomSubscription`:** Represents an active subscription to a room. Contains `ports`, `emoteScopeId`, `UserStore`, `MessageStore`, `LRUMessageCache`. Managed by `ClientSubscriptionManager`.
-  **`UserStore` (Room Scoped):** Stores `User` objects for a single room.
-  **`MessageStore` (Room Scoped):** Stores raw `MessageFeedEntry` objects for a single room.
-  **`LRUMessageCache` (Room Scoped):** Stores `ProcessedChatMessageData` for a single room.
-  **`User`:** Represents a chat user within a room's context. Contains `userId`, `displayName`, and `platformEntitlements`. Stored in `UserStore`.
-  **`PlatformEntitlementData`:** Represents a single platform entitlement (badge, cosmetic).
-  **`MessageFeedEntry`:** Represents a _raw_ message or event entry from a platform feed before processing. Includes `senderUserId`, content, timestamp.
-  **`ProcessedChatMessageData`:** Contains the result of processing a `MessageFeedEntry` via the pipeline. Includes display parts, combined platform entitlements, and any third-party cosmetics. Stored in `LRUMessageCache`.
-  **Events (`BaseEvent`, `ChatMessageReceivedEvent`, `EmoteSetUpdateEvent`, `ReadyToBroadcastMessageEvent`, etc.):** Standardized objects published on the `EventBus`. `ChatMessageReceivedEvent` is raw. `ReadyToBroadcastMessageEvent` contains the final `ProcessedChatMessageData`.
-  **`Emote`, `EmoteSet`:** Standardized structures for representing emotes and collections.
-  **`EmoteSetUpdate`:** Contains details about changes to emote sets.

## Key Workflows

1. **Client Connection & Subscription:**

   -  (Largely unchanged) `ContentScriptManager` connects, registers scope, subscribes to room, adds emote sources.
   -  `ClientMessageHandler` delegates to `EmoteLifecycleManager` and `ClientSubscriptionManager`.
   -  `ClientSubscriptionManager` creates `RoomSubscription` (including `UserStore`, `MessageStore`, `LRUMessageCache`).
   -  `EmoteLifecycleManager` manages scope state and triggers `EmoteManager` fetches/subscriptions as needed.
   -  `PlatformAdapter` is activated for the room if it's the first subscriber.

2. **Receiving & Processing Messages (On-Demand):**

   -  `PlatformAdapter` receives raw data, parses user info & platform entitlements.
   -  `PlatformAdapter` gets `RoomSubscription` via `ClientSubscriptionManager`.
   -  `PlatformAdapter` calls `roomSubscription.userStore.addOrUpdateUser(...)`.
   -  `PlatformAdapter` publishes _raw_ `ChatMessageReceivedEvent` (with `roomId`, `messageId`, `senderUserId`, content, etc.) to `EventBus`.
   -  `MessageProcessorService` receives the raw event.
   -  `MessageProcessorService` gets `RoomSubscription` via `ClientSubscriptionManager`.
   -  `MessageProcessorService` checks `roomSubscription.messageCache.get(messageId)`.
   -  **Cache Hit:** `MessageProcessorService` retrieves `ProcessedChatMessageData` from cache.
   -  **Cache Miss:**
      -  `MessageProcessorService` retrieves raw `MessageFeedEntry` from `roomSubscription.messageStore`.
      -  `MessageProcessorService` retrieves sender's `User` object from `roomSubscription.userStore`.
      -  `MessageProcessorService` gets `emoteScopeId` from `RoomSubscription`, then `emoteContextKey`s via `EmoteLifecycleManager`.
      -  `MessageProcessorService` invokes `MessageFeedProcessorPipeline.process(rawMessage, user, keys)`.
      -  Pipeline executes middleware (using `User` for platform entitlements, `EmoteRegistry` for emotes, third-party state for cosmetics).
      -  Pipeline returns `ProcessedChatMessageData`.
      -  `MessageProcessorService` stores result in `roomSubscription.messageCache.set(messageId, processedData)`.
   -  `MessageProcessorService` publishes `ReadyToBroadcastMessageEvent(roomId, processedData)` to `EventBus`.
   -  `ClientEventNotifier` receives the ready event.
   -  `ClientEventNotifier` gets relevant `Port`(s) via `ClientSubscriptionManager.getPortsForRoom(roomId)`.
   -  `ClientEventNotifier` sends `processedData` to `ContentScriptManager`(s).
   -  `ContentScriptManager` passes data to `MessageFeedView` for rendering.

3. **Storing Messages:**

   -  `PlatformAdapter` (or another component triggered by the raw event) gets the `RoomSubscription`.
   -  Calls `roomSubscription.messageStore.addMessage(rawMessageFeedEntry)`.

4. **Emote Updates & Cache Invalidation:**

   -  `IEmoteProvider` detects an update, calls `EmoteManager` callback.
   -  `EmoteManager` updates `EmoteRegistry`.
   -  `EmoteManager` publishes `EmoteSetUpdateEvent`.
   -  `MessageProcessorService` receives `EmoteSetUpdateEvent`.
   -  `MessageProcessorService` identifies affected rooms/scopes (needs logic, maybe via ELM?).
   -  For each affected room, `MessageProcessorService` calls `roomSubscription.messageCache.invalidate()`.
   -  _(Next time a message for that room is needed, it will be a cache miss and reprocessed with updated emotes)._

5. **Client Disconnection:**
   -  `ContentScriptManager` disconnects.
   -  `ClientConnectionManager` calls `ClientSubscriptionManager.removeSubscription(port)`.
   -  `ClientSubscriptionManager` removes port, calls `EmoteLifecycleManager.disassociateRoom(roomKey)`.
   -  `EmoteLifecycleManager` updates scope state, potentially triggers `EmoteManager.unsubscribeFromEmoteSource`.
   -  `ClientSubscriptionManager` (if last port for room): Discards the entire `RoomSubscription` object (including its `UserStore`, `MessageStore`, `LRUMessageCache`). Deactivates `PlatformAdapter` if needed.

## Assumptions & Considerations

-  **Service Worker Lifetime:** Still relies on active `Port` connections or other keep-alive.
-  **Storage Limits:** Service Worker storage has limits. `MessageStore` holds raw data. `UserStore` holds state per user per room. `LRUMessageCache` adds overhead. Consider pruning/limits for all. IndexedDB might be necessary for larger stores.
-  **Complexity:** This model is more complex due to on-demand processing, caching, and invalidation logic within `MessageProcessorService`.
-  **Cache Invalidation Logic:** Determining exactly which caches to invalidate on `EmoteSetUpdateEvent` needs careful implementation (mapping event context to rooms/scopes).
-  **`EmoteLifecycleManager` Complexity:** Remains complex.
-  **`_generateEmoteContextKey` Reliability:** Still crucial.
-  **`EmoteRegistry` Complexity:** Remains complex.
-  **Error Handling:** Robust error handling is crucial throughout the new processing flow.
-  **Third-Party Cosmetics:** Handled via pipeline middleware accessing decentralized state. Cache invalidation for _third-party_ state changes (e.g., user equips new 7TV cosmetic) needs consideration (e.g., third-party module publishes an event that MPS listens for to invalidate specific user entries in cache, or full cache invalidation).
