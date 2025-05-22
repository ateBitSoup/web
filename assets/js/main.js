/*
    File: main.js
    Version: 1.1
    Author: ateBitSoup
    Description: General JavaScript for site-wide functionality,
                 including mobile menu toggle, dynamic footer year,
                 and custom PWA install prompt.
    Last Modified: 5/21/2025
*/

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
            const icon = navToggle.querySelector('i');
            if (mainNav.classList.contains('is-open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                navToggle.setAttribute('aria-expanded', 'true');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Dynamic Footer Year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Custom PWA Install Prompt Logic (Added in v1.1) ---
    let deferredPrompt; // Allows us to save the event & trigger it later.
    const installAppButton = document.getElementById('installAppButton');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        if (installAppButton) {
            installAppButton.style.display = 'inline-flex'; // Show the button
            // Or use a class: installAppButton.classList.remove('hidden');
            console.log("'beforeinstallprompt' event fired, install button shown.");
        } else {
            console.log("'beforeinstallprompt' event fired, but no install button found in DOM.");
        }
    });

    if (installAppButton) {
        installAppButton.addEventListener('click', async () => {
            // Hide the button immediately when clicked, regardless of prompt availability
            // This prevents multiple clicks if the prompt logic is slow or fails.
            installAppButton.style.display = 'none';

            if (deferredPrompt) {
                console.log("Install button clicked, attempting to show install prompt.");
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                try {
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);

                    if (outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                        // Optionally, send an analytics event or show a thank you message
                    } else {
                        console.log('User dismissed the A2HS prompt');
                        // User dismissed the prompt, they can be prompted again later
                        // (browser handles this, but good not to be too aggressive).
                    }
                } catch (error) {
                    console.error("Error handling userChoice for install prompt:", error);
                }
                // We've used the prompt, and can't use it again in this session, discard it
                deferredPrompt = null;
            } else {
                console.log('Install button clicked, but the install prompt is not available (already installed, dismissed previously in session, or not an installable PWA).');
                // Optionally, inform the user if they click it and it's not available
                // (e.g. "App already installed or install prompt not available right now")
            }
        });
    } else {
        console.log("Install button element not found in the DOM.");
    }

    // Check if the app is already installed (optional, for hiding button if installed on load)
    // This check is more for PWA display modes, may not reliably tell if it's on home screen
    // for all browsers/OS.
    function checkIfPWAIsInstalled() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            console.log('App is running in standalone mode or recognized as installed.');
            if (installAppButton) {
                installAppButton.style.display = 'none'; // Hide install button
            }
            return true;
        }
        console.log('App is not running in standalone mode.');
        return false;
    }

    // Call the check on load
    checkIfPWAIsInstalled();

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        if (installAppButton) {
            installAppButton.style.display = 'none'; // Hide the button after successful installation
        }
        // Clear the deferredPrompt if it's still around, as it's no longer needed
        deferredPrompt = null;
    });
});