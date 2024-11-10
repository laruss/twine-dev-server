# twine-dev-server

A development server that allows you to break down a Twine project into individual passage files, make changes, and view
them in real-time.
For now supports only *SugarCube* format.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Usage](#usage)
    - [Getting Started](#getting-started)
    - [Decompiling a Twine Project](#decompiling-a-twine-project)
    - [Development Mode](#development-mode)
    - [Build Mode](#build-mode)
- [Project Structure](#project-structure)
    - [Passages](#passages)
    - [Project Scripts](#project-scripts)
    - [Project Styles](#project-styles)
- [Scripts](#scripts)
- [License](#license)
- [Author](#author)
- [GitHub Repository](#github-repository)
- [Credits](#credits)
- [TODO](#todo)

## Description

`twine-dev-server` is a project that enables you to decompile a Twine project into separate passage files. It allows you
to make changes and view them in real-time. To get started, you need to run the `decompile` script on a compiled Twine
project where your static files are located. The script will parse all the files and create two subfolders in the `src`
directory: `static` and `story`. The `static` folder will contain everything unrelated to the HTML file, while the
`story` folder will contain the passages, a `scripts` directory for project scripts, a `styles` directory for
stylesheets, and a `_project.json` file that holds the main project information. Passages are stored in Markdown (`.md`)
format.

## Features

- Decompile Twine projects into separate passage files.
- Real-time development server to view changes instantly.
- Supports rearranging and renaming passages.
- Combine multiple scripts and stylesheets during compilation.
- Compatible with Twine and SugarCube.

## Usage

### Getting Started

1. **Clone the Repository**

   Pull the project from GitHub:

   ```bash
   git clone https://github.com/laruss/twine-dev-server.git
   ```

2. **Install Bun**

   Make sure you have [Bun](https://bun.sh/) installed. You can install it with the following command:

   **macOS/Linux**

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

   **Windows**

    ```bash
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

   Follow the instructions to add Bun to your path.

3. **Install Dependencies**

   Go to the project directory and install the dependencies:

   ```bash
   cd twine-dev-server
   bun install
   ```

### Decompiling a Twine Project

To decompile a Twine project, run the following command on your compiled project folder (folder where html file is
located):

```bash
bun run decompile `/path/to/your/project_folder`
```

This will create `static` and `story` subdirectories in your `src` directory.

**WARNING:** If you have just an html file, you should put it in empty folder as script will copy all files and folders
from the project folder to the `static` directory.

### Development Mode

To start the development server and watch for changes:

```bash
bun run dev
```

The server runs on [Elysia.js](https://elysiajs.com/) and is accessible at `http://localhost:3000`. The project will
automatically recompile when files are saved, created, or deleted in the `src` directory.

### Build Mode

To build the project for distribution:

```bash
bun run build
```

The compiled project will be located in the `dist` directory, ready for distribution or import into Twine.

## Project Structure

After decompilation, your project will have the following structure:

```
src/
static/
... (static files unrelated to HTML)
story/
passages/
my_super_name.md
another_passage.md
...
scripts/
---| index.js
---| script.js
...
styles/
---| style1.css
---| style2.css
...
_project.json
```

### Passages

- Each passage file is named exactly as it appears in Twine (e.g., `my_super_name` => `my_super_name.md`).
- The top of each generated passage file contains metadata, which can be removed. However, removing metadata may cause
  the passage's position in Twine to change upon compilation and losing tags information.
- You can reorganize passages by moving them into subdirectories within `src/story`.
- To rename a passage, simply rename the file (I am suggesting to use refactoring tools of your IDE to avoid breaking
  references in other passages or scripts).

### Valid passage examples:

File `src/story/hello.md`:

```markdown
====================
pid: 7
====================
I am a new node named hello
<<script>>
console.log('from hello', State.variables);
<</script>>
```

File `src/story/some_folder/some_passage.md`:

```markdown
Hello from `some_passage` in `some_folder`;
This passage has no metadata, but it will still work;
But it can't be a `start` passage without `pid`;
```

File `src/story/some_folder/some_other_passage.md`:

```markdown
====================
name: test
pid: 1
tags: 
position: 725,375
size: 100,100
====================
This passage has been made in Twine, now it's in markdown;
You can remove all data from the top of the file if you want, it will still work;
Leave pid though if this passage is the `start` passage;
```

### Project Scripts

- Scripts can be split across multiple files, but have one main entry point, that should have other scripts imported.
- During compilation, all scripts will be combined into a single file.
- Scripts are located in `src/story/scripts/`.

Script files support ES6 syntax and import/export statements.
Also index.js can be renamed to index.ts to enable TypeScript support.
To install external libraries, you can use `bun add <package-name>` command.
For more information, see the [Bun documentation](https://bun.sh/docs/).

**Example:**

```text
scripts/
---| index.js
---| script.js
```

`index.js`:

```javascript
import { myFunction } from './script.js';

myFunction();
```

`script.js`:

```javascript
export function myFunction() {
    console.log('Hello from myFunction');
}
```

### Project Styles

- Styles can be split across multiple files.
- During compilation, all styles will be combined into single files.
- Styles are located in `src/story/styles/`.

## Scripts

The following scripts are available in the `package.json`:

- **dev**: Starts the development server and watches for changes.
  ```bash
  bun run dev
  ```
- **decompile**: Decompiles a compiled Twine project.
  ```bash
  bun run decompile
  ```
- **compile**: Compiles the project without building.
  ```bash
  bun run compile
  ```
- **build**: Builds the project for distribution.
  ```bash
  bun run build
  ```
- **lint**: Runs ESLint on the `src` directory.
  ```bash
  bun run lint
  ```
- **pretty**: Formats the code using Prettier.
  ```bash
  bun run pretty
  ```
  
_You can run these scripts using npm as well, if you have it installed._

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author

[laruss](https://github.com/laruss)

## GitHub Repository

[https://github.com/laruss/twine-dev-server](https://github.com/laruss/twine-dev-server)

## Credits

- [Twine](https://twinery.org/) - An open-source tool for telling interactive, nonlinear stories.
- [SugarCube](https://www.motoslave.net/sugarcube/2/) - A free (gratis and libre) story format for Twine/Twee.

## TODO

- [ ] Write tests
- [ ] Add possibility to create empty project
- [ ] Add easy support for third-party libraries (e.g., React)
- [x] Add TypeScript support in scripts
- [ ] Add support for SCSS and other CSS preprocessors
- [ ] Add support for other Twine formats
