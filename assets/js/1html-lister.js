document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const GITHUB_USER = 'ateBitSoup';
    const SOURCE_REPO = 'web';        // Repository where the '1html' folder exists
    const SOURCE_FOLDER_PATH = '1html'; // Path to the folder within SOURCE_REPO
    const SOURCE_BRANCH = 'main';     // Default branch of SOURCE_REPO (e.g., 'main' or 'master')

    // --- DOM Elements ---
    const listContainer = document.getElementById('html-file-list-container');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const loadingMessageElement = listContainer.querySelector('.loading-message');

    let allHtmlFilesData = []; // Holds [{ name, path, title, keywords, viewUrl, rawContent }]

    // --- Helper: Fetch raw content of a single file ---
    async function fetchFileRawContent(downloadUrl) {
        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                console.warn(`Failed to fetch content for ${downloadUrl}: ${response.status}`);
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
        let title = fileName; // Default to filename if title not found
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
                                        .map(k => k.trim().toLowerCase()) // Standardize to lowercase
                                        .filter(k => k) // Remove empty keywords
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
        if (!listContainer || !loadingMessageElement) {
            console.error("Required DOM elements for lister not found.");
            return;
        }
        loadingMessageElement.textContent = 'Fetching file list from GitHub...';
        loadingMessageElement.style.display = 'block';

        const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${SOURCE_REPO}/contents/${SOURCE_FOLDER_PATH}?ref=${SOURCE_BRANCH}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            const files = await response.json();
            const htmlFiles = files.filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html'));

            if (htmlFiles.length === 0) {
                loadingMessageElement.textContent = 'No HTML files found in the specified repository folder.';
                return;
            }

            loadingMessageElement.textContent = `Found ${htmlFiles.length} HTML file(s). Fetching details... (0/${htmlFiles.length})`;

            let filesProcessedCount = 0;
            const fileDataPromises = htmlFiles.map(async (file) => {
                const rawContent = await fetchFileRawContent(file.download_url);
                const { title, keywords } = parseHtmlMeta(rawContent, file.name);

                // URL to view the rendered HTML page (using raw.githack.com)
                // This service renders raw files from GitHub.
                const viewUrl = `https://raw.githack.com/${GITHUB_USER}/${SOURCE_REPO}/${SOURCE_BRANCH}/${file.path}`;
                
                // Alternative: If 'web' repo is ALSO a GitHub Pages site:
                // const viewUrl = `https://${GITHUB_USER}.github.io/${SOURCE_REPO}/${file.path}`;

                filesProcessedCount++;
                loadingMessageElement.textContent = `Fetching details... (${filesProcessedCount}/${htmlFiles.length})`;

                return {
                    name: file.name,
                    path: file.path,
                    title: title,
                    keywords: keywords,
                    viewUrl: viewUrl,
                    // rawContent: rawContent // Optionally store if needed later, but can consume memory
                };
            });

            allHtmlFilesData = await Promise.all(fileDataPromises);
            loadingMessageElement.style.display = 'none';
            applyFiltersAndSort(); // Render the initial list

        } catch (error) {
            console.error('Error loading or processing files:', error);
            loadingMessageElement.textContent = `Error: ${error.message}. Check console for details.`;
            loadingMessageElement.classList.add('error-message');
        }
    }

    // --- Render the list of files into the DOM ---
    function renderFileList(filesToRender) {
        listContainer.innerHTML = ''; // Clear previous list or loading message

        if (filesToRender.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No files match your current search or filter criteria.';
            p.className = 'info-message'; // Style this class in CSS
            listContainer.appendChild(p);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'html-file-items'; // For styling

        filesToRender.forEach(fileData => {
            const li = document.createElement('li');
            li.className = 'html-file-item'; // For styling

            const titleLink = document.createElement('a');
            titleLink.href = fileData.viewUrl;
            titleLink.textContent = fileData.title;
            titleLink.target = '_blank'; // Open in new tab
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
            if (fileData.title.toLowerCase() !== fileData.name.toLowerCase().replace('.html', '')) {
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
        let filteredFiles = [...allHtmlFilesData]; // Start with a fresh copy of all data

        // Filter by search term
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredFiles = filteredFiles.filter(file =>
                file.title.toLowerCase().includes(searchTerm) ||
                file.name.toLowerCase().includes(searchTerm) ||
                file.keywords.some(k => k.includes(searchTerm))
            );
        }

        // Sort files
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