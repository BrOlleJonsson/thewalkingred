// --- Element References ---
// Get references to DOM elements needed for interactivity
const regionFilter = document.getElementById('region-filter');
const locationFilter = document.getElementById('location-filter');
const organizerFilter = document.getElementById('organizer-filter');
const rallyListContainer = document.getElementById('rally-list');
const noRalliesMessage = document.getElementById('no-rallies-message');
const initialLoadingMessage = document.getElementById('initial-loading-message');
const mapElement = document.getElementById('map');
const loadMoreContainer = document.getElementById('load-more-container'); // Added
const loadMoreBtn = document.getElementById('load-more-btn'); // Added
const detailsOverlayBg = document.getElementById('details-overlay-bg'); // Overlay background
const detailsOverlayContent = document.getElementById('details-overlay-content'); // Overlay content box
const overlayDetailsContainer = document.getElementById('overlay-details-container'); // Container within overlay
const detailsOverlayCloseBtn = document.getElementById('details-overlay-close'); // Overlay close button

// --- Global Variables ---
let rallyListItems = []; // Array to hold the DOM elements for rally list items
let map = null; // Leaflet map instance for the main map
let markerClusterGroup = null; // Leaflet MarkerCluster group
let detailsMap = null; // Leaflet map instance for the details overlay map
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // URL for map tiles
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'; // Map attribution text
// let highlightedItemElement = null; // Reference to a currently highlighted list item (unused) -> REMOVED
let currentFilteredData = []; // Store the currently filtered data
let currentPage = 1; // Track the current page for "Load More"
const itemsPerPage = 12; // Number of items to show per page/load
let allRalliesData = []; // Will be populated by fetching JSON

// --- SVG Icons (as strings for easy insertion) ---
// Card Icons
const svgIconMapPin = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgIconClock = `<svg class="info-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const svgIconUsers = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const svgIconInfo = `<svg class="info-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const svgIconSpeaker = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M12 2a6 6 0 0 0-6 6v4a6 6 0 0 0 12 0v-4a6 6 0 0 0-6-6Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
const svgIconLink = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
// const svgIconAccessibility = `<svg class="info-icon" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M12 18h.01"/><path d="M15 22v-4a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v4"/><path d="M15 13a3 3 0 1 0-6 0"/><path d="M12 8v5"/></svg>`; // Defined but not used -> REMOVED
// const svgIconContact = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`; // Defined but not used -> REMOVED
// Popup Icons (smaller, different class)
const svgPopupIconMapPin = `<svg class="popup-icon" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgPopupIconClock = `<svg class="popup-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const svgPopupIconUsers = `<svg class="popup-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const svgPopupIconInfo = `<svg class="popup-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const svgPopupIconSpeaker = `<svg class="popup-icon" viewBox="0 0 24 24"><path d="M12 2a6 6 0 0 0-6 6v4a6 6 0 0 0 12 0v-4a6 6 0 0 0-6-6Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`; // Added speaker icon for popup


// --- Custom Red Marker Icon for Leaflet ---
const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', // URL for red marker image
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png', // Standard shadow
    iconSize: [25, 41], // Size of the icon image
    iconAnchor: [12, 41], // Point of the icon which corresponds to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41] // Size of the shadow image
});

// --- Functions ---

/**
 * Formats a list of strings (like organizers or speakers) for summary display.
 * Shows the first one or two names, then "+ X fler" if there are more.
 * @param {string[]} list - The array of strings.
 * @param {boolean} [useAmpersandForTwo=false] - If true, use " & " between two items, otherwise use ", ".
 * @returns {string} Formatted summary string.
 */
function formatSummaryList(list, useAmpersandForTwo = false) {
    if (!list || list.length === 0) return '';
    if (list.length === 1) {
        return list[0];
    }
    if (list.length === 2) {
        // Use " & " or ", " based on the flag
        const separator = useAmpersandForTwo ? ' & ' : ', ';
        return `${list[0]}${separator}${list[1]}`;
    }
    // More than 2 items: show first two + count
    const count = list.length - 2;
    return `${list[0]}, ${list[1]} + ${count} fler`;
}

