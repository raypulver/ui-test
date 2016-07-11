# TMNT

## Overview

Initial Note: It is not necessary to install the project as it is currently live at [http://peacechamp.com:8088](http://peacechamp.com:8088)

This application will serve as a demo of a dynamic, data-driven, single page application written entirely in JavaScript that meets the following criteria:

* The application runs on IE7+, as well as the newer versions of Firefox and Chrome
* The only runtime dependency is jQuery 1.12
* The only images and data served to the application are what was provided
* Exactly two views in the application, one which displays an interface to select a turtle and one which gives details on the selected turtle

### Additional presentational features

* Dynamic loading of turtle data via XHR -- i.e. data is transformed into JavaScript objects from its original XML representation at runtime, main application view slides in upon data load
* Hash-based routing, application can navigate to any turtle by passing the lowercase name of the turtle to the hash after URL, support for full page refresh
* Animated transitions between views, including one for a manual hash change
* CSS3 effects and animations
* Graceful degradation to provide support for IE7

### Main code features

All JS code is in `application.js`, the markup in `index.html`, and the LESS stylesheets in `styles.less`

Note: This application professes one LESS dependency bundled with the package called [LESS Elements](http://lesselements.com), which I decided to use for ease of supporting CSS3 effects across older versions of Chrome and Firefox, however the mixins used are trivial and simply add vendor prefixes.

* All modules organized into and returned by closures
* Util module -- exports all needed functions from ES5 and beyond, either with the native implementation (if available) or a shim which I have written
* Store module -- simple implementation of Redux state container compatible with IE7, offering a `combineReducers` implementation and a subscriber interface; the application component subscribes to updates in the Store and renders its child components using its data.
* Component base class -- Implementors of a `Component` may provide overriden `compile`, `link`, and `render` functions, but `Component.prototype` exports these functions as `_compile`, `_link`, and `_render`, so that a subclass may easily call these functions if they are overridden. All presentation components, including the application object itself, inherit from `Component.prototype`
* All asynchronous functions, such as XHR or animations, return an instance of `jQuery.Deferred`, which is the simple Promise-like object provided by jQuery.
* Test suite for shims and Store object provided with install

## Installation

Clone this repo, and in the project directory run

```shell
npm install
```

## Usage

In the project directory, run

```shell
npm start
```

This will deploy a server which will be accessible from the host machine on [http://localhost:8088](http://localhost:8088)

Edit `config.json` to change port or hostname.

## Testing

The tests are run via Karma on PhantomJS. Simply run

```shell
npm test
```

to run the suite.

## Development

To re-build CSS, run

```shell
npm run build
```
