<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/Xzensi/NipahTV">
    <img src="assets/img/logo_full.png" alt="NipahTV" height="90">
  </a>

  <h3 align="center">Better Kick and 7TV Emote Integration for Kick</h3>

  <p align="center">
    <br />
    <a href="#demo-video">View Demo</a>
    ·
    <a href="https://github.com/Xzensi/NipahTV/issues">Report Bug</a>
    ·
    <a href="https://github.com/Xzensi/NipahTV/issues">Request Feature</a>
  </p>
  <br />
  
  <img src="demo/screenshot_2.png" />
  <img src="demo/screenshot_3.png" />
</div>

<br />

## About The Project

NipahTV aims to enhance the emote integration experience within Kick chat by providing support for multiple emote providers and improving the user interface. Current options for emote integration in Kick are limited and lack support for multiple emote sources. NipahTV addresses these shortcomings by offering a better interface and compatibility with multiple emote providers.

<b>Please note:</b> This project is under active development and may contain bugs. Feedback is appreciated as we continue to refine and improve NipahTV.

<a name="demo-video"></a>
<br />

<div align="center">
  <video src="https://github.com/Xzensi/NipahTV/assets/14015478/45d492b6-a51c-4a2c-92fe-45aaf3899b81" align="center" width="336"></video>
</div>
<br />

## Getting NipahTV

Refer to this [wiki page](https://github.com/Xzensi/NipahTV/wiki/Installation-instructions) for installation instructions (it'll be simple, I promise).

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
-   [x] Settings option for quick emote holder height.

-   BetterTTV provider support
-   Settings option to sort by size or not.
-   Settings option to add settings panel to kick menu to keep UI tidy.
-   Settings option for most used emotes tracking to be global instead of per channel.
-   Settings option to automatically expand quick emote holder on hover.
-   More to come...

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

## License

Distributed under the AGPL-3.0-only License. See `LICENSE` for more information.
