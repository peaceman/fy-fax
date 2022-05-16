oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g fy-fax
$ fy-fax COMMAND
running command...
$ fy-fax (--version)
fy-fax/0.0.0 darwin-x64 node-v18.0.0
$ fy-fax --help [COMMAND]
USAGE
  $ fy-fax COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`fy-fax hello PERSON`](#fy-fax-hello-person)
* [`fy-fax hello world`](#fy-fax-hello-world)
* [`fy-fax help [COMMAND]`](#fy-fax-help-command)
* [`fy-fax plugins`](#fy-fax-plugins)
* [`fy-fax plugins:install PLUGIN...`](#fy-fax-pluginsinstall-plugin)
* [`fy-fax plugins:inspect PLUGIN...`](#fy-fax-pluginsinspect-plugin)
* [`fy-fax plugins:install PLUGIN...`](#fy-fax-pluginsinstall-plugin-1)
* [`fy-fax plugins:link PLUGIN`](#fy-fax-pluginslink-plugin)
* [`fy-fax plugins:uninstall PLUGIN...`](#fy-fax-pluginsuninstall-plugin)
* [`fy-fax plugins:uninstall PLUGIN...`](#fy-fax-pluginsuninstall-plugin-1)
* [`fy-fax plugins:uninstall PLUGIN...`](#fy-fax-pluginsuninstall-plugin-2)
* [`fy-fax plugins update`](#fy-fax-plugins-update)

## `fy-fax hello PERSON`

Say hello

```
USAGE
  $ fy-fax hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/peaceman/fy-fax/blob/v0.0.0/dist/commands/hello/index.ts)_

## `fy-fax hello world`

Say hello world

```
USAGE
  $ fy-fax hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `fy-fax help [COMMAND]`

Display help for fy-fax.

```
USAGE
  $ fy-fax help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for fy-fax.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `fy-fax plugins`

List installed plugins.

```
USAGE
  $ fy-fax plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ fy-fax plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `fy-fax plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ fy-fax plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ fy-fax plugins add

EXAMPLES
  $ fy-fax plugins:install myplugin 

  $ fy-fax plugins:install https://github.com/someuser/someplugin

  $ fy-fax plugins:install someuser/someplugin
```

## `fy-fax plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ fy-fax plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ fy-fax plugins:inspect myplugin
```

## `fy-fax plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ fy-fax plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ fy-fax plugins add

EXAMPLES
  $ fy-fax plugins:install myplugin 

  $ fy-fax plugins:install https://github.com/someuser/someplugin

  $ fy-fax plugins:install someuser/someplugin
```

## `fy-fax plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ fy-fax plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ fy-fax plugins:link myplugin
```

## `fy-fax plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ fy-fax plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ fy-fax plugins unlink
  $ fy-fax plugins remove
```

## `fy-fax plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ fy-fax plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ fy-fax plugins unlink
  $ fy-fax plugins remove
```

## `fy-fax plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ fy-fax plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ fy-fax plugins unlink
  $ fy-fax plugins remove
```

## `fy-fax plugins update`

Update installed plugins.

```
USAGE
  $ fy-fax plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