/**
 * Formats an array of organizer names into a readable string for full display.
 * e.g., ["A", "B"] -> "A & B"; ["A", "B", "C"] -> "A, B & C"
 * @param {string[]} organizers - Array of organizer names.
 * @returns {string} Formatted string of organizers.
 */
function formatOrganizersFull(organizers) {
    if (!organizers || organizers.length === 0) return '';
    if (organizers.length === 1) return organizers[0];
    if (organizers.length === 2) return `${organizers[0]} & ${organizers[1]}`;
    // For 3 or more, join all but the last with commas, then add "& last"
    const last = organizers[organizers.length - 1];
    const initial = organizers.slice(0, -1).join(', ');
    return `${initial} & ${last}`;
}


/**
 * Creates an HTML element for a single rally item card.
 * Uses summarized lists (up to 2 names) for organizers and speakers.
 * @param {object} rallyData - The data for one rally.
 * @param {number} index - The original index of the rally in the allRalliesData array.
 * @returns {HTMLElement} The created div element for the rally item.
 */
function createRallyItemHTML(rallyData, index) {
    const outerDiv = document.createElement('div');
    // Store data attributes for filtering and identification
    outerDiv.dataset.organizers = JSON.stringify(rallyData.organizer || []);
    outerDiv.dataset.location = rallyData.location || '';
    outerDiv.dataset.region = rallyData.region || '';
    outerDiv.dataset.lat = rallyData.lat || '';
    outerDiv.dataset.lon = rallyData.lon || '';
    outerDiv.dataset.index = index; // Store the original index
    outerDiv.className = 'rally-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col'; // Styling

    let contentHTML = '';
    // Card Header (Location)
    contentHTML += `<div class="bg-red-600 py-2 px-4"><h3 class="text-lg font-bold text-white truncate">${rallyData.location || 'Okänd plats'}</h3></div>`;
    // Card Body
    contentHTML += `<div class="p-4 flex-grow"> <div class="space-y-3 text-sm text-gray-800">`;

    // Start Point and Address
    if (rallyData.startPoint) {
        contentHTML += `<div class="flex items-start">${svgIconMapPin}<div><p class="font-semibold">${rallyData.startPoint}</p>`;
        if (rallyData.address) contentHTML += `<p class="text-xs text-gray-600">${rallyData.address}</p>`;
        contentHTML += `</div></div>`;
    }
    // Time
    if (rallyData.time) contentHTML += `<div class="flex items-center">${svgIconClock}<p>Kl. ${rallyData.time}</p></div>`;

    // Organizers (Summarized, up to 2 names, use '&')
    const organizers = rallyData.organizer || [];
    if (organizers.length > 0) {
         const organizerLabel = organizers.length === 1 ? 'Arrangör' : 'Arrangörer';
         const formattedOrganizersSummary = formatSummaryList(organizers, true); // Pass true for ampersand
         contentHTML += `<div class="flex items-start">${svgIconUsers}<div><p class="font-semibold">${organizerLabel}</p><p class="text-xs text-gray-600">${formattedOrganizersSummary}</p></div></div>`;
    }
    // Separator before optional details
     if (rallyData.speakers && rallyData.speakers.length > 0 || rallyData.details) contentHTML += `<hr class="card-separator">`;

    // Speakers (Summarized, up to 2 names, use ',') or Details
    const speakers = rallyData.speakers || [];
    if (speakers.length > 0) {
         const formattedSpeakersSummary = formatSummaryList(speakers, false); // Pass false for comma
         // Adjusted structure to match organizers: Label and List in separate <p> tags
         contentHTML += `<div class="flex items-start">${svgIconSpeaker}<div><p class="font-semibold">Talare:</p><p class="text-xs text-gray-600">${formattedSpeakersSummary}</p></div></div>`;
    }
    else if (rallyData.details) {
        // Adjusted structure to match organizers for consistency
        contentHTML += `<div class="flex items-start">${svgIconInfo}<div><p class="font-semibold">Övrigt:</p><p class="text-xs text-gray-600">${rallyData.details}</p></div></div>`;
    }
    contentHTML += `</div></div>`; // End Card Body
    // Card Footer (Details Button)
     contentHTML += `<div class="px-4 pb-3 pt-2 border-t border-gray-100 mt-auto"><div><button data-index="${index}" class="details-button inline-flex items-center text-sm text-red-600 hover:text-red-800 font-medium">Visa detaljer<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 ml-1"><path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg></button></div></div>`;
    outerDiv.innerHTML = contentHTML;
    return outerDiv;
}

