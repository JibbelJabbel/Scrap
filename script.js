// Function to fetch and display the iPhone data
async function fetchData() {
    try {
        // Fetch the data from the CSV file
        const response = await fetch('iPhone_all.csv');
        const text = await response.text();

        // Parse the CSV data
        const rows = text.split('\n');
        const dataContainer = document.getElementById('data');
        dataContainer.innerHTML = '';

        rows.forEach((row, index) => {
            const cols = row.split(',');
            if (cols.length >= 3 && index > 0) {  // Skipping header row (index > 0)
                const title = cols[0];  // iPhone title
                const price = cols[1];  // iPhone price
                const link = cols[2];   // Link to the Finn.no listing

                // Create a div element for each item
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');

                // Create a clickable link that wraps the title and price
                const linkElement = document.createElement('a');
                linkElement.href = link;         // Link to Finn.no
                linkElement.target = '_blank';   // Opens link in a new tab
                linkElement.innerHTML = `<strong>${title}</strong>: ${price}`;  // Display title and price

                // Append the link to the item div
                itemDiv.appendChild(linkElement);
                
                // Append the item div to the data container
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
