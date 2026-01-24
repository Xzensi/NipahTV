export const CHANGELOG: {
	version: string
	date: string
	description: string
}[] = [
	{
		version: '1.5.84',
		date: '2026-01-24',
		description: `
                  Feat: 7TV channel emote changes now show added/removed messages in chat
                  Feat: Added setting to disable channel emote added/removed messages in chat
            `
	},
	{
		version: '1.5.83',
		date: '2025-12-27',
		description: `
                  Just a little fix before closing off the year 2025. Happy holidays everyone!

                  Fix: NipahTV not loading when in mobile split screen mode
            `
	},
	{
		version: '1.5.82',
		date: '2025-12-11',
		description: `
                  Fix: Celebration share button styling
            `
	},
	{
		version: '1.5.81',
		date: '2025-12-02',
		description: `
                  Feat: Make user info modal username handle better compatible with other extensions @igorovh
            `
	},
	{
		version: '1.5.80',
		date: '2025-11-29',
		description: `
                  Feat: Add visual cues of favorited emotes in emote menu
                  Fix: Kick website update has broken chat overlay mode transparency
            `
	},
	{
		version: '1.5.79',
		date: '2025-11-27',
		description: `
                  Fix: Kick website changes to chat has broken UI
            `
	},
	{
		version: '1.5.78',
		date: '2025-09-14',
		description: `
                  The issues with channel points menu are now fixed.

                  Fix: UI components not getting restored correctly when nuked
                  Fix: Share celebrations not showing correctly when quick emotes holder is disabled
                  Fix: Channel points menu causing chat footer to become fully transparent in theatre mode
                  Chore: Improved UI reload handling when UI context is lost
            `
	},
	{
		version: '1.5.77',
		date: '2025-09-11',
		description: `
                  Kick's new website update causes NTV to reload itself in attempt of restoring state when the channel points menu is opened. A temporary workaround has been applied but it's not a perfect fix yet. At least it doesn't cause messages to be duplicated anymore because of it.

                  Fix: NTV not loading on moderator dashboard
                  Fix: Applied a temporary workaround for channel points menu causing NTV to reload
            `
	},
	{
		version: '1.5.75',
		date: '2025-08-28',
		description: `
                  Fix: Kick randomly throwing "Page not found." errors on settings pages when navigating too fast
                  Fix: Emote tooltips sometimes getting stuck on screen
                  Fix: Emote menu not refreshing emoteset after emote override has been registered #228
            `
	},
	{
		version: '1.5.74',
		date: '2025-06-14',
		description: `
                  Fix: User message history not loading correctly
                  Fix: Settings modal showing under emote menu
                  Chore: Improved commands menu UI
                  Chore: Refine setting description
            `
	},
	{
		version: '1.5.73',
		date: '2025-06-05',
		description: `
                  Feat: Added support for command /prediction
                  Feat: Added support for command /category
            `
	},
	{
		version: '1.5.72',
		date: '2025-04-14',
		description: `
                  Fix: Kick's new channel points button swallowing our menu button
            `
	},
	{
		version: '1.5.71',
		date: '2025-04-09',
		description: `
                  Fix: Kick broke share anniversary celebrations
            `
	},
	{
		version: '1.5.70',
		date: '2025-03-14',
		description: `
                  Fix: Creator dashboard view no longer working
                  Chore: Decreased NTV badge size a tiny bit
            `
	},
	{
		version: '1.5.69',
		date: '2025-02-28',
		description: `
                  Fix: Kick's chat submit button no longer hiding due to Kick website changes
            `
	},
	{
		version: '1.5.68',
		date: '2025-01-28',
		description: `
                  Looks like Kick made some unfathomably dumb change again where someone in their infinite wisdom decided it would be a good idea to steal focus away from the chat input when you press the arrow keys, just to scrub the stream back and forth. I patched it so it doesn't steal focus anymore from chat input.

                  Fix: Kick stealing focus on arrow key during input
            `
	},
	{
		version: '1.5.67',
		date: '2025-01-21',
		description: `
                  Turns out I done a bit of an oopsie and nobody told me about it. I accidentally commented out the share celebration netcode, that's why sharing celebrations didn't actually send the message.. Whoops! It's fixed now, so go ahead and share those celebrations! 🎉

                  Please do report issues or bugs you encounter! I can't fix issues nobody bothers to report. 😅

                  Fix: Uncommented the share celebration netcode
            `
	},
	{
		version: '1.5.66',
		date: '2025-01-11',
		description: `
                  Added partial support for sub anniversary celebrations. Still need more test data to fully implement this feature. If you have this feature on any of your subbed channels, please reach out to me on the NTV Discord Community server (https://discord.gg/u2gEQZrB6h) if you're willing to help provide some screenshots. This will help me implement support for this feature in NTV. Thanks in advance!

                  Feat: Partial support for sub anniversary celebrations
            `
	},
	{
		version: '1.5.65',
		date: '2025-01-11',
		description: `
                  Temporarily hidden the share subscription anniversary feature for now because it only gets in the way. Now I got the necessary data to implement it, I'll ship it tomorrow.

                  Fix: Temporarily hiding the share celebration feature
                  Fix: Native Kick quick emotes holder sometimes not hiding properly on page load
            `
	},
	{
		version: '1.5.63',
		date: '2025-01-04',
		description: `
                  It's a new year and a new update! I hope you all had a great holiday season and are ready for a fresh new year. I'll kick it off with some fixes as I get back to picking up the pace. The next milestone still remains the complete rewrite of the extension with the new UI framework as version 2.0. As you can imagine this is quite a bit of work so don't think I'm dead if you don't see updates for a little while. I'm still here, just working on the big stuff!

                  I'll still be picking up important bug fixes in the meantime, so don't hesitate to report any issues you encounter.

                  ===! HELP WANTED !===
                  That being said, Kick has recently rolled out a new update that allows you to share your sub anniversary in chat. As I'm currently unable to reproduce this, I'm looking for someone who can help me out with this. If you currently have this button on any of your subbed channels, please reach out to me on the NTV Discord Community server (https://discord.gg/u2gEQZrB6h) if you're willing to help provide some screenshots. This will help me implement support for this feature in NTV. Thanks in advance!
                  ===! HELP WANTED !===

                  Feat: Re-implement user mute/block feature after Kick broke it, now actually remembers muted users #191
                  Fix: New Kick update breaking admin dashboard again #195
                  Fix: Unable to copy emojis in chat to clipboard #194
                  Fix: Broken 7TV emoteset icon #197
                  Fix: Stream buffering overlay showing on top of chat #159
            `
	},
	{
		version: '1.5.62',
		date: '2024-11-07',
		description: `
                  Fix: Video alignment setting not working
                  Fix: Video control bar overlapping left side positioned chat
                  Fix: Raised network request timeout to absurdly high levels
            `
	},
	{
		version: '1.5.61',
		date: '2024-11-07',
		description: `
                  Fix: Re-arranging favorites resulting in randomized order
                  Fix: 7TV event API not reconnecting
                  Fix: Issue in toggling quick emote holder settings
                  Chore: Minor changes to settings menu structure
            `
	},
	{
		version: '1.5.60',
		date: '2024-11-05',
		description: `
                  Feat: New settings option to move chat to left side of layout
            `
	},
	{
		version: '1.5.59',
		date: '2024-11-05',
		description: `
                  Fix: 7TV emotes without files breaking runtime
                  Fix: Emote sets sometimes not loading due to network/UI racing conditions
                  Fix: Emote tooltip images not working for other channel Kick emotes you are not subscribed to
                  Fix: Settings menu not scrolling to top correctly
                  Chore: Adjusted event API reconnect max duration to 2 hours
                  Chore: Turned my doorbell into a time machine
            `
	},
	{
		version: '1.5.57',
		date: '2024-11-03',
		description: `
                  Fix: Clip links not working in chat messages
                  Fix: Another attempt at fixing the async session reload issues
            `
	},
	{
		version: '1.5.56',
		date: '2024-11-03',
		description: `
                  Fix: Lack of previous session sometimes breaking navigation

            `
	},
	{
		version: '1.5.55',
		date: '2024-11-03',
		description: `
                  I'm currently preparing for a big rewrite of the UI framework, which is a big part of the codebase, because I want to get rid of technical debt and keep the codebase more maintainable. There's currently a lot of legacy code due to decisions made during the rapid prototyping and version iterating of the early stages of NipahTV. This will take some time, but it will allow me to better support features like translating NipahTV to other languages and finally do a full replace of the chat, instead of the dirty injection method it's doing now (causing all kinds of unsolvable issues).

                  But before that, enjoy the new features and fixes! We now have support for 7TV nametag paints and 7TV supporter badges.

                  Feat: Added support for 7TV namepaint cosmetics
                  Feat: Added support for 7TV supporter badge cosmetics
                  Feat: Extensions can now manage private database
                  Fix: Settings menu modal not scrolling to top on category panel change
                  Fix: Page navigation resulting in sessions firing too many session destoyed events
                  Fix: Temporary UI reload fix re-running too fast
                  Fix: Double message history after page navigation
                  Fix: Weird names breaking name selectors
                  Fix: False positives for VOD URIs
                  Chore: Refactored 7TV Event API from SSE to websockets
                  Chore: Added boilerplate example extension

            `
	},
	{
		version: '1.5.54',
		date: '2024-10-24',
		description: `
                  Fix: Zero width emotes overflowing emote container
                  Fix: Windows emoji bar unrecognized input events
                  Fix: Short UI init timeouts sporadically resulting in partially loaded UI states
                  Fix: Input requiring more checks for empty content events
                  Fix: Compositioned input events not inserting content correctly into input
                  Fix: Re-aligned the stars to improve system performance
            `
	},
	{
		version: '1.5.53',
		date: '2024-10-23',
		description: `
                  Fix: Raised request timeout from 7s to 15s
            `
	},
	{
		version: '1.5.52',
		date: '2024-10-22',
		description: `
                  Fix: Emote sets re-rendering all emote sets for every set added
                  Fix: 7TV user not found showing unnecessary error toast
                  Fix: Emote completions not closing nav window on cursor click
            `
	},
	{
		version: '1.5.51',
		date: '2024-10-20',
		description: `
                  Fix: Quick emote holder favorites not correctly updating new loaded emote sets
            `
	},
	{
		version: '1.5.50',
		date: '2024-10-20',
		description: `
                  Fix: Allow faster asynchronous non-blocking loading of emote providers
                  Fix: Emote provider outtage potentially resulting in data loss of recently used emotes and stored favorites due to scheduled database cleanup
            `
	},
	{
		version: '1.5.48',
		date: '2024-10-20',
		description: `
                  Feat: Added new settings options for message styling
                  Feat: Added new settings options for emotes styling
                  Fix: Default message and emote styling not matching native Kick
                  Fix: Zero-width emotes not centering when wider than emote
                  Fix: Clipboard copy not working for emotes in input field
                  Style: Improved settings modal looks
                  Refactor: Re-identified settings keys
            `
	},
	{
		version: '1.5.47',
		date: '2024-10-13',
		description: `
                  Fix: Incorrect quick emote holder height calculation
            `
	},
	{
		version: '1.5.46',
		date: '2024-10-13',
		description: `
                  Fix: Emotes getting slightly clipped due to overflow
                  Fix: Being able to click sub emotes in chat of current channel when not subbed
                  Fix: Slightly improved new messages showing out of view
                  Fix: Chat overlay mode buttons not translucent #180
                  Fix: Low quality emote tooltip images
                  Refactor: Isolated 7TV integration as extension
                  Refactor: Full restructure of project from pattern-based to semantic-based organization
                  Style: Quick emote holder emotes are now same size as in chat
                  Style: Changed default highlight color
                  Style: Tightened spacing of chat footer and message input
                  Style: Larger emote tooltip images
                  Style: Fixed the alternating background colors of message input on focus states
                  Chore: Turned my doorbell into a time machine
                  Chore: Added warning announcement for lost stragglers on the old Kick popout chatroom page
            `
	},
	{
		version: '1.5.45',
		date: '2024-10-11',
		description: `
                  Fix: Empty favorites for channels where favorited emotes do not apply
                  Fix: Subscriber emotes showing in quick emotes holder when not subscribed
                  Fix: Subscriber emotes showing in input completion when not subscribed
                  Fix: Emote provider setting being mixed up with wrong setting key
                  Fix: Kick emote provider current channel setting not applying
                  Fix: Quick emote holder and input completors not respecting emote provider enabled emote settings
                  Style: Reduced message lines and emote spacing
                  Style: Reduced message badge sizes
            `
	},
	{
		version: '1.5.44',
		date: '2024-10-06',
		description: `
                  Fix: Quick actions not showing when timestamps are disabled for creator & moderators view
                  Fix: Timestamps showing after quick actions for creator & moderators view
                  Fix: Clicking reply message not focussing input #178
                  Fix: Certain settings like timestamps not applying to VOD pages
            `
	},
	{
		version: '1.5.43',
		date: '2024-10-04',
		description: `
                  Fix: Send emotes immediately setting shouldn't apply when replying
                  Fix: Chat message seperator setting not updating livetime
            `
	},
	{
		version: '1.5.42',
		date: '2024-10-03',
		description: `
                  Fix: Reply message wrappers not cleaning up after reply stacking invisible height
            `
	},
	{
		version: '1.5.39',
		date: '2024-10-03',
		description: `
                  Finally fixed the reply message behaviour that got broken due to the Kick website update. For now it only has effect on channel chatrooms, and not yet the creator & moderator dashboard pages. I'm still waiting for when Kick will actually finish the update for the creator & moderator dashboard pages. But if they don't, I'll make it work with the old layout that still gets loaded on those pages as well.

                  Fix: Broken reply message behaviour due to Kick website update
                  Style: Removed background color on quick emote holder emotes
            `
	},
	{
		version: '1.5.37',
		date: '2024-09-30',
		description: `
                  Fix: Correct emote sizes after restructure
                  Fix: Adjust chat message line spacing
                  Fix: Emote menu sidebar collapses in height when searching for emotes #173
                  Style: Reduced Kick footer padding on top of quick emote holder
            `
	},
	{
		version: '1.5.36',
		date: '2024-09-30',
		description: `
                  Fix: Channel Zero-Width emotes not working
                  Fix: Favorited emotes not sizing correctly in emote menu
                  Fix: Regression of issue #131
                  Fix: Temporary fix to reload UI when components get nuked by Kick
                  Chore: Adjusted emote menu emotes row and column gap distance
            `
	},
	{
		version: '1.5.35',
		date: '2024-09-29',
		description: `
                  Fix: Kick emotes not rendering in moderator dashboard view
            `
	},
	{
		version: '1.5.34',
		date: '2024-09-28',
		description: `
                  A hot new update introducing support for Zero-Width emotes! Along with bug fixes, quite a lot changed under the hood. If I missed any new bugs, as always please do report them so I can fix it.

                  Feat: Added support for Zero-Width emotes
                  Fix: Sanitize emote names to prevent potential XSS injections
                  Fix: Clicking on videos tab on channel unloads NTV #165
                  Fix: User info card showing on top of sub gifting modal
                  Fix: Partial page reloads causing double message behaviour
                  Fix: Ugly temporary reply behaviour not clearing its state correctly
                  Fix: Kick showing elements in certain chat states
                  Fix: Ordering favorites not working correctly
                  Fix: Unloading session not clearing render message cleanup interval
                  Fix: Broken SVG markup
                  Refactor: Reworked message content rendering
                  Refactor: Solidified structure of emotes
                  Refactor: Minor relabeling of stuff
                  Chore: Replaced my floorboards with chocolate bars
                  Chore: Finetuned chat message rendering performance
            `
	},
	{
		version: '1.5.32',
		date: '2024-09-26',
		description: `
                  Fix: Verified badge not showing in moderator dashboard view
                  Fix: Kick bug where hiding pinned message cause horizontal scrollbar to show
            `
	},
	{
		version: '1.5.31',
		date: '2024-09-25',
		description: `
                  Fix: Inconsistent badge element structure in old Kick website structure causing chat rendering to crash
            `
	},
	{
		version: '1.5.30',
		date: '2024-09-25',
		description: `
                  NipahTV now works again on the moderator & creators dashboard pages! If you have any issues here, please do report them. It's now also possible to completely disable NTV on moderator dashboard & creator pages for those that want this.

                  Feat: Added settings option whether to render chat messages
                  Feat: Added moderator setting to disable NTV on moderator & creator dashboard pages
                  Fix: NTV no longer loading for moderator & creator dashboard pages after Kick website update
                  Fix: Metadata in API calls causing Kick servers to shit themselves for no reason making messages broken when pinned
                  Fix: Disable steal focus feature for VODs
                  Fix: REST requests not returning data correctly
                  Refactor: Reworked native Kick chat input fallback mechanism for reply behaviour
                  Chore: Moved settings to new moderator category
                  Chore: Conducted a full-scale rescue mission for my missing socks
            `
	},
	{
		version: '1.5.29',
		date: '2024-09-24',
		description: `
                  Fix: Safari seems to have partial support for Avif causing issues
            `
	},
	{
		version: '1.5.28',
		date: '2024-09-24',
		description: `
                  Fix: Added WebP fallback support for browsers that do not support the modern AVIF standard
            `
	},
	{
		version: '1.5.27',
		date: '2024-09-22',
		description: `
                  Fix: Incorrect sub emote subscribers status check for other channels locking them
            `
	},
	{
		version: '1.5.26',
		date: '2024-09-22',
		description: `
                  Feat: Settings modal now shows update info and button to trigger manual update
                  Fix: Firefox add-on updates automatically triggers reload of everything resulting in double message rendering when sending messages #153
                  Fix: ContentEditableEditor not reprocessing input on clipboard cut events #158
                  Fix: Expired faved sub emotes not showing as locked
                  Fix: Unability to unfavorite expired faved sub emotes
                  Fix: Recently used emotes showing expired sub emotes
                  Fix: Not being able to drag and reorder locked faved emotes
            `
	},
	{
		version: '1.5.25',
		date: '2024-09-20',
		description: `
                  Chore: Added link to extension compatibility warning
            `
	},
	{
		version: '1.5.24',
		date: '2024-09-20',
		description: `
                  Chore: Add extension compatibility check
            `
	},
	{
		version: '1.5.23',
		date: '2024-09-18',
		description: `
                  Fix: Change announcement button label
            `
	},
	{
		version: '1.5.22',
		date: '2024-09-18',
		description: `
                  Fix: Pinned messages not rendering hyperlinks #151
                  Fix: NTV logo image not loading for emote menu button
            `
	},
	{
		version: '1.5.21',
		date: '2024-09-18',
		description: `
                  Fix: VODs not rendering message emotes on new Kick website
                  Fix: Reply and mentions not highlighting messages
                  Fix: Pinned messages not rendering on new Kick website #150
                  Fix: Improve mention completion behaviour #143
                  Fix: Improve color emote completion behaviour
            `
	},
	{
		version: '1.5.20',
		date: '2024-09-15',
		description: `
                  Fix: Add label to settings category
                  Chore: Added Discord community server launch announcement
            `
	},
	{
		version: '1.5.19',
		date: '2024-09-15',
		description: `
                  Fix: Replying sometimes get stuck in native Kick chat input
            `
	},
	{
		version: '1.5.18',
		date: '2024-09-15',
		description: `
                  Feat: Added settings option for moderator quick actions
                  Feat: Can now change alignment of stream video in chat overlay mode
                  Fix: Added back in moderator quick action (delete, timeout, ban)
                  Fix: Changing emote menu button setting not livetime updated
                  Fix: Chat overlay mode chat position setting
                  Fix: Deleted messages showing label out of place
                  Chore: Added new emote menu button style setting
            `
	},
	{
		version: '1.5.17',
		date: '2024-09-15',
		description: `
                  Major issue solved, finally figured what was causing the page to crash when replying to messages.

                  Feat: Added setting whether to show recently used emotes in the quick emotes holder
                  Fix: Replying to messages randomly crashing the page #126
                  Fix: Emote tooltips getting cut off due to overflow
                  Fix: Messages with emojis not rendering correctly
                  Fix: Quick emotes holder spacer showing when favorited or recent emotes are empty
            `
	},
	{
		version: '1.5.16',
		date: '2024-09-14',
		description: `
                  Feat: Automatic mention completions instead of <TAB> key triggered
                  Fix: Double processed chat messages on URL change when session UI is not destroyed #131 
                  Fix: Favorite emotes showing saved image instead of current channel image #134
                  Fix: <COLON> key emote completions only triggering after first letter
            `
	},
	{
		version: '1.5.15',
		date: '2024-09-14',
		description: `
                  Feat: Make chat message lines consistent in height allowing emote overlap
                  Fix: Sometimes unable to click emotes in chat #137
                  Fix: Hide quick emotes holder when replying
                  Fix: Chat message spacing setting
                  Fix: Prevent zalgo text from overflowing messages
                  Chore: Prevent darkening of chat input on focus
            `
	},
	{
		version: '1.5.14',
		date: '2024-09-13',
		description: `
                  Fix: Commands not showing notification toasts
                  Fix: Followonly command has changed definition
                  Fix: Unreliable network requests due to invalid session token
            `
	},
	{
		version: '1.5.13',
		date: '2024-09-13',
		description: `
                  Fix: Firefox add-on works again
                  Fix: Reply-to-me message highlighting
                  Fix: UI elements not loading when Kick native quick emote holder disabled
            `
	},
	{
		version: '1.5.12',
		date: '2024-09-13',
		description: `
                  Looks like the chat message rendering is finally stable again now with minimal jittering and acceptable performance on fast moving chats.

                  Fix: User mention auto-completion not working
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
