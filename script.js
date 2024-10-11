// Function to load and display iPhone listings from the combined CSV
async function loadIphoneListings() {
    try {
        // Fetch the combined iPhone listings CSV
        const response = await fetch('iphone_combined.csv');
        if (!response.ok) {
            throw new Error(`Failed to load listings CSV: ${response.statusText}`);
        }
        const data = await response.text();

        const tableBody = document.querySelector("#iphone-listings tbody");

        // Parse the CSV data into rows
        const rows = data.split('\n');

        // Extract the headers
        const headers = rows[0].split(',');

        // Loop through each row and create a table entry for each
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');

            if (columns.length === headers.length) {
                const tr = document.createElement('tr');

                // Loop through each column and append the data to the table row
                columns.forEach((column, index) => {
                    const td = document.createElement('td');
                    if (headers[index] === 'link') {
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

                // Append the row to the table body
                tableBody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
