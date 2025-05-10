# Architecture Overview

This document outlines the architecture of the NipahTV browser extension, focusing on the class structure and interactions within the Service Worker and its communication with Content Scripts.

**Note:** This document describes the high-level component interactions shown in `architecture_classes.puml`. For detailed definitions and relationships of data structures (like `Emote`, `BaseEvent`, `User`, `RoomSubscription`, etc.), please refer to the separate **`architecture_datatypes.puml`** diagram file. For detailed cache invalidation sequences, see **`architecture_cache_invalidation_sequence.mmd`**.

## Core Concepts & Goals

-  **Centralized Service Worker:** The MV3 Service Worker acts as the central hub, managing connections, processing data, and coordinating events.
-  **Event-Driven (for Updates/Coordination):** An internal `EventBus` facilitates decoupled communication for state updates (emotes, third-party), lifecycle events (room destruction), and broadcasting processed messages. High-frequency raw message arrival is handled via direct calls.
-  **Room-Based Subscriptions:** Data processing and caching are scoped to specific "Rooms" (e.g., a Twitch channel's chat feed), identified by a `RoomIdentifier`. Each `RoomSubscription` manages its own state.
-  **Room-Scoped User State:** Platform-specific user data (display name, badges, etc.) is stored per user within the scope of a `RoomSubscription`'s `UserStore`, updated as messages arrive.
-  **Contextual Emote Fetching & Lifecycle:** Emotes are fetched based on specific `EmoteFetchRequest`s associated with a `RoomSubscription`. The `EmoteLifecycleManager` tracks which active `RoomSubscription`s need which requests, ensuring resources are active only when necessary via reference counting.
-  **Provider Registration (Dependency Injection):** `IEmoteProvider` instances are created externally (by `ServiceWorkerOrchestrator`) and registered with the `EmoteManager`, decoupling the manager from provider creation.
-  **On-Demand Message Processing:** Messages are stored raw. Processing (emote replacement, cosmetic application) is triggered directly by `PlatformAdapter`s and orchestrated by the `MessageProcessorService`.
-  **Processed Message Caching:** Results of message processing are cached per room (`LRUMessageCache`) to avoid redundant work.
-  **Granular Cache Invalidation:** The `LRUMessageCache` supports invalidation by message ID, user ID, or emote context key. Invalidation is triggered by relevant events (`EmoteSetUpdateEvent`, third-party state changes) handled by `MessageProcessorService`. Detailed flows are in `architecture_cache_invalidation_sequence.mmd`.
-  **Decentralized Third-Party Logic:** Third-party integrations (like 7TV) are encapsulated in dedicated managers (e.g., `SeventvIntegrationManager`). These managers handle their own state (e.g., cosmetics via WebSocket), **manage their own persistent storage** (e.g., `SeventvDatabaseService`), publish state change events for cache invalidation, and integrate with the core system via registered pipeline middleware and event subscriptions.
-  **Separate Persistent Storage:** Core application data and integration-specific data are stored in **separate Dexie/IndexedDB databases**, managed by dedicated `DatabaseService` components (`CoreDatabaseService`, `SeventvDatabaseService`, etc.) to ensure isolation and simplify schema management.
-  **Efficient Resource Usage:** Avoids redundant provider subscriptions. Caching minimizes reprocessing. Event-based cleanup allows internal state pruning.
-  **Extensibility:** Designed to easily add support for new platforms, emote providers (by registering new implementations), or third-party features (by creating new integration managers, database services, and middleware).
-  **Decoupling:** Components are loosely coupled through events (for updates/lifecycle), dependency injection (providers, managers), and well-defined interfaces/data structures. Direct calls are used for high-frequency message processing triggers.

## Key Components & Responsibilities

### 1. Service Worker Core (`ServiceWorkerCore` Namespace)

-  **`ServiceWorkerOrchestrator`:**

   -  Responsible for the initial setup (`init`) of the Service Worker.
   -  Owns and manages the lifecycle of the core services (including `CoreDatabaseService`), `EmoteSystem` components, `PlatformAdapter`s, `IEmoteProvider`s, and **third-party `IntegrationManager`s** (e.g., `SeventvIntegrationManager`).
   -  Instantiates and initializes the `CoreDatabaseService`.
   -  Instantiates concrete `IEmoteProvider` implementations and registers them with the `EmoteManager`.
   -  Instantiates concrete `IntegrationManager` implementations, initializes them (e.g., connecting WebSockets, initializing their `DatabaseService`), retrieves their `Middleware` functions, and **registers the middleware** with the `MessageFeedProcessorPipeline`.

-  **`ClientConnectionManager`:**

   -  Manages the lifecycle of client `Port` connections from `ContentScriptManager`.
   -  Handles connection establishment (`handleConnection`), disconnection (`handleDisconnect`), and errors (`handleConnectionError`).
   -  Listens for messages on connected ports and forwards them to `ClientMessageHandler`.
   -  On port disconnection, notifies `ClientSubscriptionManager` to clean up associated subscriptions.

-  **`ClientMessageHandler`:**

   -  Receives incoming messages from `ClientConnectionManager`.
   -  Routes messages based on their type to the appropriate service (e.g., `subscribeToRoom` -> `ClientSubscriptionManager`, `addEmoteSourceToRoom` -> `EmoteLifecycleManager`).

-  **`ClientEventNotifier`:**

   -  Subscribes only to `ReadyToBroadcastMessageEvent` on the `EventBus`.
   -  Uses `ClientSubscriptionManager` to determine which client `Port`(s) are associated with the room related to the event.
   -  Broadcasts the final `ProcessedChatMessageData` contained in the event to the appropriate `ContentScriptManager`(s) via their `Port`.

-  **`EventBus`:**

   -  A simple publish/subscribe service for internal communication within the Service Worker, primarily for updates, lifecycle events, and broadcasting processed messages.
   -  Allows components like `EmoteManager`, `MessageProcessorService`, and `IntegrationManager`s to publish/subscribe to events without direct dependencies.

-  **`ClientSubscriptionManager`:**

   -  Manages active subscriptions to chat "Rooms" using `RoomIdentifier`.
   -  Tracks which client `Port` is connected to which `RoomIdentifier`.
   -  Owns and manages the lifecycle of `RoomSubscription` objects. Each `RoomSubscription` contains the room's `UserStore`, `MessageStore`, and `LRUMessageCache`.
   -  Provides lookup for ports associated with a room (`getPortsForRoom`), used by `ClientEventNotifier`.
   -  Provides lookup for the entire `RoomSubscription` object (`getRoomSubscription`), used by `PlatformAdapter` and `MessageProcessorService`.
   -  **Notifies relevant `IntegrationManager`s** (e.g., `SeventvIntegrationManager.handleRoomSubscriptionCreated`) when a new `RoomSubscription` is created.
   -  Handles `removeSubscription` calls from `ClientConnectionManager` on disconnect. If the last port for a room disconnects, it notifies the `EmoteLifecycleManager`, publishes a `RoomSubscriptionDestroyedEvent` to the `EventBus` (allowing `IntegrationManager`s and `IEmoteProvider`s to clean up), and then destroys the `RoomSubscription` object.

-  **`MessageProcessorService`:**

   -  **Triggered directly by `PlatformAdapter`s** via `processNewMessage(roomId, messageId, senderId)` when a new message arrives.
   -  Orchestrates on-demand message processing: checks the room's `LRUMessageCache`, invokes `MessageFeedProcessorPipeline` on a cache miss, caches the result, and publishes a `ReadyToBroadcastMessageEvent`.
   -  Subscribes to events like `EmoteSetUpdateEvent` and third-party state change events (e.g., `SeventvUserStateChangedEvent`) from the `EventBus` **solely for cache invalidation purposes**.
   -  Handles **granular cache invalidation** by determining affected rooms/users/contexts (using `EmoteLifecycleManager` or `ClientSubscriptionManager` for lookups) and calling appropriate invalidation methods on the relevant `LRUMessageCache` (e.g., `invalidateContext`, `invalidateUser`). For detailed flows, see `docs/diagrams/architecture_cache_invalidation_sequence.mmd`.

-  **`MessageFeedProcessorPipeline`:**

   -  Invoked on-demand by `MessageProcessorService`.
   -  Receives the raw `MessageFeedEntry`, the sender's `User` object (containing platform entitlements), and the relevant `emoteContextKey`s for the room.
   -  Applies **registered** middleware transformations in sequence:
      -  Core middleware uses the `User` object for platform entitlements.
      -  Core middleware uses `EmoteRegistry` (queried with `emoteContextKey`s) for emote replacement.
      -  **Registered third-party middleware** (obtained from `IntegrationManager`s like `SeventvIntegrationManager`) accesses its manager's internal state (e.g., 7TV cosmetics, potentially reading from the manager's `DatabaseService`) and modifies the data.
   -  Returns the final `ProcessedChatMessageData`.

