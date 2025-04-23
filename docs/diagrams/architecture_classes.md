# Architecture Overview

This document outlines the architecture of the NipahTV browser extension, focusing on the class structure and interactions within the Service Worker and its communication with Content Scripts.

**Note:** This document describes the high-level component interactions shown in `architecture_classes.puml`. For detailed definitions and relationships of data structures (like `Emote`, `BaseEvent`, `User`, `RoomSubscription`, etc.), please refer to the separate **`architecture_datatypes.puml`** diagram file.

## Core Concepts & Goals

-  **Centralized Service Worker:** The MV3 Service Worker acts as the central hub, managing connections, processing data, and coordinating events.
-  **Event-Driven:** An internal `EventBus` facilitates decoupled communication between Service Worker components.
-  **Room-Based Subscriptions:** Data processing and storage (like chat messages) are scoped to specific "Rooms" (e.g., a Twitch channel's chat feed), identified by a `RoomIdentifier`.
-  **Client-Defined Emote Scopes:** Clients generate unique `emoteScopeId`s (GUID/ULID) to group rooms that should share the exact same set of emote contexts.
-  **Contextual Emote Fetching & Lifecycle:** Emotes are fetched based on specific `EmoteFetchRequest`s (defining an emote source/context like "global 7TV" or "Kick channel emotes"). The `EmoteLifecycleManager` tracks which active scopes need which requests, ensuring resources (provider subscriptions) are active only when necessary via reference counting based on unique `emoteContextKey`s derived from requests.
-  **Efficient Resource Usage:** Avoids redundant provider subscriptions and processing when multiple rooms/tabs require the same emote sources.
-  **Extensibility:** Designed to easily add support for new platforms, emote providers, or features.
-  **Decoupling:** Components are loosely coupled through events and well-defined interfaces/data structures.

## Key Components & Responsibilities

### 1. Service Worker Core (`ServiceWorkerCore` Namespace)

-  **`ServiceWorkerOrchestrator`:**

   -  Responsible for the initial setup (`init`) of the Service Worker.
   -  Owns and manages the lifecycle of the core services and data structures within the Service Worker (`ClientConnectionManager`, `ClientMessageHandler`, `ClientEventNotifier`, `EventBus`, `ClientSubscriptionManager`, `MessageFeedProcessorPipeline`, `UserStore`, `RoomSubscription`, `MessageStore`) and the `EmoteSystem` components (`EmoteLifecycleManager`, `EmoteManager`).

-  **`ClientConnectionManager`:**

   -  Manages the lifecycle of client `Port` connections from `ContentScriptManager`.
   -  Handles connection establishment (`handleConnection`), disconnection (`handleDisconnect`), and errors (`handleConnectionError`).
   -  Listens for messages on connected ports and forwards them to `ClientMessageHandler`.
   -  On port disconnection, notifies `ClientSubscriptionManager` to clean up associated subscriptions.

-  **`ClientMessageHandler`:**

   -  Receives incoming messages from `ClientConnectionManager`.
   -  Routes messages based on their type to the appropriate service (e.g., `registerEmoteScope` -> `EmoteLifecycleManager`, `subscribeToRoom` -> `ClientSubscriptionManager` & `EmoteLifecycleManager`).

-  **`ClientEventNotifier`:**

   -  Subscribes to relevant internal events on the `EventBus` (e.g., `ProcessedChatMessageEvent`, `EmoteSetUpdateEvent`).
   -  Uses `ClientSubscriptionManager` to determine which client `Port`(s) are associated with the room related to the event.
   -  Broadcasts the event data to the appropriate `ContentScriptManager`(s) via their `Port`.

-  **`EventBus`:**

   -  A simple publish/subscribe service for internal communication within the Service Worker.
   -  Allows components like Platform Adapters, `EmoteManager`, and `MessageFeedProcessorPipeline` to publish events without direct dependencies on subscribers like `ClientEventNotifier`.

-  **`ClientSubscriptionManager`:**

   -  Manages active subscriptions to chat "Rooms" using `RoomIdentifier`.
   -  Tracks which client `Port` is connected to which `RoomIdentifier`.
   -  Owns and manages the lifecycle of `RoomSubscription` objects, including storing the associated `emoteScopeId`.
   -  Provides lookup for a room's `emoteScopeId` (`getScopeIdForRoom`).
   -  Provides lookup for ports associated with a room (`getPortsForRoom`), used by `ClientEventNotifier`.
   -  Handles `removeSubscription` calls from `ClientConnectionManager` on disconnect, notifying the `EmoteLifecycleManager` to disassociate the room from its scope.
   -  Interacts with `UserStore` to manage user reference counts based on room participation.
   -  Directs incoming messages to the correct `MessageStore` within the `RoomSubscription`.

-  **`MessageFeedProcessorPipeline`:**

   -  Subscribes to raw `ChatMessageReceivedEvent` from the `EventBus`.
   -  Determines the context for emote lookup: uses `ClientSubscriptionManager` to get the `emoteScopeId` for the message's `roomId`, then uses `EmoteLifecycleManager` to get the set of relevant `emoteContextKey`s for that scope.
   -  Uses `EmoteRegistry` to query relevant emotes by name (`getEmoteByName`) using the obtained `emoteContextKey`s.
   -  Applies middleware transformations (parsing, emote replacement, etc.).
   -  Publishes the final `ProcessedChatMessageEvent` to the `EventBus`.

-  **`UserStore`:**

   -  A service within `ServiceWorker.Core` storing `User` data (ID, display name, entitlements) globally across active room subscriptions within the Service Worker instance. (User data defined in `architecture_datatypes.puml`)
   -  Manages the lifecycle of `User` objects via reference counting (`roomSubscriptionRefCount`), ensuring users persist only as long as they are active in at least one `RoomSubscription`.
   -  Provides methods for updating user entitlements (emotes, badges, cosmetics). Used primarily by `ClientSubscriptionManager`.

-  **`RoomSubscription` (Datatype):**

   -  A data structure within `ServiceWorker.Core`, representing an active subscription to a specific room.
   -  Managed by `ClientSubscriptionManager`.
   -  Contains connected `ports`, the room's `MessageStore`, `activeUserIds` (referencing users in `UserStore`), and the associated `emoteScopeId`.

-  **`MessageStore`:**
   -  A store within `ServiceWorker.Core`, holding `MessageFeedEntry` objects for a single `RoomSubscription`.
   -  Its lifecycle is tied to its parent `RoomSubscription`. Used by `ClientSubscriptionManager`.

### 2. Emote System (`EmoteSystem` Namespace)

-  **`EmoteLifecycleManager`:**

   -  Manages the lifecycle of client-defined `EmoteScope`s and the underlying `EmoteFetchRequest`s.
   -  Stores the state for each scope (`EmoteScopeState`), including associated rooms and requested emote context keys.
   -  Tracks which rooms are associated with which scopes (`roomToScopeId`).
   -  Reference counts unique `EmoteFetchRequest`s (via their derived `emoteContextKey`) using `emoteContextRefCounts`, based on how many _active_ scopes require them.
   -  Triggers `EmoteManager.subscribeToEmotes` when an `emoteContextKey`'s ref count goes from 0 to 1.
   -  Triggers `EmoteManager.unsubscribeFromEmotes` when an `emoteContextKey`'s ref count goes from 1 to 0.
   -  Handles client messages routed via `ClientMessageHandler`: `registerScope`, `associateRoom`, `populateScopeWithRequest`.
   -  Handles cleanup via `disassociateRoom` (called by `ClientSubscriptionManager`), deleting scopes when they become inactive.
   -  Provides lookup for emote context keys associated with a scope (`getEmoteContextKeysForScope`).

-  **`EmoteManager`:**

   -  Orchestrates the actual interaction with `IEmoteProvider`s based on calls from `EmoteLifecycleManager`.
   -  Calls `IEmoteProvider.fetchEmotes` and potentially `IEmoteProvider.subscribeToUpdates` when `subscribeToEmotes` is invoked by the lifecycle manager.
   -  Calls `IEmoteProvider.unsubscribeFromUpdates` when `unsubscribeFromEmotes` is invoked.
   -  Updates the `EmoteRegistry` with fetched/updated emote data, associating it with the relevant `emoteContextKey`.
   -  Publishes `EmoteSetUpdateEvent` to the `EventBus` when emotes change (either from initial fetch or provider callback).
   -  Manages active provider subscriptions (e.g., WebSocket connections for 7TV), likely keyed by `emoteContextKey`.

-  **`EmoteRegistry`:**

   -  Central storage for `EmoteSet`s and `Emote`s.
   -  Stores sets mapped from the `emoteContextKey` that fetched them (`emoteContextKeyToSetIds`).
   -  Stores individual emotes keyed uniquely (`emotes`) and potentially by name (`emotesByName`).
   -  Provides methods to add/update (`addOrUpdateEmoteSet`) and remove emote data.
   -  Provides efficient lookup of emotes by name within specific contexts (`getEmoteByName`), using the relevant `emoteContextKey`s provided by the pipeline.
   -  Provides retrieval of all sets relevant to given contexts (`getAllEmoteSetsForContexts`).

-  **`IEmoteProvider` (Interface):**
   -  Defines the contract for emote providers (e.g., `SeventvEmoteProvider`, `KickEmoteProvider`).
   -  Specifies `fetchEmotes(request: EmoteFetchRequest)` to get initial emote sets based on the request definition.
   -  Optionally defines `subscribeToUpdates` and `unsubscribeFromUpdates` allowing `EmoteManager` to delegate background monitoring. The provider uses a callback (`updateCallback`) to notify `EmoteManager` of changes using an `EmoteSetUpdate` object.
   -  Optionally defines `canHandleRequest` to help route requests.

### 3. Content Script (`ContentScriptUI` Namespace)

-  **`ContentScriptManager`:**

   -  Runs within the context of a web page (e.g., Twitch tab).
   -  Detects the current context (`RoomIdentifier`) and determines the required `EmoteFetchRequest`s.
   -  Generates a unique `emoteScopeId` (e.g., using ULID).
   -  Establishes and maintains a persistent connection (`Port`) to the `ClientConnectionManager` in the Service Worker.
   -  Sends messages to the Service Worker (which are handled by `ClientMessageHandler`):
      -  `registerEmoteScope(scopeId)`
      -  `subscribeToRoom(roomIdentifier, scopeId)`
      -  `populateScopeWithRequest(scopeId, request)` for each required `EmoteFetchRequest`.
   -  Receives processed messages and events (`EmoteSetUpdateEvent`, etc.) broadcast by the `ClientEventNotifier`.
   -  Manages the `MessageFeedView` UI component.

-  **`MessageFeedView`:**
   -  The UI component (e.g., SolidJS) responsible for rendering the chat overlay.
   -  Receives processed messages, emote updates, and other events from the `ContentScriptManager` to update the display.

### 4. Platform Adapters (e.g., `TwitchPlatformAdapter`)

-  Platform-specific implementations responsible for:
   -  Connecting to the platform's data sources (API, WebSocket, etc.) based on `SubscriptionIntent`.
   -  Parsing raw platform data into standardized internal events (e.g., `ChatMessageReceivedEvent`, `ChannelEventReceivedEvent`), using the correct `roomId`.
   -  Publishing these events onto the `EventBus`.
   -  Exposing capabilities (`PlatformCapabilities`).
   -  Treated largely as black boxes by the core system.

## Data Structures & Storage (Overview)

This section provides a brief overview of key data structures. **See `architecture_datatypes.puml` for detailed definitions and relationships.** Note that `UserStore`, `RoomSubscription`, and `MessageStore` are defined within the `ServiceWorker.Core` package in the diagram.

-  **`RoomIdentifier`:** Uniquely identifies a specific chat room instance for subscription management (platform, roomId).
-  **`EmoteScopeState`:** Internal state managed by `EmoteLifecycleManager`, representing a client-defined scope (id, associatedRoomKeys, requestedEmoteContextKeys, isActive).
-  **`EmoteFetchRequest`:** Defines an emote source/context to be fetched by a provider (contextType, identifiers, targetProvider). An `emoteContextKey` is derived from this.
-  **`RoomSubscription`:** (Defined in `ServiceWorker.Core`) Represents an active subscription to a specific room, managed by `ClientSubscriptionManager`. Contains connected `ports`, the room's `MessageStore`, `activeUserIds`, and the associated `emoteScopeId`.
-  **`MessageStore`:** (Defined in `ServiceWorker.Core`) Stores `MessageFeedEntry` objects for a single `RoomSubscription`. Its lifecycle is tied to its parent `RoomSubscription`.
-  **`User`:** Represents a chat user, stored globally within the `UserStore`. Contains `userId`, `displayName`, `entitlements`, and `roomSubscriptionRefCount`.
-  **`MessageFeedEntry`:** Represents a raw message or event entry from a platform feed before processing, includes `senderUserId`.
-  **`ProcessedData`:** Contains the result of processing a `MessageFeedEntry`, typically including display parts.
-  **Events (`BaseEvent`, `ChatMessageReceivedEvent`, etc.):** Standardized objects published on the `EventBus`. `BaseEvent` uses `roomId`.
-  **`Emote`, `EmoteSet`:** Standardized structures for representing emotes and collections of emotes. `EmoteSet` contains `Emote`s.
-  **`EmoteSetUpdate`:** Contains details about changes to emote sets, used in provider callbacks and `EmoteSetUpdateEvent`. May include the `emoteContextKey` of the source that updated.
-  **`ParsingContext`:** Context provided during message processing, includes `roomId`, `platform`, and `emoteScopeId`.

## Key Workflows

1. **Client Connection & Subscription:**

   -  `ContentScriptManager` detects context (`RoomIdentifier`, required `EmoteFetchRequest`s).
   -  Generates unique `emoteScopeId`.
   -  Connects to `ClientConnectionManager` via `Port`.
   -  `ClientConnectionManager` establishes the connection.
   -  `ContentScriptManager` sends `registerEmoteScope(emoteScopeId)`.
   -  `ContentScriptManager` sends `subscribeToRoom(roomIdentifier, emoteScopeId)`.
   -  `ContentScriptManager` sends `populateScopeWithRequest(emoteScopeId, request)` for each required `EmoteFetchRequest`.
   -  `ClientConnectionManager` receives messages, forwards them to `ClientMessageHandler`.
   -  `ClientMessageHandler` delegates:
      -  `registerEmoteScope` -> `EmoteLifecycleManager.registerScope`.
      -  `subscribeToRoom` -> `ClientSubscriptionManager.addSubscription` (creates `RoomSubscription` with `MessageStore`) AND `EmoteLifecycleManager.associateRoom`.
      -  `populateScopeWithRequest` -> `EmoteLifecycleManager.populateScopeWithRequest`.
   -  `EmoteLifecycleManager`:
      -  Creates/updates `EmoteScopeState`.
      -  Tracks `roomKey` -> `scopeId` mapping.
      -  Generates `emoteContextKey` from request, adds to scope's `requestedEmoteContextKeys`.
      -  If scope becomes active OR key is added to active scope, calls `_incrementEmoteContextRef`.
      -  If `_incrementEmoteContextRef` causes count 0->1, calls `EmoteManager.subscribeToEmotes(request)`.
   -  `EmoteManager`: Calls provider `fetchEmotes`/`subscribeToUpdates`. Updates `EmoteRegistry` (associating with `emoteContextKey`). Publishes `EmoteSetUpdateEvent`.

2. **Receiving & Processing Messages:**

   -  `PlatformAdapter` receives raw data, parses into `ChatMessageReceivedEvent` (with `roomId`), publishes to `EventBus`.
   -  `MessageFeedProcessorPipeline` receives the event.
   -  Pipeline gets `emoteScopeId` via `ClientSubscriptionManager.getScopeIdForRoom(roomId)`.
   -  Pipeline gets relevant `emoteContextKey`s via `EmoteLifecycleManager.getEmoteContextKeysForScope(emoteScopeId)`.
   -  Pipeline queries `EmoteRegistry.getEmoteByName` using the name and the obtained `emoteContextKey`s.
   -  Pipeline processes the message (middleware, replacing names with found emotes).
   -  Pipeline publishes `ProcessedChatMessageEvent` to `EventBus`.
   -  `ClientEventNotifier` receives the event, finds relevant `Port`(s) via `ClientSubscriptionManager.getPortsForRoom(roomId)`, and sends processed data to `ContentScriptManager`(s).
   -  `ContentScriptManager` passes data to `MessageFeedView` for rendering.

3. **Storing Messages & Users:**

   -  _(Triggered by `ChatMessageReceivedEvent` or similar)_: A handler signals `ClientSubscriptionManager` about the new message.
   -  `ClientSubscriptionManager` identifies the correct `RoomSubscription` (using `roomId`) and calls `addMessage` on its `MessageStore`.
   -  `ClientSubscriptionManager` checks if the `senderUserId` is new for this `RoomSubscription`. If so, adds to `activeUserIds` and calls `UserStore.incrementRoomSubscriptionRef`.

4. **Emote Updates (Provider Initiated):**

   -  `IEmoteProvider` detects an update (e.g., via WebSocket).
   -  Calls the `updateCallback` provided by `EmoteManager`, passing an `EmoteSetUpdate` (ideally linked to the original `emoteContextKey`).
   -  `EmoteManager` receives the callback, updates the `EmoteRegistry`.
   -  `EmoteManager` publishes `EmoteSetUpdateEvent` containing the `EmoteSetUpdate`.
   -  `ClientEventNotifier` receives the event, finds relevant `Port`(s) via `ClientSubscriptionManager`, and relays the event to `ContentScriptManager`(s).
   -  `ContentScriptManager` updates `MessageFeedView`.

5. **Entitlement Updates:**

   -  An external source determines a user's entitlements changed.
   -  It calls `UserStore.updateUserEntitlements`.
   -  The `User` object in `UserStore` is updated. _(Propagation might involve client re-evaluating required `EmoteFetchRequest`s, potentially creating/populating a new scope or updating the existing one, leading to `EmoteLifecycleManager` adjustments and `EmoteSetUpdateEvent`s)_.

6. **Client Disconnection:**
   -  `ContentScriptManager` disconnects (`Port` closes).
   -  `ClientConnectionManager` detects disconnection, calls `ClientSubscriptionManager.removeSubscription(port)`.
   -  `ClientSubscriptionManager` finds the `RoomSubscription`, gets `roomKey`, removes the `Port`.
   -  `ClientSubscriptionManager` calls `EmoteLifecycleManager.disassociateRoom(roomKey)`.
   -  `EmoteLifecycleManager`:
      -  Removes `roomKey` from scope's `associatedRoomKeys`.
      -  Removes `roomKey` mapping.
      -  If scope becomes inactive (`associatedRoomKeys.size === 0`):
         -  Iterates `requestedEmoteContextKeys`, calls `_decrementEmoteContextRef` for each.
         -  Deletes the scope state.
      -  If `_decrementEmoteContextRef` causes count 1->0, calls `EmoteManager.unsubscribeFromEmotes(request)` (using the request associated with the `emoteContextKey`).
   -  `ClientSubscriptionManager` (if last port for room):
      -  Tells `UserStore` to decrement ref counts for `activeUserIds`.
      -  Discards `MessageStore` and `RoomSubscription`.

## Assumptions & Considerations

-  **Service Worker Lifetime:** Relies heavily on active `Port` connections. Robust heartbeat or alternative keep-alive mechanisms might be needed.
-  **Storage Limits:** Service Worker storage has limits. Consider strategies for pruning old messages or handling large user/emote data (e.g., IndexedDB, LRU cache).
-  **`EmoteLifecycleManager` Complexity:** Correctly managing scope states, room associations, emote context reference counts, and triggering manager actions requires careful implementation.
-  **`_generateEmoteContextKey` Reliability:** The function to generate a unique, stable key from an `EmoteFetchRequest` must be robust (e.g., handle identifier order).
-  **`EmoteRegistry` Complexity:** Querying efficiently based on multiple `emoteContextKey`s needs consideration. Handling removal/updates of potentially shared `EmoteSet`s needs care.
-  **Error Handling:** Robust error handling for connections, message processing, emote fetching/subscription, and storage operations is crucial.