/**
 * Appends a list of rally items to the DOM.
 * @param {object[]} dataToAppend - Array of rally data objects for the current page/batch.
 */
function appendRallyListDOM(dataToAppend) { // Renamed from populateRallyListDOM
    // Append items for the current page/batch
    if (dataToAppend && dataToAppend.length > 0) {
        dataToAppend.forEach((rally) => {
            const originalIndex = allRalliesData.findIndex(orig => orig === rally);
            if (originalIndex !== -1) {
                const rallyElement = createRallyItemHTML(rally, originalIndex);
                rallyListContainer.appendChild(rallyElement);
                rallyListItems.push(rallyElement); // Add to the list of DOM items
            } else {
                console.warn("Could not find original index for rally:", rally);
            }
        });
        addDetailsButtonListeners(); // Re-attach/delegate listeners
    }
}

/**
 * Displays the correct slice of filtered data based on the current page.
 * Manages the visibility of the "Load More" button.
 */
function displayFilteredRallies() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const dataForThisPage = currentFilteredData.slice(startIndex, endIndex);

    // If it's the first page, clear the container first
    if (currentPage === 1) {
        rallyListContainer.innerHTML = ''; // Clear container
        rallyListItems = []; // Reset DOM item list
        // Hide/Show initial/no results messages
        initialLoadingMessage.classList.add('hidden');
        noRalliesMessage.classList.toggle('hidden', currentFilteredData.length > 0);
    }

    // Populate the list with items for the current page
    appendRallyListDOM(dataForThisPage); // Use the append function

    // Show/hide the "Load More" button
    if (currentFilteredData.length > endIndex) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }
}


/**
 * Attaches click event listeners to the "Visa detaljer" buttons in the rally list.
 * Uses event delegation on the container for better performance, but cloning/replacing
 * is used here to ensure old listeners are removed when repopulating.
 */
function addDetailsButtonListeners() {
    const detailButtons = rallyListContainer.querySelectorAll('.details-button');
    // Simple way to remove old listeners: replace the button with its clone
    detailButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    // Add new listeners to the cloned buttons
     rallyListContainer.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.currentTarget.dataset.index; // Get original index from data attribute
            if (index !== undefined) {
                showDetailsOverlay(parseInt(index, 10)); // Show overlay using the original index
            }
        });
    });
}


/**
 * Populates all filter dropdowns (Region, Location, Organizer) initially
 * based on the complete dataset.
 * @param {object[]} data - The complete array of rally data (allRalliesData).
 */
function populateInitialFilters(data) {
    const organizersSet = new Set();
    const locationsSet = new Set();
    const regionsSet = new Set();

    // Collect all unique values from the data
    data.forEach(item => {
        const organizerArray = item.organizer;
        // Handle organizers (can be an array)
        if (organizerArray && Array.isArray(organizerArray)) {
            organizerArray.forEach(org => {
                const trimmedOrg = org.trim();
                if (trimmedOrg) organizersSet.add(trimmedOrg);
            });
        }
        // Handle location and region (single strings)
        if (item.location) locationsSet.add(item.location.trim());
        if (item.region) regionsSet.add(item.region.trim());
    });

    // Helper function to populate a single dropdown
    const populateDropdown = (dropdown, optionsSet) => {
        // Clear existing options (except the default "Alla")
        while (dropdown.options.length > 1) dropdown.remove(1);
        // Sort options alphabetically (Swedish locale)
        const sortedOptions = Array.from(optionsSet).sort((a, b) => a.localeCompare(b, 'sv'));
        // Add sorted options to the dropdown
        sortedOptions.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            dropdown.appendChild(option);
        });
    };

    // Populate each filter dropdown
    populateDropdown(regionFilter, regionsSet);
    populateDropdown(locationFilter, locationsSet);
    populateDropdown(organizerFilter, organizersSet);
}

