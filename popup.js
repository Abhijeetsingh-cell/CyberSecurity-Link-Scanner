document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scanLinks
    });
});

// Hover highlight for risk counts
document.querySelectorAll('.risk-count').forEach(span => {
    span.addEventListener('mouseenter', async (e) => {
        const riskType = e.target.dataset.risk;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: highlightLinksByRisk,
            args: [riskType]
        });
    });

    span.addEventListener('mouseleave', async (e) => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: clearHighlights
        });
    });
});

// Function to scan links and set risk attributes
function scanLinks() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.dataset.originalBorder = link.style.border || '';
    });

    let highRisk = 0, mediumRisk = 0, safeLinks = 0;

    links.forEach(link => {
        const url = link.href;

        if (url.includes('@') || /\d+\.\d+\.\d+\.\d+/.test(url)) {
            highRisk++;
            link.dataset.risk = "high";
            link.style.border = "2px solid red";
        } else if (url.includes('login') || url.includes('verify')) {
            mediumRisk++;
            link.dataset.risk = "medium";
            link.style.border = "2px solid orange";
        } else {
            safeLinks++;
            link.dataset.risk = "safe";
            link.style.border = "2px solid green";
        }
    });

    // Update popup UI counts
    document.getElementById('highRisk').textContent = highRisk;
    document.getElementById('mediumRisk').textContent = mediumRisk;
    document.getElementById('safeLinks').textContent = safeLinks;
}

// Highlight only links of a certain risk
function highlightLinksByRisk(riskType) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.dataset.risk === riskType) {
            link.style.backgroundColor = "yellow";
        } else {
            link.style.backgroundColor = "";
        }
    });
}

// Clear all highlights
function clearHighlights() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.backgroundColor = "";
    });
}