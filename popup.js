const flags = [
    // Todo - add tooltip
    { id: 'noprompt_multiple', label: "Don't prompt before opening new window" },
    { id: 'silent_qrs', label: 'Hide Cursor and Alt Text on Hover' },
    { id: 'imager_mode', label: 'Imager Mode (force Windows-style newlines)' },
];

// Function to load settings from Chrome storage
function loadSettings() {
    return new Promise(resolve => {
        chrome.storage.sync.get(flags.map(flag => flag.id), function (result) {
            resolve(result);
        });
    });
}

// Generate the toggle elements dynamically based on the flags array
async function generateToggles() {
    const settingsContainer = document.getElementById('settingsContainer');
    const loadedSettings = await loadSettings();

    flags.forEach(flag => {
        const settingDiv = document.createElement('div');
        settingDiv.classList.add('setting');

        const label = document.createElement('label');
        label.setAttribute('for', flag.id);
        label.textContent = flag.label;
        label.classList.add('flag-label');

        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', flag.id);
        input.checked = loadedSettings[flag.id] || false; // Set the correct state here

        const slider = document.createElement('span');
        slider.classList.add('slider', 'round');

        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        settingDiv.appendChild(label);
        settingDiv.appendChild(switchLabel);
        settingsContainer.appendChild(settingDiv);

        // Save the setting to Chrome storage when a toggle is changed
        input.addEventListener('change', function () {
            const value = this.checked;
            const key = flag.id;
            const data = {};
            data[key] = value;
            chrome.storage.sync.set(data);
        });
    });
}

// Call the function to generate the toggle elements when the popup is loaded
generateToggles();