/**
  * Updates the Location and Organizer filter options based on the currently selected Region.
  * This makes the filters dependent, showing only relevant choices.
  */
 function updateDependentFiltersOnRegionChange() {
     const selectedRegion = regionFilter.value;
     const availableLocations = new Set();
     const availableOrganizers = new Set();

     // Filter the master data based *only* on the selected region
     const regionFilteredData = allRalliesData.filter(item =>
         selectedRegion === 'alla' || (item.region && item.region.toLowerCase() === selectedRegion.toLowerCase())
     );

     // Collect available locations and organizers from the region-filtered data
     regionFilteredData.forEach(item => {
         if (item.location) availableLocations.add(item.location.trim());
         if (item.organizer && Array.isArray(item.organizer)) {
             item.organizer.forEach(org => {
                 const trimmedOrg = org.trim();
                 if (trimmedOrg) availableOrganizers.add(trimmedOrg);
             });
         }
     });

     // Helper function to update a dropdown, preserving selection if possible
     const updateDropdown = (dropdown, availableOptionsSet) => {
         const currentValue = dropdown.value; // Store the current selection
         let valueStillAvailable = false; // Flag to check if the current selection is still valid

         // Clear existing options (except "Alla")
         while (dropdown.options.length > 1) dropdown.remove(1);

         // Sort and add new options
         const sortedOptions = Array.from(availableOptionsSet).sort((a, b) => a.localeCompare(b, 'sv'));
         sortedOptions.forEach(optionValue => {
             const option = document.createElement('option');
             option.value = optionValue;
             option.textContent = optionValue;
             dropdown.appendChild(option);
             // Check if the previously selected value is among the new options
             if (optionValue === currentValue) {
                 valueStillAvailable = true;
             }
         });

         // Restore selection or reset to "Alla"
         if (valueStillAvailable) {
             dropdown.value = currentValue; // Restore previous selection
         } else {
             dropdown.value = 'alla'; // Reset to "Alla" if previous selection is no longer valid
         }
     };

     // Update the Location and Organizer dropdowns
     updateDropdown(locationFilter, availableLocations);
     updateDropdown(organizerFilter, availableOrganizers);
 }


/**
 * Filters the rally list based on dropdowns, updates the map,
 * resets pagination, and displays the first page of results.
 */
function filterRallyListAndMap() {
    const selectedRegion = regionFilter.value;
    const selectedLocation = locationFilter.value;
    const selectedOrganizer = organizerFilter.value;

    // 1. Filter the master data based on all selected filters
    currentFilteredData = allRalliesData.filter(item => { // Store result globally
        const regionMatch = selectedRegion === 'alla' || (item.region && item.region.toLowerCase() === selectedRegion.toLowerCase());
        const locationMatch = selectedLocation === 'alla' || (item.location && item.location.toLowerCase() === selectedLocation.toLowerCase());
        // Check if *any* organizer in the item's array matches the selection
        const organizerMatch = selectedOrganizer === 'alla' || (item.organizer && item.organizer.some(org => org.toLowerCase() === selectedOrganizer.toLowerCase()));
        return regionMatch && locationMatch && organizerMatch;
    });

    // Reset pagination and display first page
    currentPage = 1;
    displayFilteredRallies(); // Display the first page of the filtered list

    // Update the map to show ALL markers matching the filter
    const visibleMapData = currentFilteredData.map(item => ({
        ...item,
        originalIndex: allRalliesData.indexOf(item)
    }));
    updateMapMarkers(visibleMapData);
}

/**
 * Initializes the main Leaflet map.
 */
function initializeMap() {
    if (!mapElement) { console.error("Map element not found!"); return; }
    if (map) return; // Avoid re-initializing

    try {
        // Create the map instance, set initial view and zoom
        map = L.map(mapElement).setView([62.0, 15.0], 7); // Adjusted zoom level to 7

        // Add the tile layer (map background)
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(map);

        // Initialize the marker cluster group
        markerClusterGroup = L.markerClusterGroup();
        map.addLayer(markerClusterGroup); // Add the cluster group to the map

        // Add listener to handle clicks on "Visa detaljer" links within map popups
        map.on('popupopen', function(e) {
            const contentNode = e.popup.getContent(); // Get the popup's content element
            if (contentNode instanceof HTMLElement) {
                const detailLink = contentNode.querySelector('.popup-details-link');
                if (detailLink) {
                    // Remove any previous listener before adding a new one (important!)
                    detailLink.removeEventListener('click', handlePopupDetailClick);
                    detailLink.addEventListener('click', handlePopupDetailClick);
                }
            }
        });

    } catch (e) {
        console.error("Error initializing Leaflet map:", e);
        mapElement.innerHTML = '<p class="text-red-500 text-center">Kunde inte ladda kartan.</p>'; // Display error message
    }
}

