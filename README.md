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
    - [Scripts and Styles](#scripts-and-styles)
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
   cd twine-dev-server
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
script1.js
script2.js
...
styles/
style1.css
style2.css
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

### Scripts and Styles

- Scripts and styles can be split across multiple files.
- During compilation, all scripts and styles will be combined into single files.
- Scripts are located in `src/story/scripts/`.
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
- [ ] Add TypeScript support in scripts
- [ ] Add support for SCSS and other CSS preprocessors
- [ ] Add support for other Twine formats
