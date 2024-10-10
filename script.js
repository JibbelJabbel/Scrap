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

        // Create a dictionary of model + storage -> average and median prices
        const priceMap = {};
        statsRows.slice(1).forEach(row => {
            const [model, category, storage, avgPrice, medPrice] = row.split(',');

            // Ensure model and storage are defined before trimming
            if (model && storage) {
                const key = `${model.toLowerCase().trim()}_${storage.toLowerCase().trim()}`; // Create a key with model and storage
                priceMap[key] = {
                    average: avgPrice,
                    median: medPrice
                };
            }
        });

        // Log the price map to debug
        console.log("Price Map:", priceMap);

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

                // Extract the model name and storage size from the listing
                let title = columns[0].toLowerCase();
                let storage = columns[2] ? columns[2].toLowerCase() : "unknown"; // Assuming storage size is in column 2, or set to unknown if missing

                // Clean up title by removing extra words like "with storage", "+ gold", etc.
                title = title.replace(/[\+\-\,\.]/g, ''); // Remove symbols
                title = title.replace(/[^a-z0-9 ]/g, '').trim(); // Remove special characters and trim spaces

                // Normalize storage size (e.g., convert "128 gb" to "128GB")
                storage = storage.replace(/\s+/g, '').replace('gb', 'GB'); // Remove spaces and normalize GB

                console.log("Cleaned title:", title, "Storage:", storage);  // Debugging line to see cleaned title and storage

                let matchedKey = null;

                // Try to match the model in the listing with the ones in the statistics CSV
                Object.keys(priceMap).forEach(key => {
                    const [modelPart, storagePart] = key.split('_');
                    if (title.includes(modelPart) && storage.includes(storagePart)) {
                        matchedKey = key;
                    }
                });

                console.log("Matched key:", matchedKey);  // Debugging line to see matched keys

                // Add the average and median prices to the table, if a match is found
                if (matchedKey && priceMap[matchedKey]) {
                    const averagePriceTd = document.createElement('td');
                    averagePriceTd.textContent = `${priceMap[matchedKey].average} kr`;
                    tr.appendChild(averagePriceTd);

                    const minPriceTd = document.createElement('td');
                    minPriceTd.textContent = `${priceMap[matchedKey].median} kr`;
                    tr.appendChild(minPriceTd);
                } else {
                    console.log(`No match found for title: ${title} with storage: ${storage}`);  // Debugging line to check which listings are failing to match
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
    } catch (error) {
        console.error(error);
    }
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
