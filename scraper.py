import requests
from bs4 import BeautifulSoup
import csv
import time
import statistics
import re

# Function to check if a title matches iPhone models 11 and up
def is_desired_iphone(title):
    # List of iPhone models we are interested in (11 and up)
    valid_models = ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', "iPhone 16"]

    # Check if any of the valid models are in the title
    return any(model in title for model in valid_models)

def is_single_phone_listing(title):
    # Common indicators of multiple phones
    multiples_indicators = ['2x', '3x', '4x', 'pair', 'bundle', 'lot', 'multiple', 'sets', ',', '/']
    return not any(indicator.lower() in title.lower() for indicator in multiples_indicators)


def scrape_data(url):
    items = []
    page = 1  # Start from the first page

    while True:
        # Update the URL to include the current page number
        page_url = f"{url}&page={page}"
        response = requests.get(page_url)

        # Check if the request was successful
        if response.status_code != 200:
            print(f"Failed to retrieve page {page}: {response.status_code}")
            break

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all the article elements (listings) on the page
        listings = soup.find_all('article', class_='relative')

        # If no listings are found, we've likely reached the last page
        if not listings:
            print("No more listings found. Scraping complete.")
            break

        # Loop through each listing and extract the required data
        for item in listings:
            title = item.find('h2', class_='h4').text.strip() if item.find('h2', class_='h4') else 'No title'

            # Filter out unwanted iPhones (keep only iPhone 11 and higher)
            if is_desired_iphone(title):
                price_tag = item.find('div', class_='absolute bottom-0')
                price = price_tag.text.strip() if price_tag else 'No price'
                link_tag = item.find('a', class_='sf-search-ad-link')
                link = f"{link_tag['href']}" if link_tag else 'No link'

                # Append the filtered iPhone listing to the items list
                items.append({'title': title, 'price': price, 'link': link})

        print(f"Scraped page {page}")

        # Check if a "Next" button or pagination link is available
        next_button = soup.find('a', {'aria-label': 'Neste resultatside'})  # The 'aria-label' is often used for next buttons
        if not next_button:
            # No more pages, exit the loop
            print("No more pages found.")
            break
        else:
            # Increment the page number and continue scraping
            page += 1

    return items  # Return the scraped items as a list


# Function to clean and convert price string to integer
def clean_price(price_str):
    # Use regex to extract only digits
    cleaned_price = re.sub(r'\D', '', price_str)  # Removes all non-digit characters
    return int(cleaned_price) if cleaned_price else None

def load_average_prices(average_prices_file):
    model_averages = {}

    with open(average_prices_file, mode='r', newline='', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            model = row['Model']
            average_price = float(row['Average Price (kr)'])
            model_averages[model] = average_price

    return model_averages
# Function to categorize iPhone model as 'Regular', 'Pro', or 'Pro Max'
def categorize_model(title):
    # Check for "Pro Max" first, then "Pro", and default to "Regular"
    if 'Pro Max' in title:
        return 'Pro Max'
    elif 'Pro' in title:
        return 'Pro'
    else:
        return 'Regular'

# Function to extract storage size from title, with normalization
def extract_storage_size(title):
    # Look for storage size in GB, gb, Gb, etc.
    storage_match = re.search(r'(\d+)\s*[gG][bB]', title)
    if storage_match:
        return f"{storage_match.group(1)}GB"  # Normalize storage size to 'XXGB' format
    return 'Unknown'  # If no storage size is found, return 'Unknown'
# Function to calculate average and median price of each iPhone model
def calculate_statistics_and_save(items, statistics_file='iphone_statistics.csv', singular_phones_file='singular_iphones.csv'):
    model_prices = {
        'iPhone 11': {'Regular': {}, 'Pro': {}, 'Pro Max': {}},
        'iPhone 12': {'Regular': {}, 'Pro': {}, 'Pro Max': {}},
        'iPhone 13': {'Regular': {}, 'Pro': {}, 'Pro Max': {}},
        'iPhone 14': {'Regular': {}, 'Pro': {}, 'Pro Max': {}},
        'iPhone 15': {'Regular': {}, 'Pro': {}, 'Pro Max': {}},
        'iPhone 16': {'Regular': {}, 'Pro': {}, 'Pro Max': {}}
    }

    singular_phones = []  # List to store singular iPhone listings

    # Group prices by model, category, and storage, and filter for singular phones
    for item in items:
        for model in model_prices.keys():
            if model in item['title']:
                try:
                    # Check if the listing is for a singular phone
                    if is_single_phone_listing(item['title']):
                        price = clean_price(item['price'])
                        if price is not None:
                            # Categorize the iPhone model and extract the storage size
                            category = categorize_model(item['title'])
                            storage = extract_storage_size(item['title'])

                            # Initialize storage category if it doesn't exist
                            if storage not in model_prices[model][category]:
                                model_prices[model][category][storage] = []

                            # Add price to the correct model, category, and storage group
                            model_prices[model][category][storage].append(price)

                            # Add the singular phone listing with the category and storage
                            item['category'] = category
                            item['storage'] = storage
                            singular_phones.append(item)
                except ValueError:
                    print(f"Warning: Could not convert price '{item['price']}' to integer.")
                break

    # Prepare data to be written to the statistics CSV file
    results = []

    for model, categories in model_prices.items():
        for category, storages in categories.items():
            for storage, prices in storages.items():
                if prices:
                    average_price = sum(prices) / len(prices)  # Calculate the average
                    median_price = statistics.median(prices)   # Calculate the median
                    results.append({
                        'Model': model,
                        'Category': category,
                        'Storage': storage,
                        'Average Price (kr)': f"{average_price:.2f}",
                        'Median Price (kr)': f"{median_price:.2f}"
                    })
                else:
                    # If no prices found for the category and storage
                    results.append({
                        'Model': model,
                        'Category': category,
                        'Storage': storage,
                        'Average Price (kr)': 'No data',
                        'Median Price (kr)': 'No data'
                    })

    # Write the statistics data to a CSV file
    with open(statistics_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['Model', 'Category', 'Storage', 'Average Price (kr)', 'Median Price (kr)'])
        writer.writeheader()
        writer.writerows(results)

    print(f"Statistics saved to '{statistics_file}'.")

    # Write the singular iPhone listings to a separate CSV file, including the category and storage
    with open(singular_phones_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'price', 'link', 'category', 'storage'])
        writer.writeheader()
        writer.writerows(singular_phones)

    print(f"Singular iPhone listings saved to '{singular_phones_file}'.")


if __name__ == '__main__':
    low=scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=500&price_to=2500&product_category=2.93.3217.39&q=iphone")
    mid=scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=2500&price_to=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC")
    high=scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC")


    items = low+mid+high

    # Calculate statistics and save to CSV
    calculate_statistics_and_save(items)
    
