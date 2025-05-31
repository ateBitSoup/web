<!--
    File: README.md
    Version: 1.2
    Author: ateBitSoup
    Description: Overview of the ateBitSoup project, a personal code sandbox, showcase, and home to dynamic web applications.
    Last Modified: 05/21/2025
-->

<p align="center">
  <img src="assets/images/logo_full.png" alt="ateBitSoup Full Logo" width="400">
</p>

# ateBitSoup: A Digital Playground & Code Cauldron

Welcome to **ateBitSoup**! This repository and its accompanying <a href="https://atebitsoup.github.io/web/" target="_blank">live site</a> serve as a personal digital workshop where curiosity meets code. It's a space for sharing web-based experiments, handy HTML snippets, JavaScript concoctions, dynamic applications, and other bits of digital creativity.

Think of it as a constantly simmering pot of ideas, always evolving and (hopefully) offering something interesting, useful, or just plain fun!

## What's Cooking in the Soup?

The main ingredients and goals of this project include:

*   **A Hub for Diverse Web Creations:** A straightforward way to host and share interactive web demos, full-fledged mini-applications, and utility projects.
*   **Experimentation Station:** A platform to tinker with new web technologies, try out fun ideas, and learn by doing (and occasionally by joyfully breaking things!).
*   **A Living Portfolio:** A browsable collection showcasing various coding endeavors, from encapsulated HTML demos to feature-rich JavaScript applications.
*   **Mobile-First Fun:** Designed with responsiveness in mind, ensuring everything is accessible and enjoyable on any device.
*   **The Joy of Static + Client-Side Power:** Celebrating the elegance and potency of static sites augmented with clever client-side JavaScript to create dynamic experiences.

## Current Key Features

*   **Homepage (`index.html`):** Your first taste of the soup! Features a welcome message, an "under construction" notice (because good soup is always evolving!), and our adorable mascot, SpiderKitten.
*   **Joke App v4 (`joke-app-v4/index.html`):** A feature-rich daily joke application with:
    *   **Dynamic Theming:** Visual themes change based on seasons, federal holidays, common holidays, and even daily "Fun Days" (like National Donut Day!).
    *   **Extensive Joke Database:** Multiple categories including Dad jokes, cat jokes, school-specific humor, pop culture, seasonal, and Spanish jokes (with translations).
    *   **Interactive UI:** Get new jokes, reveal punchlines, and enjoy themed falling emojis/SVGs.
    *   **Modular Codebase:** Configuration for jokes, assets, and themes are split into separate, manageable JavaScript files.
*   **1HTML Demos (`1html.html`):** A dynamic showcase of self-contained HTML files. This page uses JavaScript to:
    *   Fetch a list of HTML files directly from a folder in this repository (`1html/`).
    *   Extract titles and meta keywords from each file.
    *   Generate a browsable list with links that open each demo.
    *   Provide search and sort functionality for easy navigation.
*   **About Page (`about.html`):** A little more about the project's philosophy, a chance to meet SpiderKitten's bigger cousin (`logo_full.png`!), and a link to the GitHub profile.
*   **Responsive Design:** Ensures a good viewing experience across desktops, tablets, and mobile phones for all sections.
*   **PWA Elements:** Includes a web app manifest and various icons to enhance the experience for users who "add to home screen," with a custom install prompt.
*   **Modular CSS Structure:** Global styles are in `style.css`, while page-specific styles reside in their own files (e.g., `index.css`, `about.css`, `1html.css`) for better organization.

## Technology Stack

*   **Frontend:** Primarily HTML5, CSS3 (with CSS Variables for robust theming), and modern JavaScript (ES6+).
*   **Dynamic Content (Client-Side):**
    *   **1HTML Demos:** JavaScript interacting with the GitHub API.
    *   **Joke App:** Pure client-side JavaScript for logic, date calculations, and DOM manipulation.
*   **Styling:** Custom CSS, with a modular approach and a focus on responsiveness.
*   **Icons:** Font Awesome for UI icons; custom project, social, and PWA icons.
*   **Hosting:** GitHub Pages, serving the `web` repository as a project site.

## How Key Features Work (Overview)

*   **1HTML Demos Page:** As described previously, uses the GitHub API to list and link HTML files.
*   **Joke App v4 Theming:**
    1.  `date-utils.js` determines the current date and provides helper functions for holiday calculations (e.g., Easter, Nth weekday).
    2.  `themes-data.js` defines configurations for seasons and various holidays, including date ranges, CSS classes to apply, and associated themed assets.
    3.  `assets-data.js` stores arrays of generic and themed SVGs/emojis for animations.
    4.  `jokes-data.js` stores all the joke content.
    5.  `script.js` (the main Joke App logic) uses this information to:
        *   Identify the current active season, federal holiday, common holiday, or "Fun Day."
        *   Apply the corresponding CSS theme class to the `<body>`.
        *   Select appropriate jokes based on active theme tags.
        *   Trigger themed falling item animations.
        *   Display relevant "Fun Day" notifications.

## Future Simmerings (Ideas)

This pot is always on the stove! Future additions and refinements might include:
*   More interactive demos and mini-apps.
*   Enhanced categorization and tagging for projects in the 1HTML section.
*   Showcasing other types of code (Python scripts, etc.) with appropriate viewers or descriptions.
*   Further UI/UX polish across the site and more SpiderKitten appearances!
*   Deeper PWA features for the main site and the Joke App.
*   User-configurable themes or settings for the Joke App.

---

This project is a continuous journey of learning, experimentation, and sharing. Feel free to explore, get inspired, or even <a href="https://github.com/ateBitSoup/web/issues" target="_blank">suggest an idea</a>!