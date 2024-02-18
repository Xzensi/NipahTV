<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/Xzensi/nipah-chat">
    <img src="dist/logo_full.png" alt="Nipah" height="90">
  </a>

  <h3 align="center">Better Kick and 7TV Emote Integration for Kick</h3>

  <p align="center">
    <br />
    <a href="https://github.com/Xzensi/nipah-chat/demo/demo.mp4">View Demo</a>
    ·
    <a href="https://github.com/Xzensi/nipah-chat/issues">Report Bug</a>
    ·
    <a href="https://github.com/Xzensi/nipah-chat/issues">Request Feature</a>
  </p>
  <br />

  <img src="demo/screenshot_2.png">
  <img src="demo/screenshot_3.png">
  <video src="demo/demo.mp4" width="336"></video>
</div>

<br />

## About The Project

Nipah aims to enhance the emote integration experience within Kick chat by providing support for multiple emote providers and improving the user interface. Current options for emote integration in Kick are limited and lack support for multiple emote sources. Nipah addresses these shortcomings by offering a better interface and compatibility with multiple emote providers.

<b>Please note:</b> This project is actively under development and may contain bugs. Your patience and feedback are appreciated as we continue to refine and improve Nipah.

## Getting Started

To use Nipah, you'll need to install a userscript manager like Violentmonkey. Follow the links below to install the manager for your browser: [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/), [Edge](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao).

### Installation

Currently, tab completion and emotes-in-chat rendering are not yet implemented but are on the way. For the time being, you still need to have the 7TV extension installed and enabled for 7TV emotes to render in chat. You can find the 7TV extension here: [Chrome](https://chromewebstore.google.com/detail/7tv/ammjkodgmmoknidbanneddgankgfejfh), [Firefox](https://7tv.app/).

To install the userscript, click on the following link: [Nipah Chat client](dist/client.user.js)

## Roadmap

-   [x] Support emotes from multiple emote providers (currently supported: Kick, 7TV).
-   [x] Quick emote holder for rapid emote insertion.
-   [x] Fuzzy emote searching that considers your most used emotes.
-   [x] Automatically saves your most used emotes per channel.
-   [x] Insert emotes at caret position.
-   [x] Ctrl+click in quick emote holder to send emotes immediately.
-   [x] Ctrl+spacebar to open emote menu.

-   Chat emotes rendering, so that 7TV extension does not need to be enabled.
-   Emote tab completion (incompatible with 7TV extension).
-   BetterTTV provider support
-   Settings option to sort by size or not.
-   Settings option for quick emote holder height.
-   Settings option to add settings panel to kick menu to keep UI tidy.
-   Settings option for most used emotes tracking to be global instead of per channel.
-   More to come...

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the AGPL-3.0-only License. See `LICENSE` for more information.
