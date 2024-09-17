<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://nipahtv.com">
    <img src="assets/img/logo_full.png" alt="NipahTV" width="650">
  </a>

  <h3 align="center">A Better Kick and 7TV Emote Extension for Kick</h3>

  <p align="center">
    <br />
    <a href="https://nipahtv.com">Releases</a>
    ·
    <a href="https://discord.gg/KZZZYM6ESs">Discord Community</a>
    ·
    <a href="https://github.com/Xzensi/NipahTV/issues">Request Feature</a>
    ·
    <a href="https://github.com/Xzensi/NipahTV/issues">Report Bug</a>
  </p>
  <br />
  
  <table>
    <tbody>
      <tr>
        <td><img src="demo/screenshot_2.png" /></td>
        <td><video src="https://github.com/Xzensi/NipahTV/assets/14015478/45d492b6-a51c-4a2c-92fe-45aaf3899b81"></video></td>
      </tr>
    </tbody>
  </table>
</div>

<br />

Transform your Kick chat experience with new features, emotes and performance improvements.

NipahTV integrates emotes from multiple providers, including native Kick and 7TV emotes, eliminating the need for multiple emote extensions.

Key Features:

-   User-friendly emote menu
-   Global and per-channel emotes for both native Kick and 7TV
-   Improved moderator experience with enhanced Kick commands
-   Message history feature for re-sending messages
-   Quality of life options like message highlighting

<b>Please note:</b> This project is under active development and may contain bugs. Feedback is appreciated as we continue to refine and improve NipahTV.

<br />

## Where to download?

Releases are available at [NipahTV.com](https://nipahtv.com)

Or come say hi at our [Discord Community server](https://discord.gg/KZZZYM6ESs)

<br />

## Roadmap

-   [x] Support emotes from multiple emote providers (currently supported: Kick, 7TV).
-   [x] Quick emote holder for rapid emote insertion.
-   [x] Fuzzy emote searching that considers your most used emotes.
-   [x] Automatically saves your most used emotes per channel.
-   [x] Insert emotes at caret position.
-   [x] Ctrl+click in quick emote holder to send emotes immediately.
-   [x] Ctrl+spacebar to open emote menu.
-   [x] Chat emotes rendering, so that 7TV extension does not need to be enabled.
-   [x] Emote tab completion (incompatible with 7TV extension).
-   [x] Show emote sets of other subscribed kick channels other than the current one.
-   [x] Revamped moderator commands
-   [x] Settings option for quick emote holder height.

-   BetterTTV provider support
-   More to come...

<br />

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br />

## How to set up the project for development

First install all dependencies `npm install`. There are three different ways to build the project:

1. Use the default vscode build task to tsc typecheck the project. Use the following keybind to automatically run it on save:

    ```json
    [
    	{
    		"key": "ctrl+s",
    		"command": "runCommands",
    		"when": "editorTextFocus && !editorReadonly && resourceExtname == .ts",
    		"args": {
    			"commands": [
    				"editor.action.formatDocument",
    				"workbench.action.files.saveAll",
    				"workbench.action.tasks.build"
    			]
    		}
    	}
    ]
    ```

    Run `npm run start` to start the development server and automatically build the project on file changes.

2. Run `npm run startWithTsc` to have all outputs in one shared terminal.

3. Seperately run `npm run watch:tsc`, `npm run watch:dev-esbuild`, `npm run watch:sass`, `npm run serve-files`.

The project will be built to the `dist` folder as `debug.user.js`. I recommend using Firefox for development, as it is capable of tracking for local file changes of `debug.user.js`.

Finally `npm run build` will build the project for production when merging to master branch.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
