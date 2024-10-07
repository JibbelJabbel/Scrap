// Function to fetch and display the iPhone data
async function fetchData() {
    try {
        // Fetch the data from the CSV file
        const response = await fetch('https://raw.githubusercontent.com/your-username/your-repo/main/scraped_data.csv');
        const text = await response.text();

        // Parse the CSV data
        const rows = text.split('\n');
        const dataContainer = document.getElementById('data');
        dataContainer.innerHTML = '';

        rows.forEach((row, index) => {
            const cols = row.split(',');
            if (cols.length >= 2 && index > 0) {  // Skipping header row (index > 0)
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');
                itemDiv.innerHTML = `<strong>${cols[0]}</strong>: ${cols[1]}`;
                dataContainer.appendChild(itemDiv);
            }
        });

        // Set the last updated time
        const lastUpdated = new Date().toLocaleString();
        document.getElementById('last-updated').innerText = lastUpdated;

        // Save the last updated time to localStorage
        localStorage.setItem('lastUpdated', lastUpdated);

    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

// Automatically load the iPhone list on page load
window.onload = function() {
    // Check if there's a last updated time in localStorage
    const lastUpdated = localStorage.getItem('lastUpdated');
    if (lastUpdated) {
        document.getElementById('last-updated').innerText = lastUpdated;
    }

    // Fetch the data when the page loads
    fetchData();

    // Add the event listener for the fetch button
    document.getElementById('fetch-data').addEventListener('click', fetchData);
};