-  **`UserStore` (Room Scoped):**

   -  A store within each `RoomSubscription`, holding `User` objects for that specific room.
   -  Stores the latest known state of users, including `userId`, `displayName`, and platform-specific entitlements (`PlatformEntitlementData`).
   -  Updated by `PlatformAdapter`s as new messages arrive.
   -  Queried by `MessageProcessorService` to provide the sender's `User` object to the pipeline.

-  **`LRUMessageCache` (Room Scoped):**

   -  A cache within each `RoomSubscription`.
   -  Stores the output of the `MessageFeedProcessorPipeline` (`ProcessedChatMessageData`), keyed by message ID.
   -  Provides methods for **granular invalidation** (e.g., `invalidateAll`, `invalidateUser(userId)`, `invalidateContext(contextKey)`, `invalidateMessage(messageId)`).
   -  Used by `MessageProcessorService` to avoid redundant processing and handle invalidation.

-  **`RoomSubscription` (Datatype):**

   -  A data structure representing an active subscription to a specific room.
   -  Managed by `ClientSubscriptionManager`.
   -  Contains connected `ports` and the room-scoped `UserStore`, `MessageStore`, and `LRUMessageCache`.

-  **`MessageStore` (Room Scoped):**

   -  A store within each `RoomSubscription`, holding raw `MessageFeedEntry` objects.
   -  Its lifecycle is tied to its parent `RoomSubscription`.
   -  Used by `MessageProcessorService` to retrieve raw message data on cache misses.

