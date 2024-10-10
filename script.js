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
            const [model, category, storage, avgPrice, medPrice] = row.split(',');

            // Create a key from model + category + storage
            const key = `${model.trim().toLowerCase()}_${category.trim().toLowerCase()}_${storage.trim().toLowerCase()}`;
            priceMap[key] = {
                average: avgPrice,
                median: medPrice
            };
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
                const model = columns[0].trim().toLowerCase();  // Assuming model is in column 0
                const category = columns[3].trim().toLowerCase();  // Assuming category is in column 3
                const storage = columns[2] ? columns[2].trim().toLowerCase() : "unknown";  // Assuming storage is in column 2

                // Create a key using model + category + storage
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
    } catch (error) {
        console.error(error);
    }
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
