# html-reporter

Plugin for [gemini](https://github.com/gemini-testing/gemini) which is intended to
aggregate the results of tests running into html report.

You can read more about gemini plugins [here](https://github.com/gemini-testing/gemini/blob/master/doc/plugins.md).

## Installation

```bash
npm install html-reporter
```

## Usage

Plugin has following configuration:

* **enabled** (optional) `Boolean` – enable/disable the plugin; by default plugin is enabled
* **path** (optional) `String` - path to directory for saving html report file; by
default html report will be saved into `gemini-report/index.html` inside current work
directory.
* **errorsOnly** (optional) `Boolean` - report with only failed tests; by default `false`
* **baseHost** (optional) - `String` - it changes original host for view in the browser; by default original host does not change

Also there is ability to override plugin parameters by CLI options or environment variables
(see [configparser](https://github.com/gemini-testing/configparser)).

### Usage

Add plugin to your `gemini` config file:

```js
module.exports = {
    // ...
    system: {
        plugins: {
            'html-reporter': {
                enabled: true,
                path: 'my/gemini-reports',
                errorsOnly: false,
                baseHost: 'test.com'
            }
        }
    },
    //...
}
```

## Testing

Run [mocha](http://mochajs.org) tests:
```bash
npm run test-unit
```

Run [eslint](http://eslint.org) codestyle verification
```bash
npm run lint
```