-  **`CoreDatabaseService`:**
   -  Manages the Dexie (IndexedDB) instance dedicated to core application data (e.g., user settings, global preferences).
   -  Instantiated and initialized by `ServiceWorkerOrchestrator`.
   -  Provides typed methods for accessing core persistent data (e.g., `getSetting`, `setSetting`).
   -  Encapsulates the Dexie database schema and versioning for core data.

### 2. Emote System (`EmoteSystem` Namespace)

-  **`EmoteLifecycleManager`:**

   -  Manages the lifecycle of `EmoteFetchRequest`s based on the needs of active `RoomSubscription`s.
   -  Tracks which `RoomSubscription`s require which `EmoteFetchRequest`s (via their derived `emoteContextKey`).
   -  Reference counts unique `emoteContextKey`s across all active `RoomSubscription`s.
   -  Triggers `EmoteManager.subscribeToEmoteSource` / `unsubscribeFromEmoteSource` based on ref counts going from 0 to 1 or 1 to 0.
   -  Handles `addEmoteSourceToRoom` messages routed via `ClientMessageHandler`.
   -  Handles cleanup via `removeEmoteSourcesForRoom` (called by `ClientSubscriptionManager` when a `RoomSubscription` is destroyed).
   -  Provides lookup for emote context keys needed for a specific room (`getEmoteContextKeysForRoom`), used by `MessageProcessorService`.
   -  **Provides reverse lookup (`getRoomsForContextKey`)** used by `MessageProcessorService` for cache invalidation on `EmoteSetUpdateEvent`.

-  **`EmoteManager`:**

   -  Receives `IEmoteProvider` instances via its `registerProvider()` method (called by `ServiceWorkerOrchestrator`).
   -  Orchestrates the actual interaction with **registered** `IEmoteProvider`s based on calls from `EmoteLifecycleManager`.
   -  Iterates through registered providers to find one that `canHandleRequest`.
   -  Calls provider methods (`fetchEmotes`, `subscribeToUpdates`, `unsubscribeFromUpdates`) on the appropriate registered provider.
   -  Updates the `EmoteRegistry` with fetched/updated emote data.
   -  Publishes `EmoteSetUpdateEvent` to the `EventBus`.
   -  Manages active subscriptions _within_ registered providers.