/**
 * Handles clicks on the "Visa detaljer" link inside a map popup.
 * Prevents default link behavior and shows the details overlay.
 * @param {Event} event - The click event object.
 */
function handlePopupDetailClick(event) {
    event.preventDefault(); // Stop the link from navigating
    const index = event.currentTarget.dataset.index; // Get original index from data attribute
    if (index !== undefined) {
        showDetailsOverlay(parseInt(index, 10)); // Show the overlay
        if (map && map.closePopup) {
            map.closePopup(); // Close the map popup after opening the overlay
        }
    }
}


/**
 * Creates the HTML content (as a DOM node) for a map marker's popup.
 * Uses summarized lists (up to 2 names) for organizers and speakers.
 * @param {object} itemData - The data for the rally associated with the marker.
 * @param {number} index - The original index of the rally data.
 * @returns {HTMLElement} A div element containing the popup HTML.
 */
function createPopupHTML(itemData, index) {
    // Main container div for popup content
    const containerDiv = document.createElement('div');

    // Red Header Bar
    const headerDiv = document.createElement('div');
    headerDiv.className = 'popup-header-bar'; // Use new CSS class
    headerDiv.textContent = itemData.location || 'Okänd plats';
    containerDiv.appendChild(headerDiv);

    // Inner container for padding and content below header
    const innerContentDiv = document.createElement('div');
    innerContentDiv.className = 'popup-inner-content'; // Use new CSS class for padding

    // Info items container
    const infoContainer = document.createElement('div');

    // Start Point and Address
    if (itemData.startPoint) {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `${svgPopupIconMapPin}<div><span class="popup-label">${itemData.startPoint}</span>${itemData.address ? `<br><span class="popup-subtext">${itemData.address}</span>` : ''}</div>`;
        infoContainer.appendChild(div);
    }
    // Time
    if (itemData.time) {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.innerHTML = `${svgPopupIconClock}<span>Kl. ${itemData.time}</span>`;
        infoContainer.appendChild(div);
    }
    // Organizers (Summarized, up to 2 names, use '&')
    const organizers = itemData.organizer || [];
    if (organizers.length > 0) {
         const organizerLabel = organizers.length === 1 ? 'Arrangör' : 'Arrangörer';
         const formattedOrganizersSummary = formatSummaryList(organizers, true); // Pass true for ampersand
         const div = document.createElement('div');
         div.style.display = 'flex';
         div.style.alignItems = 'flex-start';
         div.innerHTML = `${svgPopupIconUsers}<div><span class="popup-label">${organizerLabel}:</span><br><span class="popup-subtext">${formattedOrganizersSummary}</span></div>`;
         infoContainer.appendChild(div);
    }

    // Separator before optional details (Speakers/Details)
    if (itemData.speakers && itemData.speakers.length > 0 || itemData.details) {
         const hr = document.createElement('hr');
         hr.className = 'popup-separator';
         infoContainer.appendChild(hr);
    }

    // Speakers (Summarized, up to 2 names, use ',') or Details
    const speakers = itemData.speakers || [];
    if (speakers.length > 0) {
        const formattedSpeakersSummary = formatSummaryList(speakers, false); // Pass false for comma
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'flex-start';
        // Show label and summary, using same structure as organizers
        div.innerHTML = `${svgPopupIconSpeaker}<div><span class="popup-label">Talare:</span><br><span class="popup-subtext">${formattedSpeakersSummary}</span></div>`;
        infoContainer.appendChild(div);
    }
    else if (itemData.details) {
         const div = document.createElement('div');
         div.style.display = 'flex';
         div.style.alignItems = 'flex-start';
         div.innerHTML = `${svgPopupIconInfo}<div><span class="popup-label">Övrigt:</span><br><span class="popup-subtext">${itemData.details}</span></div>`;
         infoContainer.appendChild(div);
    }

    innerContentDiv.appendChild(infoContainer); // Add info items to inner content div

    // "Visa detaljer" link container (now inside innerContentDiv)
    const linkContainer = document.createElement('div');
    linkContainer.className = 'popup-details-link-container'; // Apply margin-top and border-top via CSS

    // "Visa detaljer" link
    const link = document.createElement('a');
    link.href = '#'; // Prevent navigation
    link.className = 'popup-details-link'; // Apply styling via CSS
    link.dataset.index = index;
    link.innerHTML = `Visa detaljer<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 16px; height: 16px; margin-left: 2px;"><path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`;

    linkContainer.appendChild(link);
    innerContentDiv.appendChild(linkContainer); // Add link container to inner content div

    containerDiv.appendChild(innerContentDiv); // Add inner content div to main container

    return containerDiv; // Return the complete container element
}


