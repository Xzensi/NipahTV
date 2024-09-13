export const CHANGELOG: {
	version: string
	date: string
	description: string
}[] = [
	{
		version: '1.5.12',
		date: '2024-09-13',
		description: `
                  Looks like the chat message rendering is finally stable again now with minimal jittering and acceptable performance on fast moving chats.

                  Fix: First time user highlighting
                  Fix: Message render queue not reducing correctly
                  Fix: Annoying jittering message movements
                  Fix: Reversed message render order resulted in incorrect first time message highlighting
                  Chore: Further finetuned message rendering
                  Chore: Clarified settings
            `
	},
	{
		version: '1.5.11',
		date: '2024-09-12',
		description: `
                  Chore: Finetuning the message rendering queue system
                  Fix: Styling on chat causing message rendering performance issues
            `
	},
	{
		version: '1.5.10',
		date: '2024-09-12',
		description: `
                  Feat: Added message rendering queue system to increase performance for fast moving chats
                  Fix: Force truncate outrageously long usernames
                  Fix: Translucent chat overlay mode being enabled by default
            `
	},
	{
		version: '1.5.9',
		date: '2024-09-12',
		description: `
                  Fix: Translucent chat overlay feature in theatre mode
                  Fix: Links not rendering in messages
                  Fix: Emote menu positioning wrong after window resize
                  Fix: Show original Kick submit button for replies
                  Fix: User channelId not loading
                  Fix: NTV badge sometimes not showing
                  Chore: Temporarily removed broken message spacing feature
            `
	},
	{
		version: '1.5.8',
		date: '2024-09-11',
		description: `
                  Fix: Shortcut <K>key would pause stream while typing in chat
                  Fix: Command completions not updating on keys that match Kick shortcuts
                  Fix: Updated old popout chat link
                  Fix: Quick emote holder showing overflowing emotes
                  Fix: Temporarily disabled mute button in user info modals until user management is fixed
            `
	},
	{
		version: '1.5.7',
		date: '2024-09-11',
		description: `
                  Feat: Add settings option whether to steal focus to chat input when typing
                  Fix: Typing in chat triggering Kick shortcuts
                  Fix: Emote menu not opening with <CTRL> + <SPACE>
            `
	},
	{
		version: '1.5.6',
		date: '2024-09-11',
		description: `
                  Kick Website Overhaul:

                  I have been hard at work since Kick's major website overhaul (about 12 hours ago, 10 Sept) and am excited to share that NipahTV is back up and functional with most core functionality restored!

                  For those who are new or out of the loop, Kick introduced a complete redesign of their site yesterday, which has affected NipahTV and other extensions. While there’s still a lot more to be done, you can once again enjoy the core features of NipahTV!

                  Current Known Issues:
                  
                  - Reply Functionality: Kick’s overhaul made it impossible to implement the reply message feature. When replying, NipahTV falls back to the default Kick chat input as a temporary workaround.
                  - Firefox Issues: Kick has historically had many issues with Firefox, and currently, Firefox is having trouble authenticating.
                  - Mobile Mode Conflicts: Kick’s new mobile mode activates on smaller window sizes, which currently breaks NipahTV.
                  - Chat Scrolling Problems: Occasionally, chat gets stuck while scrolling, particularly when large messages with a lot of emotes expand.
                  - Bans/Timeouts: Banning or timing out users causes their page to crash completely.
                  - Feature Restoration: Some settings, such as the transparent overlay chat in theatre mode, still need to be re-implemented into Kick’s new design.
                  
                  We are continuing to make fixes and adjustments to improve the experience and restore the features you all loved. Thank you for your patience and support as we adapt to these changes!

                  MAJOR BREAKING CHANGES
                  Major fix: Complete rewrite of the Kick userinterface in support of the new website
                  Feat: Added settings for message timestamps
                  Fix: Accommodated new changes to the Kick API
                  Fix: Spacing issues of texts between emotes
            `
	},
	{
		version: '1.5.5',
		date: '2024-09-08',
		description: `
                  Major Kick website overhaul:

                  As I'm sure many of you are aware by now, and perhaps you just found out by the time you read this announcement because it already happened, Kick has planned a major overhaul of the website.

                  As reportedly planned it currently stands to be released on:
                  - Monday 9 Sept for all of Oceania
                  - Tuesday 10 Sept for Latin America
                  - Wednesday 11 Sept for Europe
                  - Thursday 12 Sept for North America
                  
                  It is not yet known in what ways the new website will break NipahTV, but we will do our best to keep up with the changes and provide you with the best experience possible. If it turns out to be utterly broken, simply temporarily disable the extension/userscript until we can push an update to fix it. Please be patient and allow us some time to adjust to the coming changes.

                  Thank you for supporting NipahTV!

                  Fix: Regression of missing plaform ID for extension database
            `
	},
	{
		version: '1.5.4',
		date: '2024-09-08',
		description: `
                  Feat: Added announcement service
                  Feat: Added partial support for platform and channel independent context scoping of settings for more specificity and granularity control of settings
                  Chore: Added Kick website overhaul announcement
                  Refactor: Cleaned up platform globals
            `
	},
	{
		version: '1.5.2',
		date: '2024-09-05',
		description: `
                  Fix: VOD chat history no longer rendering emotes
            `
	},
	{
		version: '1.5.1',
		date: '2024-09-01',
		description: `
                  Notable changes:
                  - Fixed an overdue issue of emotes not sending in emote only mode chat.
                  - Changed the input status so that streamers and mods can always see the chat mode status without having to second guess it. It'll remain the same for regular users as ("Send message..").
                  - Ban/unban events are now handled much more reliably and consistently.
                  - Only downside currently is that the follow button hasn't been implemented yet, so a page refresh is necessary after following a new channel. This will be fixed in a later update, it's low priority for now.

                  Fix: Emotes not sending in emote only mode chat
                  Fix: Errors not showing for commands due to incorrect error handling
                  Feat: Privileged users can now always see chat status in input (emoteonly/followonly/subonly)
                  Feat: Added pusher event handling service to handle ban/unban events and subonly/followonly/slowmode/emotesonly mode events
                  Feat: Added followers minimum channel following duration handling
                  Refactor: Reworked how ban/unban events are handled
            `
	},
	{
		version: '1.5.0',
		date: '2024-08-30',
		description: `
                  Following a major overhaul of the input completion strategy, it's now possible to trigger emote and mention completions during commands, with support for other command types coming soon. With input submission execution now decoupled from the input completer strategy, implementing support for third-party bot commands like Botrix is now possible, and command input is much more reliable. Previously, there were some edge cases, such as adding a '/' in front of pre-written or copied commands, which resulted in them being sent as regular messages.

                  A new input completer strategy has been added to support colon emotes, allowing you to start emote completions with, for example, ":peepo". You can now also disable all input completion strategies in the settings under Chat > Input > Input completion. Do note, that colon emotes (e.g. ":peepoGaze:") are not yet supported with copy-pasting, but this will be added in a future update. Please do let me know if you value this feature, so I can prioritize it accordingly.

                  It's a fairly significant update, so I might have missed some bugs. Please do report any issues you encounter.

                  Feat: Added input submission execution strategy system
                  Feat: Added support for colon emote completion suggestions
                  Feat: Added settings options for all input completion strategies
                  Feat: Kick command execution now confirms success before clearing input
                  Fix: Pressing <ESCAPE> completed emote completion instead of canceling it
                  Fix: Command messages being excluded from chat history
                  Fix: Command completion blocking chat history navigation
                  Fix: Sticky command UI completion after execution
                  Fix: <CONTROL> key closing the emote completion
                  Major refactor: Complete rewrite of input completion strategy system
                  Refactor: Isolated command execution logic
                  Refactor: Isolated Kick network interface API call signatures
                  Refactor: Isolated Kick command definitions
                  Chore: Change favorites instruction label
                  Chore: Cleaned up changelog
            `
	},
	{
		version: '1.4.38',
		date: '2024-08-22',
		description: `
                  Feat: Added support for extensions (NTV add-ons, not browser extensions)
                  Fix: Stale emotes showed as "undefined" in quick emote holder
                  Fix: Hovering over emotes in quick emotes holder caused clipping
                  Fix: Botrix commands were not working due to an unicode formatting tag codepoints bug in Botrix
                  Chore: Added input completion strategy registry
            `
	},
	{
		version: '1.4.37',
		date: '2024-08-20',
		description: `
                  Kick changed the message element structure, causing messages to break. This is fixed now.

                  Fix: Kick changes to element structure broke messages
                  Chore: Watered my cotton couch
            `
	},
	{
		version: '1.4.36',
		date: '2024-08-02',
		description: `
                  Fix: Emote menu was getting shoved out of screen on small window sizes
                  Fix: Emote tooltips were not centered on emotes #118
                  Fix: Input field changes height when an emote gets rendered/inserted into it, whereas it should be fixed #110
                  Fix: Message styling was no longer applying
            `
	},
	{
		version: '1.4.34',
		date: '2024-08-02',
		description: `
                  Feat: Added a new setting for message spacing
                  Feat: Added a new setting for message style
                  Fix: Emotes don't register usage engagement events when sent by submit button #115
                  Fix: Clicking on emotes in pinned messages won't insert them #107
            `
	},
	{
		version: '1.4.33',
		date: '2024-07-31',
		description: `
                  Fix: Subscribers emotes showing as available even when not subscribed #114
            `
	},
	{
		version: '1.4.32',
		date: '2024-07-30',
		description: `
                  Discovered a bug where the platform constant was not available in extension background workers, causing all emotes to be registered and loaded under the wrong platform ID. As a result, all emote usage history would appear as if it had been wiped; apologies for the inconvenience!

                  Hotfix: Constant PLATFORM was not available in extension background workers
            `
	},
	{
		version: '1.4.31',
		date: '2024-07-30',
		description: `
                  Added a new feature to favorite emotes and sort them by drag & drop. The favorite emotes are platform-wide. Do note that other-channel emotes that are not available in current channel will, by default, be hidden.

                  Feat: Implemented platform-wide emote favorites with drag & drop sorting capabilities
                  Feat: Added a setting to not show non-cross-channel favorited emotes
                  Fix: Incorrect implementation of emoteset registration ordering
                  Fix: Emote menu styling issues
                  Fix: Quick emote holder settings required a page refresh to take effect
                  Major refactor: Fully rewrote database structure
                  Refactor: Reworked quick emotes holder for better performance
            `
	},
	{
		version: '1.4.30',
		date: '2024-07-18',
		description: `
                  Fix: Copy-paste was no longer working
                  Fix: NTV badge was not rendering for reply messages
            `
	},
	{
		version: '1.4.29',
		date: '2024-07-18',
		description: `
                  Users with NipahTV now show a NTV badge in chat. If you don't like this feature, you can disable it in the settings.

                  Feat: Added NTV badge for NTV users
                  Feat: Added a report bug button to emote menu
                  Feat: Added a changelog to settings modal
                  Fix: Commands showed false positive error toasts due to inconsistent Kick API definitions
                  Fix: Emote tooltips showed under messages in overlay chat mode
                  Fix: Multiple chat submit buttons appeared when navigating
            `
	},
	{
		version: '1.4.27',
		date: '2024-07-15',
		description: `
                  Added an experimental feature, a new settings option to overlay chat transparently over the stream. It can be found under Settings > Appearance > Layout. I pushed this feature in a prior version but it accidentally completely messed up the chat, so I had to revert it. Apologies for the inconvenience for the few that noticed it.
            
                  Feat: Overlayed chat on top of stream transparently #66
                  Feat: Improved the video player control bar, removing the ugly and annoying opaque color bar that had a completely different gradient style than the entire rest of the Kick interface.. Why Kick, why?
                  Fix: Pasting inserted at the wrong cursor position in Chrome
            `
	},
	{
		version: '1.4.26',
		date: '2024-07-10',
		description: `
                  Fix: Chat messages were not loading on providers' load
                  Fix: Emotes could be inserted from quick emote holder when banned
                  Fix: Chat messages were not loading with appropriate styling for VODs
                  Fix: Annoying horizontal scrollbar appeared due to poor styling of Kick
                  Fix: Added more spacing for timestamps
            `
	},
	{
		version: '1.4.24',
		date: '2024-07-02',
		description: `
                  Fix: Commands could be sent as plaintext messages when using chat button
                  Fix: Pinned messages showed double message
                  Fix: Odd-pair brackets [ were incorrectly parsed as emote text, messing up the message
                  Fix: Rapid channel switching sometimes resulted in multiple input fields
                  Fix: Misaligned message user identity styling
                  Fix: Reverted truncating Kick emote names to underscore (because non-NTV users would see emote tooltips as underscore)
                  Chore: Improved emoji spacing 
            `
	},
	{
		version: '1.4.23',
		date: '2024-07-02',
		description: `
                  Fix: Input focus was getting stolen on creator's dashboard
            `
	},
	{
		version: '1.4.22',
		date: '2024-06-30',
		description: `
                  There's a new fancy command /timer that allows you to track the duration of something.
                  Channels where you are not subbed now show unlockable subscribers' emotes.
                  Native Kick emotes now get rendered in user info modals when viewing message history (moderators only).
                  Input now actually shows when you are timed out or banned with the appropriate message.
                  Before, deleted messages never really got deleted at all; message deletion now works correctly.
                  Lastly, fixed some bugs and annoyances.
            
                  Fix: Emotes were randomly not loading due to overrides
                  Fix: Deleted messages weren't deleted #81
                  Fix: No visual feedback when banned or timed out #82
                  Fix: Message parts were overflowing to an empty next line
                  Fix: Native Kick emotes were not rendering in user info modal #71
                  Feat: Added timer command to keep track of duration of something #83
                  Feat: Showed unlockable sub emotes for unsubbed viewers #80
                  Feat: Added settings option to hide subscriber emotes when not subscribed
                  Major refactor: Moved Dexie & Fuse vendor scripts to ESM imports
                  Refactor: Completely rewrote emotes in message rendering
                  Refactor: Twemoji was moved from content script to ESM import
                  Refactor: Emotes no longer render in-place
                  Chore: Adjusted separator styling
            `
	},
	{
		version: '1.4.20',
		date: '2024-06-27',
		description: `
                  Fix: Incorrect provider emote overrides #72
                  Fix: Emotes sometimes didn't load for VODs due to load event racing #79
                  Fix: Backspace when selecting emotes deleted the following emote as well
                  Fix: Forward delete when selecting emotes deleted the following emote as well
                  Fix: Misaligned message usernames
            `
	},
	{
		version: '1.4.19',
		date: '2024-06-24',
		description: `
                  It's now possible possible to enable/disable emote provider emotes for the menu while still allowing them to render in chat. New 7TV emote provider settings were added to enable/disable new 7TV global emotes & 7TV channel emotes.
            
                  Feat: Support for 7TV global emotes (emote picker/rendering) #72
                  Fix: Tiny gap in sticky emote set header
            `
	},
	{
		version: '1.4.18',
		date: '2024-06-20',
		description: `
                  Fix: Emote menu always showing sub-only Kick emotes
            `
	},
	{
		version: '1.4.17',
		date: '2024-06-20',
		description: `
                  Fix: Command completion lagged behind one key event on backspace
                  Fix: Follow command did not use the correct username slug
                  Fix: Relative formatted datetimes were output in the local locale instead of English
            `
	},
	{
		version: '1.4.14',
		date: '2024-06-17',
		description: `
                  I messed up, forgot to remove the test code that always gave everyone all badges including global moderator and staff badges.. Whoops.
            
                  Hotfix: Everyone had all badges
            `
	},
	{
		version: '1.4.13',
		date: '2024-06-17',
		description: `
                  User info modals (when clicking on usernames) are fully replaced with new custom user info modals. The gift sub button is implemented and is fully functional as well, which was a bit hard to hack in but works well. A new chat theme was also added to the settings options.
            
                  Fix: Added gift a sub button to user info modal #70
                  Fix: Kept user info modal within viewport on window resize
                  Fix: User info requests failed because Kick has no consistency in username slug format
                  Feat: Re-enabled user info modal to replace default Kick user info modal #60
                  Feat: Added general tooltips
                  Feat: Added tooltips for all badges
                  Feat: Added new rounded chat theme settings option
            `
	},
	{
		version: '1.4.12',
		date: '2024-06-16',
		description: `
                  After many hours of debugging Kasada I still managed to add in some new features as well for version 1.4.12. I already figured out how to deal with Kasada, however the solution sadly wasn't easily portable from Userscript to extensions. After trying a lot of prototype implementations it now works smoothly, and Kasada won't be a limitation anymore. 
            
                  Copy-pasting now works much more reliably after fixing some clipboard issues. However, Firefox support couldn't be achieved just yet because of weird bugs in the Gecko engine due to standard Web APIs not working in |globalThis| that are fine in Chromium.
            
                  Feat: Added new commands /follow, /unfollow, /mute, /unmute
                  Feat: Added a new settings option to always send quick emote holder emotes to chat immediately
                  Feat: Ctrl + enter now allows sending messages without clearing input #49
                  Feat: User info modal now loads the actual channel subscribers badges instead of generic default
                  -Feat-: Replaced Kick user info modal with our new user info modal #60 (postponed until Gift a sub button #70 is implemented)
                  Feat: Implemented the VIP and MOD buttons for user info modal #68
                  Feat: /raid is now an alias for /host #53
                  Fix: Kasada anti-bot WAF caused API authorization issues #56
                  Fix: Space after mention completion did not close the completion #58
                  Fix: Command /poll cancel button did nothing #47
                  Fix: Twemoji emojis did not render in pinned messages #46
                  Fix: Lowered /user command minimum allowed role. Viewers can now see a few commands available.
                  Fix: Error occurred when loading non-existing 7TV emote sets
                  Fix: Moderator commands did not parse sentences correctly
                  Fix: Copy & paste issues when copying from chat
                  Fix: Added toast notifications for command errors
                  Fix: User info modal got pushed out of screen depending on chat message click coordinates #69
            `
	},
	{
		version: '1.4.11',
		date: '2024-06-07',
		description: `
                  Feat: Added poll command, polls now finally work!
                  Fix: Non-sub emotes did not show for broadcasters
            `
	},
	{
		version: '1.4.6',
		date: '2024-05-25',
		description: `
                  Fix: Tooltips got stuck on screen when searching for emotes
                  Chore: Replaced outdated screenshots and video in readme
            `
	},
	{
		version: '1.4.5',
		date: '2024-05-24',
		description: `
                  Feat: Added mute button to user info modal (actually worked now)
                  Fix: Styling issues with settings modal sidebar were resolved
                  Fix: Background highlight accent color worked again
                  Fix: Settings rows of emotes did not update immediately, no longer required page refresh
                  Fix: Tooltips stopped working after removing jquery technical debt
                  Refactor: Major refactor of dependency injections throughout the entire codebase, now based on session contexts
                  Chore: Removed setting to hide Kick emote menu button
            `
	},
	{
		version: '1.4.4',
		date: '2024-05-23',
		description: `
                  Fix: First user message still used name partially instead of ID
            `
	},
	{
		version: '1.4.3',
		date: '2024-05-23',
		description: `
                  Feat: Added badges to user info modal
                  Feat: Added progressive message history loading to user info modal
                  Feat: Added timeline labeling to user info modal
                  Fix: First user message highlighting now use ID instead of name to prevent triggering on name change
            `
	},
	{
		version: '1.4.2',
		date: '2024-05-21',
		description: `
                  Fix: Changed emote name in Kick emotes for third party compatibility
            `
	},
	{
		version: '1.4.1',
		date: '2024-05-15',
		description: `
                  Fix: Message history no longer worked
            `
	},
	{
		version: '1.4.0',
		date: '2024-05-14',
		description: `
                  The update this time was a bit of a pain, because Kick forced scope creep where I'm progressively just completely replacing the entire website, but fixes were made, and long-standing important features that were put aside for a while were finally implemented.
            
                  The primary focus of this update was to implement support for native Kick commands for moderators and improve upon the overall UX and usability of the rather lacking native commands UX of Kick.
            
                  Initially, NipahTV employed shadow proxy elements that forwarded all inputs to the original Kick elements and simulated browser input events to make Kick submit the inputs to the servers. However, this proved impossible to make work with Kick commands, so a network interface for the Kick API was necessary to send messages and commands to the Kick API servers directly, completely bypassing the Kick frontend browser client.
            
                  However, after doing that, some commands would pop up some window with more information like /user and /poll, which promptly led to the conclusion that all of this user interfacing needed to be implemented as well.
            
                  At least now we can finally start recommending NipahTV to moderators as well because Kick commands finally work.
            
                  MODERATOR NOTE: There are still a couple of missing command actions because they are low priority, they'll be added in due time. This regards the /poll command and the VIP & MOD buttons on the /user {{user}} modal. The VIP and MOD commands should work fine, however.
            
                  Feat: Added Kick network interface, messages, and commands are now sent to Kick API directly.
                  Feat: Added command completion strategy, native Kick commands are now largely supported.
                  Feat: Added kick /user command
                  Feat: Added ban action to user info modal
                  Feat: Added channel user messages history to user info modal
                  Feat: Added account creation date and profile pic to user info modal
                  Feat: 7TV emotes in user info modal message history now rendered
                  Feat: Added follow/unfollow actions to user info modal
                  Feat: Added timeout action to user info modal
                  Feat: Added status page to user info modal
                  Feat: Added toasts for error messaging
                  Feat: Can now reply to messages
                  Feat: Settings menu is now mobile friendly
                  Fix: Emotes not inserting at correct anchored position in some edge cases.
                  Fix: Unable to log in because proxy fields blocked native Kick fields.
                  Fix: Bug in REST requests caused 7TV load failure.
                  Fix: User info modal showed message history in wrong chronological order
                  Fix: Modals mouse drag events no longer working correctly and being positioned wrong
                  Fix: Native send chat button showing double depending on options setting
                  Fix: Typing text next to emote got pushed past the emote
                  Fix: Stealing focus after keydown was too late, preventing input from registering the change
                  Chore: Lubricated my second-hand Nokia 9300i
                  Chore: Implemented abstract navigatable scrolling view component
                  Chore: Removed jQuery technical debt
                  Refactor: Major refactor of SCSS structure
                  Refactor: Decoupled input completer logic to NavigatableEntriesWindowComponent class.
                  Refactor: Decoupled input completer logic to separate strategy classes.
            `
	},
	{
		version: '1.3.9',
		date: '2024-04-16',
		description: `
                  Fix: Regression of 7tv emotes sometimes did not render correctly in pinned messages
                  Fix: Tab completion edge case resulted in double space
                  Fix: Submitting after typing exceptionally fast caused a racing issue with text cutting off
            `
	},
	{
		version: '1.3.6',
		date: '2024-04-06',
		description: `
                  Feat: Added Twemoji emoji rendering
                  Fix: Ctrl+Arrow key caret navigation skipped over entire inline text node instead of word #28
                  Fix: Changing Kick identity made native emote holder reappear #29
                  Fix: Rapidly clicking 7tv emotes in chat made them disappear #30
            `
	},
	{
		version: '1.3.5',
		date: '2024-03-28',
		description: `
                  Feat: Added settings option to enable first user message highlighting only in channels where you are a moderator
                  Fix: Inserted space after mention tab completions
            `
	},
	{
		version: '1.3.4',
		date: '2024-03-24',
		description: `
                  Hotfix: User mentions completions did not update input controller's state
            `
	},
	{
		version: '1.3.1',
		date: '2024-03-24',
		description: `
                  A major update, many things got completely rewritten and/or added. Many annoying caret navigation issues were solved by custom overriding behaviour implementations for input handling, including mouse cursor selections. Previously Ctrl/Ctrl+Shift handling was practically unusable. This now works intuitively and smoothly.
            
                  The only remaining annoyance, of which I'm not sure how to solve yet, is mouse cursor selections starting on top of emotes and between emotes, because selections work by anchor and focus (start point and drag end point). However, it is not obvious what the start point would be when clicking and dragging to start a selection with emotes. Arrow key selection handling, however, works flawlessly now.
            
                  Another big change is that after endless issues, particularly due to how Kick handles spaces, I decided to just completely get rid of padding spaces altogether. There's no more need for spaces between emotes or text at all.
            
                  Feat: Reworked navigation behaviour for default caret navigation
                  Feat: Implemented new behaviour for Ctrl-key caret navigation
                  Feat: Implemented new behaviour for Shift-key selection handling
                  Feat: Implemented new behaviour for Ctrl+Shift-key caret selection navigation
                  Feat: Implemented new behaviour for mouse-based emote selections
                  Fix: Chat messages history no longer worked due to settings ID change
                  Fix: Replacing selections with emotes caused corrupt component leftovers
                  Fix: Updated character count limit on input paste
                  BREAKING CHANGE: Removed all padding spaces from input components
                  Major refactor: Decoupled all tab completion and message history logic away from UI
                  Style: Reworked emote spacing
                  Chore: Input emote character counting is now more efficient through debouncing
            `
	},
	{
		version: '1.2.17',
		date: '2024-03-22',
		description: `
                  Feat: Input field now dynamically showed character count limit feedback
                  Fix: Clipboard copy/paste space padding issues
                  Chore: Improved Delete key handling (WIP)
            `
	},
	{
		version: '1.2.16',
		date: '2024-03-22',
		description: `
                  Feat: Added a new settings option to show quick emote holder
            `
	},
	{
		version: '1.2.15',
		date: '2024-03-21',
		description: `
                  Fix: Alternating message highlighting overrode new user message highlighting
                  Fix: In some cases, text could be written into input components
                  Fix: Backspace behaved weirdly, deleting a lot more than it should
                  Fix: Tab completor sometimes inserted redundant padding space
                  Fix: Settings modal sidebar now highlights the active panel
            `
	},
	{
		version: '1.2.13',
		date: '2024-03-20',
		description: `
                  Feat: Emote rendering now works for VODs
                  Feat: Emotes now get rendered in pinned messages
            `
	},
	{
		version: '1.2.11',
		date: '2024-03-20',
		description: `
                  Fix: Replies attached to messages wouldn't render
            `
	},
	{
		version: '1.2.10',
		date: '2024-03-20',
		description: `
                  Fix: Subscriber emotes of other channels caused NTV to stop rendering emotes
                  Fix: NTV did not load when not logged in on Kick
                  Fix: Selection caret got stuck when selecting in certain situations
            `
	},
	{
		version: '1.2.8',
		date: '2024-03-19',
		description: `
                  Fix: Closing tab completion with Enter or Right arrow key resulted in double spaces
            `
	},
	{
		version: '1.2.7',
		date: '2024-03-19',
		description: `
                  Fix: Closing tab completion with Space resulted in double spaces
            `
	},
	{
		version: '1.2.6',
		date: '2024-03-19',
		description: `
                  Fix: Links were not rendering in chat messages
                  Fix: Special characters were getting HTML escaped
                  Fix: Missing emote names for native Kick emotes in chat
                  Fix: Improved emote spacing
            `
	},
	{
		version: '1.2.1',
		date: '2024-03-17',
		description: `
                  It took me a little while (about 5 complete rewrites) since implementing a nearly full-blown rich content text editor turned out to be quite a bit trickier than thought because of endless weird edge cases, but it's finally wrapped up and shipped. This now allowed me to fix most of the outstanding bugs.
            
                  There's a couple new big features and improvements.
                  A nearly full blown rich content text editor has been implemented for the input field for better and more reliable emote processing. It now works much better with copy pasting.
                  It is now possible to enable first user message highlighting.
                  It is now possible to change the color of the first user message highlighting.
                  Manually typed emotes are now automatically completed upon closing the name with a space.
                  Native Kick emotes have been optimized; it is now possible to send more native Kick emotes in a message than normally possible without NipahTV.
                  Copy-pasting has been completely reworked and works much better now.
            
                  Feat: Increased the possible amount of native Kick emotes sent beyond normal #21
                  Feat: Implemented first new user message highlighting #9
                  Feat: Rendered manually typed emotes #4
                  Feat: Implemented first user message highlighting
                  Fix: Native Kick chat identity button was missing from shadow proxy input field #20
                  Fix: Arrow keys got blocked by message history when caret was right after emotes #17
                  Fix: Chat input text was not the same height as inline emotes, causing subtle small shifts in vertical caret positioning #16
                  Fix: Pasting emotes inserted them at the start of the input line instead of after the caret position #15
                  Fix: Username mentions lacked extra padding after tab completion #14
                  Fix: Tooltips no longer worked with the new structure
                  Fix: Clicking emotes in chat no longer worked with the new emote structure
                  Fix: Forward deletion with caret inside component did not work correctly
                  Fix: Caret positioning right before emote component did not get pushed out
                  Fix: Incorrect caret positioning during insertions
                  Fix: Selection caret should not go inside input components
                  Fix: Reimplemented clipboard copy & paste
                  Fix: Copy/paste was blocked #13
            `
	},
	{
		version: '1.1.12',
		date: '2024-03-03',
		description: `
                  Feat: Added a settings option to change quick emote holder rows
                  Fix: Prevented Kick from stealing focus from chat input
                  Chore: Changed order of Emoji emoteset to lower
            `
	},
	{
		version: '1.1.10',
		date: '2024-03-03',
		description: `
                  Fix: Emotes registered double in quick emote holder because of ID conflicts.
                  Refactor: Major refactor of all provider-specific emote IDs to name hashes for better future provider compatibility and emote reliability.
                  Chore: Changed database engine from LocalStorage to NoSQL IndexedDB.
            `
	},
	{
		version: '1.1.8',
		date: '2024-03-03',
		description: `
                  Feat: Added tooltips for emotes in chat
                  Feat: Added clicking emotes to insert them into chat input
                  Feat: Added guards against potential memory leaks
                  Chore: Improved global visual clarity
            `
	},
	{
		version: '1.1.6',
		date: '2024-03-03',
		description: `
                  Feat: Added clipboard handling, can now copy & paste emotes
                  Feat: Added @ user mention capability for tab-completion
                  Feat: Added max message character limit of 500
            `
	},
	{
		version: '1.1.4',
		date: '2024-03-03',
		description: `
                  Fix: Loading pages without chat input caused the interface to duplicate
            `
	},
	{
		version: '1.1.3',
		date: '2024-03-02',
		description: `
                  Fix: Tab completion was not doing initial scroll
                  Fix: Tab completion Shift & Tab key did not work correctly because of @ mentions
            `
	},
	{
		version: '1.1.2',
		date: '2024-03-02',
		description: `
                  Fixed some issues, particularly regarding the tab completion and chat history behaviour and the new Kick update. 
            
                  The input fields and chat button were completely replaced with new proxy fields. This was done to work around Kick messing with the input field and buttons. As a result, inline emote rendering was also implemented, so picking emotes now actually shows the emotes in the input field. Typing emotes manually, however, will not automatically turn them into inline emotes just yet.
            
                  @ username mentions are not implemented yet either.
            
                  The emote tab completion was completely reworked with more contextually meaningful searching by splitting up all emotes into semantical groupings (e.g. nebrideLove -> ["nebride", "love"]), so that tab completions and searching for emotes can better find the most relevant emotes.
            
                  A few new settings options were added, like enabling search bias for current/other channel emotes, menu button styles, etc.
            
                  A good number of issues and behaviour quirks were fixed, like having to press keys twice to navigate chat history, tab completion menu navigation and scrolling, etc.
            `
	}
]