-  **`EmoteRegistry`:**

   -  Central storage for `EmoteSet`s and `Emote`s (in memory).
   -  Stores sets mapped from the `emoteContextKey` that fetched them.
   -  Provides efficient lookup of emotes by name within specific contexts (`getEmoteByName`), used by the pipeline.
   -  Provides retrieval of all sets relevant to given contexts (`getAllEmoteSetsForContexts`).

-  **`IEmoteProvider` (Interface):**
   -  Defines the contract for emote providers.
   -  Specifies methods for fetching and optionally subscribing to emote updates.

### 3. Content Script (`ContentScriptUI` Namespace)

-  **`ContentScriptManager`:**

   -  Runs within the context of a web page.
   -  Detects context and determines required `EmoteFetchRequest`s for the room.
   -  Establishes and maintains a `Port` connection to the Service Worker.
   -  Sends messages to the Service Worker (`subscribeToRoom`, `addEmoteSourceToRoom`).
   -  Receives final processed messages (`ProcessedChatMessageData`) and other events broadcast by the `ClientEventNotifier`.
   -  Manages the `MessageFeedView` UI component.

-  **`MessageFeedView`:**
   -  The UI component responsible for rendering the chat overlay.
   -  Receives `ProcessedChatMessageData`, emote updates, etc., from the `ContentScriptManager` to update the display.

### 4. Platform Adapters (e.g., `TwitchPlatformAdapter`)

-  Platform-specific implementations responsible for:
   -  Connecting to the platform's data sources.
   -  Parsing raw platform data, extracting user info and platform entitlements.
   -  Finding the correct `RoomSubscription` (via `ClientSubscriptionManager`), updating its `UserStore`, and adding the raw message to its `MessageStore`.
   -  **Directly triggering `MessageProcessorService.processNewMessage(...)`** for the newly arrived message.
   -  Potentially publishing other, less frequent events (e.g., user join/part, stream status) onto the `EventBus`.
   -  Exposing capabilities (`PlatformCapabilities`).

### 5. Emote Provider Implementations (e.g., `SeventvEmoteProvider`)

-  Implement the `IEmoteProvider` interface for specific third-party services.
-  **Instantiated by `ServiceWorkerOrchestrator`** during initialization.
-  May maintain internal state related to rooms (e.g., user-specific entitlements) or global state.
-  Subscribe to `RoomSubscriptionDestroyedEvent` on the `EventBus` to trigger cleanup of their internal room-specific state when a room is no longer active.

### 6. Third-Party Integrations (e.g., `ThirdParty.Seventv` Namespace)

-  **`SeventvIntegrationManager`:**

   -  **Instantiated and initialized by `ServiceWorkerOrchestrator`**.
   -  **Owns and initializes the `SeventvDatabaseService`**.
   -  Manages the persistent WebSocket connection to the 7TV Event Service (`events.7tv.io`).
   -  Receives notifications from `ClientSubscriptionManager` (`handleRoomSubscriptionCreated`) to send subscription messages over the WebSocket for relevant rooms/users.
   -  Handles incoming asynchronous WebSocket messages, parsing them to update its internal state (e.g., user cosmetics, entitlements). **Uses `SeventvDatabaseService` to persist relevant state changes.**
   -  Provides a `Middleware` function (`getPipelineMiddleware`) to the `ServiceWorkerOrchestrator`, which registers it with the `MessageFeedProcessorPipeline`. This middleware accesses the manager's internal state (potentially reading from `SeventvDatabaseService`) during message processing to apply 7TV cosmetics.
   -  Subscribes to `RoomSubscriptionDestroyedEvent` on the `EventBus` to send unsubscribe messages over the WebSocket and clean up internal room-specific state.
   -  **Publishes specific state change events** (e.g., `SeventvUserStateChangedEvent`) to the `EventBus` to signal the need for cache invalidation.