/**
 * Clears existing markers and adds new markers to the map's cluster group
 * based on the provided data. Adjusts map bounds to fit the markers.
 * @param {object[]} itemsData - Array of rally data objects (must include lat, lon, and originalIndex).
 */
function updateMapMarkers(itemsData) {
     if (!map || !markerClusterGroup) return; // Ensure map and cluster group are initialized

     markerClusterGroup.clearLayers(); // Remove all existing markers from the cluster group
     let addedMarkers = []; // Keep track of markers added in this update

     itemsData.forEach(item => {
         const lat = parseFloat(item.lat);
         const lon = parseFloat(item.lon);
         // Check if coordinates are valid numbers
         if (!isNaN(lat) && !isNaN(lon)) {
             const marker = L.marker([lat, lon], { icon: redIcon }); // Create marker with custom red icon
             // Create popup content using the original index
             const popupContentElement = createPopupHTML(item, item.originalIndex);
             marker.bindPopup(popupContentElement); // Bind the generated popup content
             markerClusterGroup.addLayer(marker); // Add marker to the cluster group
             addedMarkers.push(marker); // Add to tracking array
         }
     });

     // If markers were added, try to fit the map view to their bounds
     if (addedMarkers.length > 0) {
         // Only fit bounds if it's not the initial load (to avoid overriding initial view)
         // Use fitBounds if more than one marker exists
         if (initialLoadingMessage.classList.contains('hidden') && addedMarkers.length > 1) { // Changed condition to > 1
             try {
                 // Get the bounds of all markers in the cluster group and fit the map
                 map.fitBounds(markerClusterGroup.getBounds().pad(0.1)); // User adjusted padding
             } catch (e) {
                 // Handle cases where bounds might not be available
                 console.error("Could not fit map bounds:", e);
                 // Fallback: center on the first marker if bounds fail
                 map.setView(addedMarkers[0].getLatLng(), 10); // Adjust zoom level as needed
             }
         } else if (addedMarkers.length === 1) { // Only use setView if exactly one marker
             // If only one marker, just center on it with a reasonable zoom
             map.setView(addedMarkers[0].getLatLng(), 13); // Zoom in closer for single marker
         }
     }
     // If no markers are visible, reset to default view
     else {
          map.setView([62.0, 15.0], 7); // Reset to initial view/zoom
     }
}

// --- Functions for Details Overlay ---

/**
 * Populates and shows the details overlay for a specific rally.
 * Uses full lists for organizers and speakers.
 * @param {number} index - The original index of the rally in the allRalliesData array.
 */
