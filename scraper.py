import requests
from bs4 import BeautifulSoup
import csv
import time
import statistics
import re


valid_storage_sizes = [64, 128, 256, 512]

# Function to find the closest valid storage size
def closest_storage_size(storage_value):
    try:
        # Convert the extracted storage size to an integer
        storage_value_int = int(storage_value)

        # Find the closest valid size
        closest_size = min(valid_storage_sizes, key=lambda x: abs(x - storage_value_int))
        return f"{closest_size}GB"
    except ValueError:
        return 'Unknown'

# Function to check if a title matches iPhone models 11 and up
def is_desired_iphone(title):
    # List of iPhone models we are interested in (11 and up)
    valid_models = ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', "iPhone 16"]

    # Check if any of the valid models are in the title
    return any(model in title for model in valid_models)

def is_single_phone_listing(title):
    # Common indicators of multiple phones
    multiples_indicators = [ ',', '/', 'kjøper', 'kjøpe', 'ønsker', 'ønskes', 'se', 'mini', 'deksel']
    return not any(indicator.lower() in title.lower() for indicator in multiples_indicators)




# Function to extract iPhone model from the title
def extract_model(title):
    # List of valid iPhone models (add more as needed)
    valid_models = ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15']

    for model in valid_models:
        if model in title:
            return model
    return 'Unknown'  # If no valid model is found





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
    title_lower = title.lower()  # Convert the title to lowercase for consistent matching
    if 'pro max' in title_lower:
        return 'Pro Max'
    elif 'pro' in title_lower:
        return 'Pro'
    else:
        return 'Regular'

def extract_storage_size(title):
    # Look for storage size in GB, gb, Gb, etc.
    storage_match = re.search(r'(\d+)\s*[gG][bB]', title)
    if storage_match:
        storage_value = storage_match.group(1)
        return closest_storage_size(storage_value)  # Find the closest valid size
    return 'Unknown'



# Function to scrape data from the website and return listings
def scrape_data(url):
    items = []
    page = 1
    while True:
        page_url = f"{url}&page={page}"
        response = requests.get(page_url)
        if response.status_code != 200:
            break
        soup = BeautifulSoup(response.content, 'html.parser')
        listings = soup.find_all('article', class_='relative')
        if not listings:
            break

        for item in listings:
            title = item.find('h2', class_='h4').text.strip() if item.find('h2', class_='h4') else 'No title'
            if is_desired_iphone(title):
                price_tag = item.find('div', class_='absolute bottom-0')
                price = price_tag.text.strip() if price_tag else 'No price'
                link_tag = item.find('a', class_='sf-search-ad-link')
                link = f"{link_tag['href']}" if link_tag else 'No link'

                cleaned_price = clean_price(price)
                model = extract_model(title)  # Extract iPhone model

                # Ensure category and storage are always present
                category = categorize_model(title) if categorize_model(title) else 'Unknown'
                storage = extract_storage_size(title) if extract_storage_size(title) else 'Unknown'

                items.append({
                    'title': title,
                    'price': cleaned_price,
                    'link': link,
                    'model': model,  # Include model in the data
                    'category': category,
                    'storage': storage
                })
        print(f"Scraped page {page}")

        next_button = soup.find('a', {'aria-label': 'Neste resultatside'})  # The 'aria-label' is often used for next buttons
        if not next_button:
            # No more pages, exit the loop
            print("No more pages found.")
            break
        else:
            # Increment the page number and continue scraping
            page += 1
        #time.sleep(2)  # Be polite and wait before fetching the next page

    return items

# Function to calculate statistics and merge them with individual listings
def calculate_and_merge_statistics(items, output_file='iphone.csv'):
    # Dictionary to store prices for each (model, category, storage)
    price_data = {}

    # Collect price data based on model, category, and storage
    for item in items:
        key = (item['model'], item.get('category', 'Unknown'), item.get('storage', 'Unknown'))  # Use model as key
        if key not in price_data:
            price_data[key] = []
        if item['price'] is not None:
            price_data[key].append(item['price'])

    # Calculate average and median prices for each key
    stats = {}
    for key, prices in price_data.items():
        if prices:
            avg_price = sum(prices) / len(prices)
            med_price = statistics.median(prices)
            stats[key] = {
                'average_price': f"{avg_price:.2f}",
                'median_price': f"{med_price:.2f}"
            }
        else:
            stats[key] = {'average_price': 'N/A', 'median_price': 'N/A'}

    # Merge the statistics back into the original items list
    merged_items = []
    for item in items:
        key = (item['model'], item.get('category', 'Unknown'), item.get('storage', 'Unknown'))  # Same key format
        if key in stats:
            item['average_price'] = stats[key]['average_price']
            item['median_price'] = stats[key]['median_price']
        else:
            item['average_price'] = 'N/A'
            item['median_price'] = 'N/A'
        merged_items.append(item)

    # Write the merged data to a CSV file with the new 'model' column
    with open(output_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'price', 'link', 'model', 'category', 'storage', 'average_price', 'median_price'])
        writer.writeheader()
        writer.writerows(merged_items)

    print(f"Combined data saved to '{output_file}'.")



if __name__ == '__main__':
    # Scrape data from Finn.no
    all_items = []
    all_items.extend(scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=500&price_to=2500&product_category=2.93.3217.39&q=iphone"))
    all_items.extend(scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=2500&price_to=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC"))
    all_items.extend(scrape_data("https://www.finn.no/bap/forsale/search.html?price_from=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC"))

    # Calculate statistics and merge with individual listings
    calculate_and_merge_statistics(all_items)