-  **`SeventvDatabaseService`:**
   -  Manages the Dexie (IndexedDB) instance dedicated to 7TV integration data (e.g., user tokens, cosmetic settings, entitlements).
   -  Instantiated and initialized by `SeventvIntegrationManager`.
   -  Provides typed methods for accessing 7TV persistent data (e.g., `getCosmeticSetting`, `setCosmeticSetting`).
   -  Encapsulates the Dexie database schema and versioning for 7TV data.

## Data Structures & Storage (Overview)

This section provides a brief overview of key data structures and storage mechanisms. **See `architecture_datatypes.puml` for detailed definitions and relationships.**

-  **`RoomIdentifier`:** Uniquely identifies a specific chat room instance.
-  **`EmoteFetchRequest`:** Defines an emote source/context to be fetched. An `emoteContextKey` is derived from this.
-  **`RoomSubscription`:** Represents an active subscription to a specific room. Contains connected `ports` and the room-scoped `UserStore`, `MessageStore`, and `LRUMessageCache`. Managed by `ClientSubscriptionManager`.
-  **`UserStore` (Room Scoped):** Stores `User` objects for a single room (in memory).
-  **`MessageStore` (Room Scoped):** Stores raw `MessageFeedEntry` objects for a single room (in memory).
-  **`LRUMessageCache` (Room Scoped):** Stores `ProcessedChatMessageData` for a single room (in memory). Provides granular invalidation methods.
-  **`User`:** Represents a chat user within a room's context. Contains `userId`, `displayName`, and `platformEntitlements`. Stored in `UserStore`.
-  **`PlatformEntitlementData`:** Represents a single platform entitlement (badge, cosmetic).
-  **`MessageFeedEntry`:** Represents a _raw_ message or event entry from a platform feed before processing. Includes `senderUserId`, content, timestamp.
-  **`ProcessedChatMessageData`:** Contains the result of processing a `MessageFeedEntry` via the pipeline. Includes display parts, combined platform entitlements, and any third-party cosmetics. Stored in `LRUMessageCache`.
-  **Events (`BaseEvent`, `EmoteSetUpdateEvent`, `ReadyToBroadcastMessageEvent`, `RoomSubscriptionDestroyedEvent`, `SeventvUserStateChangedEvent`, etc.):** Standardized objects published on the `EventBus`. `ReadyToBroadcastMessageEvent` contains the final `ProcessedChatMessageData`. `RoomSubscriptionDestroyedEvent` signals internal cleanup. `EmoteSetUpdateEvent` and `SeventvUserStateChangedEvent` trigger cache invalidation.
-  **`Emote`, `EmoteSet`:** Standardized structures for representing emotes and collections. Stored in `EmoteRegistry` (in memory).
-  **`EmoteSetUpdate`:** Contains details about changes to emote sets.
-  **Persistent Storage:**
   -  **`CoreDatabaseService`:** Manages a Dexie/IndexedDB instance for core settings and potentially other long-lived application data.
   -  **`SeventvDatabaseService`:** Manages a separate Dexie/IndexedDB instance for 7TV-specific data (tokens, settings, etc.).
   -  Other integrations would have their own dedicated `DatabaseService` instances.

## Key Workflows

1. **Initialization:**

   -  `ServiceWorkerOrchestrator.init()` runs.
   -  Core services are instantiated.
   -  **`Orchestrator` instantiates and initializes `CoreDatabaseService`.**
   -  Concrete `IEmoteProvider` implementations are instantiated and registered with `EmoteManager`.
   -  Concrete `IntegrationManager` implementations (e.g., `SeventvIntegrationManager`) are instantiated.
   -  `Orchestrator` calls `integrationManager.init()` (e.g., `SeventvIntegrationManager` **instantiates/initializes `SeventvDatabaseService`** and connects its WebSocket).
   -  `Orchestrator` calls `integrationManager.getPipelineMiddleware()` to get the middleware function.
   -  `Orchestrator` calls `pipeline.use(middleware)` to register the third-party middleware.