function showDetailsOverlay(index) {
    console.log("Showing overlay for original index:", index);
    const rallyData = allRalliesData[index]; // Get data using the original index
    if (!rallyData) {
        console.error("No rally data found for original index:", index);
        return; // Exit if data is not found
    }

    // Clear previous content and remove old map instance if it exists
    overlayDetailsContainer.innerHTML = '';
    if (detailsMap) {
        detailsMap.remove(); // Properly remove the Leaflet map instance
        detailsMap = null;
    }

    // Build the HTML content for the overlay
    let overlayHTML = '';
    // Header with Location
    overlayHTML += `<div class="bg-red-600 py-2 px-4 -mx-6 -mt-6 mb-4 rounded-t-lg"> <h3 class="text-lg font-bold text-white truncate">${rallyData.location || 'Okänd plats'}</h3></div>`;
    overlayHTML += `<div class="space-y-4 text-base text-gray-800">`; // Container for details

    // Start Point and Address
    if (rallyData.startPoint) {
        overlayHTML += `<div class="flex items-start">${svgIconMapPin}<div><p class="font-semibold">${rallyData.startPoint}</p>`;
        if (rallyData.address) overlayHTML += `<p class="text-sm text-gray-600">${rallyData.address}</p>`;
        overlayHTML += `</div></div>`;
    }
    // Time
    if (rallyData.time) overlayHTML += `<div class="flex items-center">${svgIconClock}<p>Kl. ${rallyData.time}</p></div>`;
    // Organizers (Full list)
    const organizers = rallyData.organizer || [];
    if (organizers.length > 0) {
         const organizerLabel = organizers.length === 1 ? 'Arrangör' : 'Arrangörer';
         const formattedOrganizers = formatOrganizersFull(organizers); // Use the full formatting function
         overlayHTML += `<div class="flex items-start">${svgIconUsers}<div><p class="font-semibold">${organizerLabel}</p><p class="text-sm text-gray-600">${formattedOrganizers}</p></div></div>`;
    }

    // Placeholder for the mini-map
    overlayHTML += `<div id="details-map"></div>`;

    // Separator
    overlayHTML += `<hr class="card-separator">`;

    // Speakers (Full list)
    if (rallyData.speakers && rallyData.speakers.length > 0) {
         // Join the full list with commas for display
         overlayHTML += `<div class="flex items-start">${svgIconSpeaker}<div><p class="font-semibold text-sm text-gray-700">Talare:</p><p class="text-sm">${rallyData.speakers.join(', ')}</p></div></div>`;
    }
    // Details
    if (rallyData.details) overlayHTML += `<div class="flex items-start">${svgIconInfo}<div><p class="font-semibold text-sm text-gray-700">Övrigt:</p><p class="text-sm">${rallyData.details}</p></div></div>`;
    // Link
    if (rallyData.link) overlayHTML += `<div class="flex items-start">${svgIconLink}<div><p class="font-semibold text-sm text-gray-700">Länk:</p><p class="text-sm"><a href="${rallyData.link}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline">${rallyData.link}</a></p></div></div>`;
     // Potential future fields: Accessibility, Contact -> REMOVED
     // if (rallyData.accessibility) overlayHTML += `<div class="flex items-start">${svgIconAccessibility}<div><p class="font-semibold text-sm text-gray-700">Tillgänglighet:</p><p class="text-sm">${rallyData.accessibility}</p></div></div>`;
     // if (rallyData.contact) overlayHTML += `<div class="flex items-start">${svgIconContact}<div><p class="font-semibold text-sm text-gray-700">Kontakt:</p><p class="text-sm">${rallyData.contact}</p></div></div>`;

    overlayHTML += `</div>`; // End details container

    // Insert the generated HTML into the overlay
    overlayDetailsContainer.innerHTML = overlayHTML;
    // Make the overlay visible
    detailsOverlayBg.classList.remove('hidden');
    console.log("Overlay should be visible now.");

    // Initialize the mini-map *after* the overlay is visible and HTML is inserted
    // Use a small timeout to ensure the DOM is ready
    setTimeout(() => {
        initializeDetailsMap(rallyData.lat, rallyData.lon);
    }, 50); // 50ms delay should be sufficient
}

/**
 * Hides the details overlay and cleans up the details map instance.
 */
function closeDetailsOverlay() {
    console.log("Closing overlay.");
    detailsOverlayBg.classList.add('hidden'); // Hide the background/container
    // Properly remove the details map instance if it exists
    if (detailsMap) {
        detailsMap.remove();
        detailsMap = null;
    }
    // Clear the content to prevent old data flashing briefly if reopened quickly
    overlayDetailsContainer.innerHTML = '';
}

/**
 * Initializes the small Leaflet map inside the details overlay.
 * @param {number|string} lat - Latitude for the map center.
 * @param {number|string} lon - Longitude for the map center.
 */
