// Function to load and display iPhone listings from CSV
async function loadIphoneListings() {
    try {
        // Fetch singular iPhone listings
        const listingsResponse = await fetch('singular_iphones.csv');
        if (!listingsResponse.ok) {
            throw new Error(`Failed to load listings CSV: ${listingsResponse.statusText}`);
        }
        const listingsData = await listingsResponse.text();

        // Fetch iPhone statistics (average and median prices)
        const statsResponse = await fetch('iphone_statistics.csv');
        if (!statsResponse.ok) {
            throw new Error(`Failed to load statistics CSV: ${statsResponse.statusText}`);
        }
        const statsData = await statsResponse.text();

        const tableBody = document.querySelector("#iphone-listings tbody");

        // Parse the CSV data into rows
        const listingsRows = listingsData.split('\n');
        const statsRows = statsData.split('\n');

        // Create a dictionary of {model + category + storage} -> {average, median}
        const priceMap = {};
        statsRows.slice(1).forEach(row => {
            const columns = row.split(',');
            if (columns.length >= 5) {
                const [model, category, storage, avgPrice, medPrice] = columns;

                // Normalize storage and model values
                const normalizedStorage = normalizeStorage(storage.trim().toLowerCase());
                const normalizedModel = model.trim().toLowerCase();
                const key = `${normalizedModel}_${category.trim().toLowerCase()}_${normalizedStorage}`;

                priceMap[key] = {
                    average: avgPrice,
                    median: medPrice
                };
            }
        });

        console.log("Price Map:", priceMap); // For debugging

        // Parse the singular listings and display them with average and median prices
        const listingsHeaders = listingsRows[0].split(',');

        for (let i = 1; i < listingsRows.length; i++) {
            const columns = listingsRows[i].split(',');

            if (columns.length === listingsHeaders.length) {
                const tr = document.createElement('tr');

                // Add the listing's information to the table
                columns.forEach((column, index) => {
                    const td = document.createElement('td');
                    if (listingsHeaders[index] === 'link') {
                        const a = document.createElement('a');
                        a.href = column;
                        a.textContent = "View Listing";
                        a.target = "_blank";
                        td.appendChild(a);
                    } else {
                        td.textContent = column;
                    }
                    tr.appendChild(td);
                });

                // Extract the model, category, and storage size from the listing
                const model = columns[0] ? columns[0].trim().toLowerCase() : null;  // Assuming model is in column 0
                const category = columns[3] ? columns[3].trim().toLowerCase() : null;  // Assuming category is in column 3
                const storage = columns[2] ? normalizeStorage(columns[2].trim().toLowerCase()) : "unknown";  // Normalize storage

                // Only proceed if model, category, and storage are defined
                if (model && category && storage) {
                    const key = `${model}_${category}_${storage}`;
                    console.log("Constructed Key:", key); // Debugging

                    // Check if the key exists in priceMap
                    if (priceMap[key]) {
                        const averagePriceTd = document.createElement('td');
                        averagePriceTd.textContent = `${priceMap[key].average} kr`;
                        tr.appendChild(averagePriceTd);

                        const minPriceTd = document.createElement('td');
                        minPriceTd.textContent = `${priceMap[key].median} kr`;
                        tr.appendChild(minPriceTd);
                    } else {
                        console.log(`No match found for key: ${key}`);  // Debugging line to check which listings are failing to match
                        const averagePriceTd = document.createElement('td');
                        averagePriceTd.textContent = 'N/A';
                        tr.appendChild(averagePriceTd);

                        const minPriceTd = document.createElement('td');
                        minPriceTd.textContent = 'N/A';
                        tr.appendChild(minPriceTd);
                    }

                    tableBody.appendChild(tr);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to normalize storage values (e.g., '64 gb' -> '64GB')
function normalizeStorage(storage) {
    // Remove spaces and standardize 'gb' to 'GB'
    return storage.replace(/\s+/g, '').replace('gb', 'GB').replace('gig', 'GB');
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