2. **Client Connection & Subscription:**

   -  `ContentScriptManager` connects to Service Worker.
   -  `ContentScriptManager` detects context and calls `subscribeToRoom(roomIdentifier)`.
   -  `ClientMessageHandler` delegates to `ClientSubscriptionManager`.
   -  `ClientSubscriptionManager` creates `RoomSubscription` (including `UserStore`, `MessageStore`, `LRUMessageCache`) and associates the port.
   -  **`ClientSubscriptionManager` calls `integrationManager.handleRoomSubscriptionCreated(roomIdentifier)`** (e.g., `SeventvIntegrationManager` sends WS subscribe message).
   -  `ContentScriptManager` calls `addEmoteSourceToRoom(roomIdentifier, request)` for each needed source.
   -  `ClientMessageHandler` delegates to `EmoteLifecycleManager`.
   -  `EmoteLifecycleManager` tracks the request per room, updates ref counts for the derived `emoteContextKey`.
   -  If ref count becomes 1, `EmoteLifecycleManager` triggers `EmoteManager.subscribeToEmoteSource(request)`.
   -  `EmoteManager` finds a **registered** provider that `canHandleRequest(request)` and calls its `fetchEmotes` (and potentially `subscribeToUpdates`).
   -  `PlatformAdapter` is activated for the room if it's the first subscriber.