function initializeDetailsMap(lat, lon) {
    const mapContainer = document.getElementById('details-map');
    if (!mapContainer) {
        console.error("Details map container not found!");
        return;
    }

    // Parse coordinates and check validity
     const latitude = parseFloat(lat);
     const longitude = parseFloat(lon);
     if (isNaN(latitude) || isNaN(longitude)) {
         mapContainer.innerHTML = '<p class="text-center text-gray-500 text-sm">Karta ej tillgänglig (ogiltiga koordinater).</p>';
         return;
     }

    try {
        // Create the map instance, centered on the rally location, zoomed in
        detailsMap = L.map('details-map').setView([latitude, longitude], 14); // Zoom level 14

        // Add tile layer
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(detailsMap);

        // Add a single marker at the rally location
        L.marker([latitude, longitude], { icon: redIcon }).addTo(detailsMap);

        // IMPORTANT: Invalidate map size after a short delay
        // This ensures the map tiles render correctly within the overlay container
        // which might not have had its final size calculated immediately.
        setTimeout(() => {
            if (detailsMap) detailsMap.invalidateSize();
        }, 100); // 100ms delay

        console.log("Details map initialized.");
    } catch (e) {
         console.error("Error initializing details map:", e);
         mapContainer.innerHTML = '<p class="text-red-500 text-center text-sm">Kunde inte ladda mini-kartan.</p>';
    }
}

// --- Fetch Rally Data ---
async function fetchRallyData() {
    try {
        const response = await fetch('rallies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allRalliesData = await response.json();
        console.log("Rally data loaded successfully:", allRalliesData.length, "items");
        return true; // Indicate success
    } catch (error) {
        console.error("Could not fetch rally data:", error);
        initialLoadingMessage.textContent = "Kunde inte ladda arrangemangsdata. Försök ladda om sidan.";
        initialLoadingMessage.classList.remove('hidden');
        noRalliesMessage.classList.add('hidden'); // Hide the 'no results' message
        return false; // Indicate failure
    }
}

// --- Main Initialization Logic ---
async function initializeApp() {
    console.log("Initializing app...");
    initializeMap(); // Initialize map structure first

    const dataLoaded = await fetchRallyData(); // Fetch data

    if (dataLoaded && allRalliesData && allRalliesData.length > 0) {
        // Populate filters and display initial data only if fetch was successful
        populateInitialFilters(allRalliesData);
        filterRallyListAndMap(); // This will display list and map markers
    } else if (!dataLoaded) {
        // Error message already shown by fetchRallyData
        updateMapMarkers([]); // Ensure map is empty on error
    } else {
        // Data loaded but is empty or invalid
        initialLoadingMessage.textContent = "Inga arrangemang hittades.";
        initialLoadingMessage.classList.remove('hidden');
        noRalliesMessage.classList.add('hidden');
        updateMapMarkers([]); // Ensure map is empty
    }

    // --- Event Listeners (Setup after data load attempt) ---
    regionFilter.addEventListener('change', () => {
         // When Region changes:
         // 1. Update the dependent Location and Organizer filters
         updateDependentFiltersOnRegionChange();
         // 2. Apply all filters to the list and map
         filterRallyListAndMap();
     });

     locationFilter.addEventListener('change', () => {
         // When Location changes:
         // 1. Update only the Organizer filter (as Location depends on Region, which hasn't changed)
         //    We can reuse the same function, it will respect the current Region selection.
         updateDependentFiltersOnRegionChange();
         // 2. Apply all filters to the list and map
         filterRallyListAndMap();
     });

     // When Organizer changes, just filter - no dependent filters to update
     organizerFilter.addEventListener('change', filterRallyListAndMap);

    // --- Event Listener for Load More Button ---
    if(loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++; // Increment page
            displayFilteredRallies(); // Display the next batch of items
        });
    }

    // --- Event Listeners for Overlay ---
    if (detailsOverlayCloseBtn && detailsOverlayBg) {
         // Close button click
         detailsOverlayCloseBtn.addEventListener('click', closeDetailsOverlay);
         // Click on the background (outside content) to close
         detailsOverlayBg.addEventListener('click', (event) => {
             // Check if the click target is the background itself, not the content area
             if (event.target === detailsOverlayBg) {
                 closeDetailsOverlay();
             }
         });
         console.log("Overlay close listeners added.");
     } else {
         console.error("Could not find overlay elements for close listeners.");
    }
}

// --- Start the App on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initializeApp);
