export const CHANGELOG = [
	{
		version: '1.4.27',
		date: '2024-07-15',
		description: `
            Added experimental feature, a new settings option to overlay chat transparently over stream. It can be found under Settings > Appearance > Layout. I pushed this feature in prior version but it accidentally completely messed up the chat so I had to revert it, apologies for the inconvenience for the few that noticed it.

            Feat: Overlay chat on top of stream transparently #66
            Feat: Improve the video player control bar, no more ugly and annoying opaque color bar that has a completely different gradient style than the entire rest of the Kick interface.. Why Kick, why?
            Fix: Pasting inserts at wrong cursor position in Chrome #95
        `
	},
	{
		version: '1.4.26',
		date: '2024-07-10',
		description: `
            Fix: Chat messages not loading on providers load
            Fix: Can insert emotes from quick emote holder when banned #93
            Fix: Chat messages not loading with appropriate styling for VODs
            Fix: Annoying horizontal scrollbar due to poor styling of Kick
            Fix: Add more spacing for timestamps
        `
	},
	{
		version: '1.4.24',
		date: '2024-07-02',
		description: `
            Fix: Can send commands as plaintext messages when using chat button #89
            Fix: Pinned messages show double message #90
            Fix: Odd-pair brackets [ are incorrectly parsed as emote text messing up the message #91
            Fix: Rapid channel switching sometimes results in multiple input fields #92 @Nebride 
            Fix: Misaligned message user identity styling
            Fix: Revert truncating Kick emote names to underscore (because non-NTV users would see emote tooltips as underscore)
            Chore: Improved emoji spacing 
        `
	},
	{
		version: '1.4.23',
		date: '2024-07-02',
		description: `
            Fix: Input focus getting stolen on creators dashboard #85
        `
	},
	{
		version: '1.4.22',
		date: '2024-06-30',
		description: `
            There's a new fancy command /timer that allows you to track duration of something.
            Channels where you are not subbed now show unlockable subscribers emotes.
            Native Kick emotes now get rendered in user info modals when viewing message history (moderators only).
            Input now actually shows when you are timed out or banned with the appropriate message.
            Before deleted messages never really got deleted at all, message deletion now works correctly.
            Lastly fixed some bugs and annoyances.

            Fix: Emotes randomly not loading due to overrides
            Fix: Deleted messages aren't deleted #81
            Fix: No visual feedback when banned or timedout #82
            Fix: Message parts overflowing to empty next line
            Fix: Native kick emotes not rendering in user info modal #71
            Feat: Timer command to keep track of duration of something #83
            Feat: Show unlockable sub emotes for unsubbed viewers #80
            Feat: Add settings option to hide subscriber emotes when not subscribed
            Major refactor: Move Dexie & Fuse vendor scripts to ESM imports
            Refactor: Complete rewrite of emotes in message rendering
            Refactor: Twemoji got moved from content script to ESM import
            Refactor: Emotes no longer render in-place
            Chore: Adjust separator styling
        `
	},
	{
		version: '1.4.20',
		date: '2024-06-27',
		description: `
            Fix: Incorrect provider emote overrides #72
            Fix: Emotes sometimes dont load for VODs due to load event racing #79
            Fix: Backspace when selecting emotes deletes following emote as well
            Fix: Forward delete when selecting emotes deletes following emote as well
            Fix: Misaligned message usernames
        `
	},
	{
		version: '1.4.19',
		date: '2024-06-24',
		description: `
            It's now possible to enable/disable emote provider emotes for menu while still allowing them to render in chat. There's also new 7TV emote provider settings to enable/disable new 7TV global emotes & 7Tv channel emotes.

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
            Fix: Command completion lagging behind one key event on backspace
            Fix: Follow not using the correct slug
            Fix: Relative formatted datetimes get output as local locale instead of English
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
            User info modals (when clicking on usernames) are now fully replaced with new custom user info modals. The gift sub button has been implemented and is fully functional as well, which was a bit hard to hack in but it works well. There's also a new chat theme in settings options.

            Fix: Add gift a sub button to user info modal #70
            Fix: Keep user info modal within viewport on window resize
            Fix: User info requests failing because Kick has no consistency in username slug format
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
            After many hours of debugging Kasada I still managed to add in some new features as well for version 1.4.12. I already figured out how to deal with Kasada, however the solution sadly wasn't easily portable from Userscript to extensions. After trying a lot of prototype implementations it now works smoothly and Kasada won't be a limitation anymore. 

            I'm not sure how, but copy pasting works much more reliably now after fixing some clipboard issues. Lastly, after all this time struggling again and again in the end I still haven't been able to get it ready for Firefox because there's so many weird bugs in the Gecko engine due to standard Web APIs not working in |globalThis| that are fine in Chromium.

            Feat: Added new commands /follow, /unfollow, /mute, /unmute
            Feat: New settings option to always send quick emote holder emotes to chat immediately
            Feat: Ctrl + enter now allows sending of messages without clearing input #49
            Feat: User info modal now loads the actual channel subscribers badges instead of generic default
            -Feat-: Replace Kick user info modal with our new user info modal #60 (postponed until Gift a sub button #70 is implemented)
            Feat: Implement the VIP and MOD buttons for user info modal #68
            Feat: /raid being an alias for /host #53
            Fix: Kasasa anti-bot WAF causing API authorization issues #56
            Fix: Space after mention completion does not close the completion #58
            Fix: Command /poll cancel button does nothing #47
            Fix: Twemoji emojis not rendering in pinned messages #46
            Fix: Lowered /user commmand minimum allowed role. Viewers can now see a few commands available.
            Fix: Error when loading non-existing 7tv emotesets
            Fix: Moderator commands not parsing sentences correctly
            Fix: Copy & paste issues when copying from chat
            Fix: Added toast notifications for command errors
            Fix: User info modal gets pushed out of screen depending on chat message click coordinates #69
        `
	},
	{
		version: '1.4.11',
		date: '2024-06-07',
		description: `
            Feat: Added poll command, polls now finally work!
            Fix: Non-sub emotes not showing for broadcasters
        `
	},
	{
		version: '1.4.6',
		date: '2024-05-25',
		description: `
            Fix: Tooltips stuck on screen when searching for emotes
            Chore: Replaced outdated screenshots and video in readme
        `
	},
	{
		version: '1.4.5',
		date: '2024-05-24',
		description: `
            Feat: Added mute button to user info modal (actually works now)
            Fix: Styling issues with settings modal sidebar
            Fix: Background highlight accent color no longer working
            Fix: Settings rows of emotes not updating immediately, no longer requires page refresh
            Fix: Tooltips no longer working after removing jquery technical debt
            Refactor: Major refactor of dependency injections throughout entire codebase, now based on session contexts
            Chore: Removed setting hide Kick emote menu button
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
            Fix: First user message highlighting now uses ID instead of name to prevent triggering on name change
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
            Fix: Message history no longer working
        `
	},
	{
		version: '1.4.0',
		date: '2024-05-14',
		description: `
            The update this time has been a bit of a pain, because of Kick forcing scope creep where I'm progressively just completely replacing the entire website, but fixes were made and long standing important features that I put aside for a while have now finally been implemented.

            The primary focus of this update was to implement support for native Kick commands for moderators, and improve upon the overal UX and usability of the rather lacking native commands UX of Kick.

            Initially NipahTV employed shadow proxy elements that forwarded all inputs to the original Kick elements and simulated browser input events to make Kick submit the inputs to the servers. However this proved to be impossible to make work with Kick commands, so a network interface for the Kick API was necessary to send messages and commands to the Kick API servers directly, completely bypassing the Kick frontend browser client.

            However after doing that, some commands would popup some window with more information like /user and /poll, which promptly led to the conclusion that I'd need to implement all of this user interfacing as well.

            At least now we can finally start recommending NipahTV to moderators as well because Kick commands finally work.

            MODERATOR NOTE: There are still a couple missing command actions because low priority, they'll be added in due time. This regards the /poll command and the VIP & MOD buttons on the /user {{user}} modal. The VIP and MOD commands should work fine however.

            Feat: Added Kick network interface, messages and commands are now sent to Kick API directly.
            Feat: Added command completion strategy, native Kick commands are now largely supported.
            Feat: Added kick /user command
            Feat: Added ban action to user info modal
            Feat: Added channel user messages history to user info modal
            Feat: Added account creation date and profile pic to user info modal
            Feat: 7tv emotes in user info modal message history now get rendered
            Feat: Added follow/unfollow actions to user info modal
            Feat: Added timeout action to user info modal
            Feat: Added status page to user info modal
            Feat: Added toasts for error messaging
            Feat: Can now reply to messages
            Feat: Settings menu is now mobile friendly
            Fix: Emotes not inserting at correct anchored position in some edgecases.
            Fix: Unable to log in because of proxy fields blocking native Kick fields.
            Fix: Bug in REST requests causing 7tv load failure.
            Fix: User info modal showing message history in wrong chronological order
            Fix: Modals mouse drag events no longer working correctly and being positioned wrong
            Fix: Native send chat button showing double depending on options setting
            Fix: Typing text next to emote gets pushed past emote
            Fix: Stealing focus after keydown was too late preventing input from registering the change
            Chore: Lubricated my second-hand Nokia 9300i
            Chore: Implemented abstract navigatable scrolling view component
            Chore: Removed jQuery technical debt
            Refactor: Major refactor of SCSS structure
            Refactor: Decoupled input completor logic to NavigatableEntriesWindowComponent class.
            Refactor: Decoupled input completor logic to separate strategy classes.
        `
	},
	{
		version: '1.3.9',
		date: '2024-04-16',
		description: `
            Fix: Regression of 7tv emotes sometimes not rendering correctly in pinned messages
            Fix: Tab completion edgecase results in double space
            Fix: Submitting after typing exceptionally fast causes racing issue with text cutting off
        `
	},
	{
		version: '1.3.6',
		date: '2024-04-06',
		description: `
            Feat: Added Twemoji emoji rendering
            Fix: Ctrl+Arrow key caret navigation skips over entire inline text node instead of word #28
            Fix: Changing kick identity makes native emote holder reappear #29
            Fix: Rapidly clicking 7tv emotes in chat makes them disappear #30
        `
	},
	{
		version: '1.3.5',
		date: '2024-03-28',
		description: `
            Feat: Added settings option to enable first user message highlighting only in channels where you are a moderator
            Fix: Insert space after mention tab completions
            `
	},
	{
		version: '1.3.4',
		date: '2024-03-24',
		description: `
            Hotfix: User mentions completions not updating input controller's state
        `
	},
	{
		version: '1.3.1',
		date: '2024-03-24',
		description: `
            A major update, many things got completely rewritten and/or added. Many annoying caret navigation issues got solved by custom overriding behaviour implementations for input handling, including mouse cursor selections. Previously Ctrl/Ctrl+Shift handling was practically unusable. This now works intuitively and smoothly.

            The only remaining annoyance of which I'm not sure how to solve yet is mouse cursor selections starting on top of emotes and between emotes, because selections work by anchor and focus (start point and drag end point). However it is not obvious what the start point would be, when click and drag to start a selection with emotes. Arrow key selection handling however works flawless now.

            Another big change is that after endless issues particularily due to how Kick handles spaces, I decided to just completely get rid of padding spaces altogether. There's no more need for spaces between emotes or text at all.

            Feat: Reworked navigation behaviour for default caret navigation
            Feat: New behaviour implementation for Ctrl-key caret navigation
            Feat: New behaviour implementation for Shift-key selection handling
            Feat: New behaviour implementation for Ctrl+Shift-key caret selection navigation
            Feat: New behaviour implementation for mouse based emote selections
            Fix: Chat messages history no longer working due to settings ID change
            Fix: Replacing selections with emote cause corrupt component leftovers
            Fix: Update character count limit on input paste
            BREAKING CHANGE: Decided to remove all padding spaces from input components
            Major refactor: Decoupled all tab completion and message history logic away from UI
            Style: Reworked emote spacing
            Chore: Input emote character counting is now more efficient through debouncing
        `
	},
	{
		version: '1.2.17',
		date: '2024-03-22',
		description: `
            Feat: Input field now dynamically shows character count limit feedback
            Fix: Clipboard copy/paste space padding issues
            Chore: Improving Delete key handling (WIP)
        `
	},
	{
		version: '1.2.16',
		date: '2024-03-22',
		description: `
            Feat: New settings option whether to show quick emote holder
        `
	},
	{
		version: '1.2.15',
		date: '2024-03-21',
		description: `
            Fix: Alternating message highlighting overrides new user message highlighting
            Fix: In some cases text can be written into input components
            Fix: Backspace behaving weirdly deleting a lot more than it should
            Fix: Tab completor sometimes inserting redundant padding space
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
            Fix: Replies attached to messages not rendering
        `
	},
	{
		version: '1.2.10',
		date: '2024-03-20',
		description: `
            Fix: Subscriber emotes of other channels causing NTV to stop rendering emotes
            Fix: NTV not loading when not logged in on Kick
            Fix: Selection caret getting stuck when selecting in certain situations
        `
	},
	{
		version: '1.2.8',
		date: '2024-03-19',
		description: `
            Fix: Closing tab completion with enter or right arrow key resulted in double spaces
        `
	},
	{
		version: '1.2.7',
		date: '2024-03-19',
		description: `
            Fix: Closing tab completion with space resulted in double spaces
        `
	},
	{
		version: '1.2.6',
		date: '2024-03-19',
		description: `
            Fix: Links not rendering in chat messages
            Fix: Special characters getting HTML escaped
            Fix: Missing emote names for native Kick emotes in chat
            Fix: Improved emote spacing
        `
	},
	{
		version: '1.2.1',
		date: '2024-03-17',
		description: `
            It took me a little while (about 5 complete rewrites) since implementing a nearly full blown rich content text editor turned out to be quite a bit more tricky than thought because endless weird edge cases, but it's finally wrapped up and shipped. This now allowed me to fix most of the outstanding bugs.

            There's a couple new big features and improvements.
            A nearly full blown rich content text editor has been implemented for the input field for better and more reliable emote processing. It now works much better with copy pasting.
            It's now possible to enable first user message highlighting.
            It's now possible to change color of first user message highlighting.
            Manually typed emotes are now automatically completed upon closing the name with a space.
            Native Kick emotes have been optimized, it's now possible to send more native Kick emotes in a message than normally possible without NipahTV.
            Copy pasting has been completely reworked and works much better now.

            Feat: Increase higher possible amount of native Kick emotes sent than normal #21
            Feat: First new user message highlighting #9
            Feat: Render manually typed emotes #4
            Feat: First user message highlighting now works
            Fix: Native kick chat identity button missing from shadow proxy input field #20
            Fix: Arrow keys get blocked by message history when caret is right after emotes #17
            Fix: Chat input text is not same height as inline emotes, causing subtle small shifts in vertical caret positioning #16
            Fix: Pasting emotes inserts them at start of input line instead after Caret position #15
            Fix: Username mentions lack extra padding after tab completion #14
            Fix: Tooltips no longer working with new structure
            Fix: Clicking emotes in chat no longer working with new emote structure
            Fix: Forward deletion with caret inside component not working correctly
            Fix: Caret positioning right before emote component did not get pushed out
            Fix: Incorrect caret positioning during insertions
            Fix: Selection caret should not go inside input components
            Fix: Reimplemented clipboard copy & paste
            Fix: Copy/paste gets blocked #13
        `
	},
	{
		version: '1.1.12',
		date: '2024-03-03',
		description: `
            Feat: Added settings option to change quick emote holder rows
            Fix: prevent Kick from stealing focus from chat input
            Chore: Changed order of Emoji emoteset to lower
        `
	},
	{
		version: '1.1.10',
		date: '2024-03-03',
		description: `
            Fix: emotes registering double in quick emote holder because id conflicts.
            Refactor: Major refactor of all provider specific emote ids to name hashes for better future provider compatibility and emote reliability.
            Chore: Changed database engine from LocalStorage to NoSQL IndexedDB.
        `
	},
	{
		version: '1.1.8',
		date: '2024-03-03',
		description: `
            Feat: Added tooltips for emotes in chat
            Feat: Added clicking emotes inserts them to chat input
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
            Fix: loading pages without chat input causing the interface to duplicate
        `
	},
	{
		version: '1.1.3',
		date: '2024-03-02',
		description: `
            Fix: tab completion not doing initial scroll
            Fix: tab completion shift & tab key not working correctly because @ mentions
        `
	},
	{
		version: '1.1.2',
		date: '2024-03-02',
		description: `
            Fixed some issues, particularily regarding the tab completion and chat history behaviour and the new Kick update. 

            The input fields and chat button have now been completely replaced with new proxy fields. This was done to work around Kick messing with the input field and buttons. As a result I was also force to implement inline emote rendering, so picking emotes now will actually show the emotes in the input field. Typing emotes manually however will not automatically turn them into inline emotes just yet.

            @ username mentions currently is not implemented yet either.

            The emote tab completion has been completely reworked with more contextfully meaningful searching by splitting up all emotes into semantical groupings (e.g. nebrideLove -> ["nebride", "love"]), so that tab completions and searching for emotes can better find the most relevant emotes.

            There are a few new settings options like enabling search bias for current/other channel emotes, menu button styles, etc.

            A good amount issues and behaviour quirks have been fixed like having to press keys twice to navigate chat history, tab completion menu navigation and scrolling, etc.
        `
	}
]