3. **Receiving & Processing Messages (On-Demand):**

   -  `PlatformAdapter` receives raw data, parses user info & platform entitlements.
   -  `PlatformAdapter` gets `RoomSubscription` via `ClientSubscriptionManager`.
   -  `PlatformAdapter` calls `roomSubscription.userStore.addOrUpdateUser(...)`.
   -  `PlatformAdapter` calls `roomSubscription.messageStore.addMessage(rawMessageFeedEntry)`.
   -  **`PlatformAdapter` calls `MessageProcessorService.processNewMessage(roomId, messageId, senderId)`**.
   -  `MessageProcessorService` receives the trigger.
   -  `MessageProcessorService` gets `RoomSubscription` via `ClientSubscriptionManager`.
   -  `MessageProcessorService` checks `roomSubscription.messageCache.get(messageId)`.
   -  **Cache Hit:** `MessageProcessorService` retrieves `ProcessedChatMessageData` from cache.
   -  **Cache Miss:**
      -  `MessageProcessorService` retrieves raw `MessageFeedEntry` from `roomSubscription.messageStore`.
      -  `MessageProcessorService` retrieves sender's `User` object from `roomSubscription.userStore`.
      -  `MessageProcessorService` gets `emoteContextKey`s for the room via `EmoteLifecycleManager.getEmoteContextKeysForRoom(roomId)`.
      -  `MessageProcessorService` invokes `MessageFeedProcessorPipeline.process(rawMessage, user, keys)`.
      -  Pipeline executes **registered middleware** in sequence:
         -  Core emote middleware uses `EmoteRegistry` with `keys`.
         -  **Third-party middleware** (e.g., 7TV's) is executed, accessing its `IntegrationManager`'s state (e.g., `SeventvIntegrationManager.getCosmetics(user.userId)`, **potentially reading from `SeventvDatabaseService`**).
      -  Pipeline returns `ProcessedChatMessageData`.
      -  `MessageProcessorService` stores result in `roomSubscription.messageCache.set(messageId, processedData)`.
   -  `MessageProcessorService` publishes `ReadyToBroadcastMessageEvent(roomId, processedData)` to `EventBus`.
   -  `ClientEventNotifier` receives the ready event.
   -  `ClientEventNotifier` gets relevant `Port`(s) via `ClientSubscriptionManager.getPortsForRoom(roomId)`.
   -  `ClientEventNotifier` sends `processedData` to `ContentScriptManager`(s).
   -  `ContentScriptManager` passes data to `MessageFeedView` for rendering.

4. **Storing Messages:** (Now part of Step 3, handled by `PlatformAdapter`)

5. **Emote Updates & Cache Invalidation:**

   -  An `IEmoteProvider` (via `EmoteManager`) signals an update, leading to `EmoteManager` publishing an `EmoteSetUpdateEvent(emoteContextKey)` to the `EventBus`.
   -  `MessageProcessorService` receives this event. It uses `EmoteLifecycleManager` to find all rooms affected by the `emoteContextKey`.
   -  For each affected room, it retrieves the `RoomSubscription` and calls `roomSubscription.messageCache.invalidateContext(emoteContextKey)` (or a similar granular method).
   -  This ensures messages using that emote context will be reprocessed.
   -  **For a detailed visual walkthrough, see `docs/diagrams/architecture_cache_invalidation_sequence.mmd` (Scenario A).**

6. **Third-Party State Updates & Cache Invalidation (Example: 7TV Cosmetics):**

   -  An `IntegrationManager` (e.g., `SeventvIntegrationManager`) detects a state change (e.g., user cosmetic update via WebSocket) and publishes a specific event (e.g., `SeventvUserStateChangedEvent(userId)`) to the `EventBus`.
   -  `MessageProcessorService` receives this event. It identifies all rooms where the specified user might have messages.
   -  For each relevant room, it retrieves the `RoomSubscription` and calls `roomSubscription.messageCache.invalidateUser(userId)`.
   -  This ensures messages from/related to that user will be reprocessed with the new third-party state.
   -  **For a detailed visual walkthrough, see `docs/diagrams/architecture_cache_invalidation_sequence.mmd` (Scenario B).**

7. **Client Disconnection:**
   -  `ContentScriptManager` disconnects.
   -  `ClientConnectionManager` calls `ClientSubscriptionManager.removeSubscription(port)`.
   -  `ClientSubscriptionManager` removes port. If it was the last port for a `RoomSubscription`:
      -  It retrieves the `roomIdentifier`.
      -  It calls `EmoteLifecycleManager.removeEmoteSourcesForRoom(roomIdentifier)`.
      -  `EmoteLifecycleManager` updates ref counts. If an emote context ref count becomes 0, it triggers `EmoteManager.unsubscribeFromEmoteSource(request)`.
      -  `EmoteManager` finds the relevant **registered** provider and calls its `unsubscribeFromUpdates` method.
      -  `ClientSubscriptionManager` publishes `RoomSubscriptionDestroyedEvent(roomIdentifier)` to the `EventBus`.
      -  **Subscribers (like `SeventvIntegrationManager`, `SeventvEmoteProvider`) receive the event.**
      -  `SeventvIntegrationManager` sends WS unsubscribe message and cleans up internal state for `roomIdentifier`.
      -  `SeventvEmoteProvider` cleans up internal state for `roomIdentifier`.
      -  `ClientSubscriptionManager` discards the entire `RoomSubscription` object (including its `UserStore`, `MessageStore`, `LRUMessageCache`).
      -  `ClientSubscriptionManager` deactivates `PlatformAdapter` if needed.

## Assumptions & Considerations

-  **Service Worker Lifetime:** Still relies on active `Port` connections or other keep-alive mechanisms.
-  **Storage Limits:** Service Worker storage has limits. `MessageStore`, `UserStore`, and `LRUMessageCache` are currently in-memory per `RoomSubscription`. **Persistent data is managed via Dexie/IndexedDB through `CoreDatabaseService` and integration-specific `DatabaseService`s.** Consider pruning/limits for in-memory stores and be mindful of IndexedDB quotas.
-  **Complexity:** This model increases complexity with dedicated integration managers, database services, middleware registration, and event-based cache invalidation, but improves modularity and data isolation.
-  **Cache Invalidation Logic:** Needs careful implementation. **Granular invalidation (`invalidateUser`, `invalidateContext`) is preferred** but requires accurate tracking. `MessageProcessorService` coordinates this based on events. For detailed flows, refer to `docs/diagrams/architecture_cache_invalidation_sequence.mmd`.
-  **`_generateEmoteContextKey` Reliability:** Still crucial for emote lifecycle.
-  **`EmoteRegistry` Complexity:** Remains complex (though only holds in-memory data).
-  **Error Handling:** Robust error handling is crucial throughout, especially in WebSocket connections, database operations, middleware execution, and asynchronous updates.
-  **Third-Party Cosmetics:** Handled via pipeline middleware accessing state within dedicated `IntegrationManager`s (potentially reading from their `DatabaseService`). Cache invalidation for third-party state changes requires the `IntegrationManager` to signal the change (e.g., via `EventBus`) so `MessageProcessorService` can invalidate relevant cache entries (e.g., using `invalidateUser`). Cleanup relies on `IntegrationManager`s subscribing to `RoomSubscriptionDestroyedEvent`.
