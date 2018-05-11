# Contributing

## Styles & Linting

This project uses a locally installed [Prettier](https://prettier.io/) and [XO](https://github.com/xojs/xo) to keep styles consistent and help reduce merge conflicts.

It is up to individual developers to make sure their code complies with the rules specified in the Prettier and XO config within `package.json`. The easiest way to do this is explained in the next section, but other workflows can be found in the tools' respective documentation.

## IDE / Text Editor

The easiest way to integrate Prettier and XO into your workflow is to use [Visual Studio Code](https://code.visualstudio.com/) as your primary text editor.

Install the following extensions:

*   [XO](https://marketplace.visualstudio.com/items?itemName=samverschueren.linter-xo)
*   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

And in your VSCode User Settings, enable XO and Format-on-Save by adding this line to your `User Settings`:

```json
"editor.formatOnSave": true,
"xo.enable": true,
```

And that's it! Prettier should now automatically format your code every time you save, and ESLint should run constantly (its output can be seen in the "Output" tab, by pressing `⇧ Shift` + `⌘ Cmd` + `U` ).


## Gitmoji

Please use [Gitmoji](https://gitmoji.carloscuesta.me/) when creating commit messages. Simply search the Gitmoji page for the icon you need, and paste the `:code:` at the front of your commit message.