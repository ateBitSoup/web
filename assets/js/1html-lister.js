/*
    File: 1html-lister.js
    Version: 1.1
    Author: ateBitSoup
    Description: Script to dynamically fetch, parse, and list HTML files
                 from a specified GitHub repository folder (1html/ within 'web' repo).
                 Includes search and sort functionality.
    Last Modified: Last Modified: 5/21/2025
*/
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // These should be correct for your setup where 'web' is a repository
    // serving a GitHub Pages project site at atebitsoup.github.io/web/
    const GITHUB_USER = 'ateBitSoup';
    const SOURCE_REPO = 'web';        // The name of your repository (e.g., 'web')
    const SOURCE_FOLDER_PATH = '1html'; // The folder inside SOURCE_REPO containing HTML files
    const SOURCE_BRANCH = 'main';     // The default branch of SOURCE_REPO (e.g., 'main' or 'master')

    // --- DOM Elements ---
    const listContainer = document.getElementById('html-file-list-container');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    // Dynamically select loading message element as it might be re-created
    let loadingMessageElement;


    let allHtmlFilesData = []; // Holds [{ name, path, title, keywords, viewUrl }]

    // --- Helper: Fetch raw content of a single file ---
    async function fetchFileRawContent(downloadUrl) {
        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                console.warn(`Failed to fetch content for ${downloadUrl}: ${response.status} ${response.statusText}`);
                return null;
            }
            return await response.text();
        } catch (error) {
            console.warn(`Error fetching raw content for ${downloadUrl}:`, error);
            return null;
        }
    }

    // --- Helper: Parse HTML string for title and keywords ---
    function parseHtmlMeta(htmlString, fileName) {
        let title = fileName.replace(/\.html$/i, ''); // Default to filename (without .html) if title not found
        let keywords = [];

        if (htmlString) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, "text/html");

                const titleTag = doc.querySelector('title');
                if (titleTag && titleTag.textContent.trim()) {
                    title = titleTag.textContent.trim();
                }

                const keywordsMeta = doc.querySelector('meta[name="keywords"]');
                if (keywordsMeta) {
                    const content = keywordsMeta.getAttribute('content');
                    if (content) {
                        keywords = content.split(',')
                                        .map(k => k.trim().toLowerCase())
                                        .filter(k => k)
                                        .slice(0, 3); // Max 3 keywords
                    }
                }
            } catch (e) {
                console.warn(`Could not parse HTML for ${fileName}:`, e);
            }
        }
        return { title, keywords };
    }

    // --- Main function to load, process, and store file data ---
    async function loadAndProcessFiles() {
        // Ensure loading message element is present or create it
        if (listContainer && !listContainer.querySelector('.loading-message') && allHtmlFilesData.length === 0) {
            const p = document.createElement('p');
            p.className = 'loading-message';
            p.textContent = 'Initializing...';
            listContainer.innerHTML = ''; // Clear container before adding loading message
            listContainer.appendChild(p);
        }
        loadingMessageElement = listContainer.querySelector('.loading-message');

        if (!listContainer || !loadingMessageElement) {
            console.error("Required DOM elements for lister not found (listContainer or loadingMessageElement).");
            if (listContainer && !loadingMessageElement) listContainer.innerHTML = "<p class='error-message'>Error: Loading message element missing. Cannot proceed.</p>";
            return;
        }
        loadingMessageElement.textContent = 'Fetching file list from GitHub...';
        loadingMessageElement.style.display = 'block';
        loadingMessageElement.classList.remove('error-message', 'info-message');

        const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${SOURCE_REPO}/contents/${SOURCE_FOLDER_PATH}?ref=${SOURCE_BRANCH}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorDetail = `GitHub API error: ${response.status} ${response.statusText}`;
                if (response.status === 404) {
                    errorDetail += ` (Could not find path: github.com/${GITHUB_USER}/${SOURCE_REPO}/tree/${SOURCE_BRANCH}/${SOURCE_FOLDER_PATH})`;
                } else if (response.status === 403) {
                     errorDetail += ` (API rate limit likely exceeded, or forbidden access. Check console for 'x-ratelimit-remaining' header.)`;
                }
                throw new Error(errorDetail);
            }
            const files = await response.json();

            // Check if the response is an array (expected for a directory)
            if (!Array.isArray(files)) {
                let errorDetail = "Unexpected API response. Expected an array of files.";
                if (files.message) { // GitHub often includes a message for errors not caught by status
                    errorDetail += ` GitHub Message: ${files.message}`;
                }
                console.error("Raw API response:", files);
                throw new Error(errorDetail);
            }
            
            const htmlFiles = files.filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html'));

            if (htmlFiles.length === 0) {
                loadingMessageElement.textContent = `No HTML files found in 'github.com/${GITHUB_USER}/${SOURCE_REPO}/${SOURCE_FOLDER_PATH}' on branch '${SOURCE_BRANCH}'.`;
                loadingMessageElement.classList.add('info-message');
                return;
            }

            loadingMessageElement.textContent = `Found ${htmlFiles.length} HTML file(s). Fetching details... (0/${htmlFiles.length})`;

            let filesProcessedCount = 0;
            const fileDataPromises = htmlFiles.map(async (file) => {
                const rawContent = await fetchFileRawContent(file.download_url);
                const { title, keywords } = parseHtmlMeta(rawContent, file.name);

                // Correct viewUrl for GitHub Pages project site:
                // file.path from the API is relative to the root of the SOURCE_REPO.
                // e.g., if SOURCE_FOLDER_PATH is "1html", file.path will be "1html/your-file.html"
                // This is directly usable as a relative link on the GitHub Pages site.
                const viewUrl = file.path;

                filesProcessedCount++;
                // Update loading message, ensuring it's still in the DOM
                const currentLoadingMsg = listContainer.querySelector('.loading-message');
                if (currentLoadingMsg) {
                    currentLoadingMsg.textContent = `Fetching details... (${filesProcessedCount}/${htmlFiles.length})`;
                }


                return {
                    name: file.name, // e.g., "your-file.html"
                    path: file.path, // e.g., "1html/your-file.html"
                    title: title,
                    keywords: keywords,
                    viewUrl: viewUrl, // e.g., "1html/your-file.html"
                };
            });

            allHtmlFilesData = await Promise.all(fileDataPromises);
            // Hide loading message only if it's still the one we expect
            const finalLoadingMsg = listContainer.querySelector('.loading-message');
            if (finalLoadingMsg && finalLoadingMsg.textContent.startsWith("Fetching details")) {
                 finalLoadingMsg.style.display = 'none';
            }
            applyFiltersAndSort();

        } catch (error) {
            console.error('Error loading or processing files:', error);
            const errorDisplay = listContainer.querySelector('.loading-message') || listContainer; // Fallback to listContainer
            errorDisplay.textContent = `Error: ${error.message}. Check console for details. Verify repository settings, paths, and API rate limits.`;
            errorDisplay.classList.add('error-message');
            errorDisplay.style.display = 'block';
        }
    }

    // --- Render the list of files into the DOM ---
    function renderFileList(filesToRender) {
        // Clear only if not showing an error/loading message already handled by loadAndProcessFiles
        const existingMessage = listContainer.querySelector('.loading-message, .info-message, .error-message');
        if (!existingMessage || (existingMessage && !existingMessage.textContent.startsWith("Error:"))) {
            listContainer.innerHTML = '';
        }


        if (filesToRender.length === 0 && (!existingMessage || !existingMessage.textContent.startsWith("Error:"))) {
            // Don't overwrite a loading/error message if there are no files due to ongoing load or error
            if (!listContainer.querySelector('.loading-message') && !listContainer.querySelector('.error-message')) {
                const p = document.createElement('p');
                p.textContent = 'No files match your current search or filter criteria.';
                p.className = 'info-message';
                listContainer.appendChild(p);
            }
            return;
        } else if (filesToRender.length === 0) {
            return; // An error or loading message is already being shown
        }


        // If an error/loading message was present and we have files, clear it
        if (existingMessage) {
            listContainer.innerHTML = '';
        }


        const ul = document.createElement('ul');
        ul.className = 'html-file-items';

        filesToRender.forEach(fileData => {
            const li = document.createElement('li');
            li.className = 'html-file-item';

            const titleLink = document.createElement('a');
            // viewUrl is already correctly relative, e.g., "1html/your-file.html"
            titleLink.href = fileData.viewUrl;
            titleLink.textContent = fileData.title;
            titleLink.target = '_blank';
            titleLink.rel = 'noopener noreferrer';
            titleLink.className = 'file-title-link';

            li.appendChild(titleLink);

            if (fileData.keywords.length > 0) {
                const keywordsP = document.createElement('p');
                keywordsP.className = 'file-keywords';
                keywordsP.innerHTML = `<strong>Keywords:</strong> ${fileData.keywords.join(', ')}`;
                li.appendChild(keywordsP);
            }

            // Optional: Display original filename if different from title
            const titleWithoutExtension = fileData.title.toLowerCase();
            const nameWithoutExtension = fileData.name.toLowerCase().replace(/\.html$/i, '');
            if (titleWithoutExtension !== nameWithoutExtension) {
                const originalNameP = document.createElement('p');
                originalNameP.className = 'file-original-name';
                originalNameP.textContent = `(File: ${fileData.name})`;
                li.appendChild(originalNameP);
            }
            ul.appendChild(li);
        });
        listContainer.appendChild(ul);
    }

    // --- Sort and Filter Logic ---
    function applyFiltersAndSort() {
        let filteredFiles = [...allHtmlFilesData];

        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredFiles = filteredFiles.filter(file =>
                file.title.toLowerCase().includes(searchTerm) ||
                file.name.toLowerCase().includes(searchTerm) ||
                file.keywords.some(k => k.toLowerCase().includes(searchTerm))
            );
        }

        const sortBy = sortSelect.value;
        switch (sortBy) {
            case 'title-asc':
                filteredFiles.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filteredFiles.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        renderFileList(filteredFiles);
    }

    // --- Event Listeners for controls ---
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
    if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);

    // --- Initial Load ---
    loadAndProcessFiles();
});