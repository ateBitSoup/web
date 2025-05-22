<!--
    File: README.md
    Version: 1.1
    Author: ateBitSoup
    Description: Overview of the ateBitSoup project, a personal code sandbox and showcase.
    Last Modified: [Current Date]
-->

<p align="center">
  <img src="assets/images/logo_full.png" alt="ateBitSoup Full Logo" width="400">
</p>

# ateBitSoup: A Digital Playground & Code Cauldron

Welcome to **ateBitSoup**! This repository and its accompanying <a href="https://atebitsoup.github.io/web/" target="_blank">live site</a> serve as a personal digital workshop where curiosity meets code. It's a space for sharing web-based experiments, handy HTML snippets, JavaScript concoctions, and other bits of digital creativity.

Think of it as a constantly simmering pot of ideas, always evolving and (hopefully) offering something interesting or useful.

## What's Cooking in the Soup?

The main ingredients and goals of this project include:

*   **A Hub for HTML/CSS/JS Creations:** A straightforward way to host and share interactive web demos and projects.
*   **Experimentation Station:** A platform to tinker with new web technologies, try out fun ideas, and learn by doing (and occasionally by breaking things!).
*   **A Living Portfolio:** A browsable collection showcasing various coding endeavors, from fully encapsulated HTML demos to useful JavaScript utilities.
*   **Mobile-First Fun:** Designed with responsiveness in mind, ensuring everything is accessible and enjoyable on any device.
*   **The Joy of Static + Client-Side Power:** Celebrating the elegance and potency of static sites augmented with clever client-side JavaScript.

## Current Key Features

*   **Homepage (`index.html`):** Your first taste of the soup! Features a welcome message and our adorable mascot, SpiderKitten.
*   **1HTML Demos (`1html.html`):** A dynamic showcase of self-contained HTML files. This page uses JavaScript to:
    *   Fetch a list of HTML files directly from a folder in this repository (`1html/`).
    *   Extract titles and meta keywords from each file.
    *   Generate a browsable list with links that open each demo.
    *   Provide search and sort functionality for easy navigation.
*   **About Page (`about.html`):** A little more about the project's philosophy (and a chance to meet SpiderKitten's bigger cousin, `logo_full.png`!).
*   **Responsive Design:** Ensures a good viewing experience across desktops, tablets, and mobile phones.
*   **PWA Elements:** Includes a web app manifest and various icons to enhance the experience for users who "add to home screen."

## Technology Stack

*   **Frontend:** Primarily HTML5, CSS3, and modern JavaScript (ES6+).
*   **Dynamic Content (Client-Side):** JavaScript interacting with the GitHub API to list repository contents.
*   **Styling:** Custom CSS, with a focus on modularity and responsiveness. Use of CSS Variables for theming.
*   **Icons:** Font Awesome for UI icons, and custom project/social icons.
*   **Hosting:** GitHub Pages, serving the `web` repository as a project site.

## How the "1HTML Demos" Page Works

The `1html.html` page is a prime example of the project's approach:
1.  On page load, client-side JavaScript makes an asynchronous call to the GitHub API to retrieve the contents of the `/1html/` directory within this `web` repository.
2.  For each `.html` file found, another request fetches its raw content.
3.  The script then parses this raw HTML to extract the page `<title>` and any `<meta name="keywords">`.
4.  Finally, it dynamically constructs and injects list items into the DOM, providing a title, extracted keywords, and a direct link to view the HTML demo. Search and sort functionalities operate on this dynamically generated list.

## Future Simmerings (Ideas)

This pot is always on the stove! Future additions and refinements might include:
*   More advanced categorization and tagging for projects.
*   Enhanced search and filtering options.
*   Showcasing other types of code (Python scripts, etc.) with appropriate viewers or descriptions.
*   Further UI/UX polish and perhaps even more SpiderKitten appearances!
*   Deeper PWA features.

---

This project is a continuous journey of learning, experimentation, and sharing. Feel free to explore, get inspired, or even <a href="https://github.com/ateBitSoup/web/issues" target="_blank">suggest an idea</a>!