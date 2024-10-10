        // Function to load and display iPhone data from CSV
        async function loadIphoneListings() {
            const response = await fetch('singular_iphones.csv'); // Path to your CSV file
            const data = await response.text();

            const tableBody = document.querySelector("#iphone-listings tbody");

            // Split the CSV data into rows
            const rows = data.split('\n');

            // Parse the CSV headers
            const headers = rows[0].split(',');

            // Loop through each row of the CSV (skip the first row which is headers)
            for (let i = 1; i < rows.length; i++) {
                const columns = rows[i].split(',');

                // Ensure the row has the expected number of columns
                if (columns.length === headers.length) {
                    // Create a new table row
                    const tr = document.createElement('tr');

                    // Create cells for each column (title, price, link, category, storage)
                    columns.forEach((column, index) => {
                        const td = document.createElement('td');

                        // If the column is a link, create an anchor tag
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

                    // Append the new row to the table body
                    tableBody.appendChild(tr);
                }
            }
        }

        // Load iPhone listings when the page is loaded
        window.onload = loadIphoneListings;
