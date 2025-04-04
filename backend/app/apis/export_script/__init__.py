import json
import databutton as db
from fastapi import APIRouter

router = APIRouter(include_in_schema=False)

"""
DigitalOcean Migration Script

Run this in Databutton's Python console to export all your data to a JSON file.

1. Open the Python console in Databutton
2. Paste this entire script
3. Run it
4. Download the exported file from Databutton storage
"""

def export_data_for_digitalocean():
    # Collections to export
    collections = ['users', 'products', 'orders', 'addresses', 'carts']
    
    # Create the database structure
    database = {}
    
    # Export each collection
    for collection in collections:
        try:
            data_json = db.storage.text.get(collection, default="[]")
            database[collection] = json.loads(data_json)
            print(f"Exported {len(database[collection])} items from {collection}")
        except Exception as e:
            print(f"Error exporting {collection}: {e}")
            database[collection] = []
    
    # Convert to JSON
    database_json = json.dumps(database, indent=2)
    
    # Save to Databutton storage
    db.storage.text.put("migration_export.json", database_json)
    
    print("\nData successfully exported to 'migration_export.json'")
    print("You can now download this file from Databutton storage")
    print("\nCollection stats:")
    for collection, items in database.items():
        print(f"  - {collection}: {len(items)} items")

# Don't run the function when importing the module
# export_data_for_digitalocean()
