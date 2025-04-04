import json
import re
import uuid
import databutton as db
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

# Initialize the router
router = APIRouter(prefix="/migration", tags=["migration"], include_in_schema=False)

class MigrationResponse(BaseModel):
    success: bool
    message: str
    result: Optional[Dict[str, Any]] = None

@router.get("/export-data")
def export_data() -> MigrationResponse:
    """
    Export all data from Databutton storage as a single JSON object.
    This can be used to initialize the file-based database in other deployment platforms.
    """
    try:
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
        
        return MigrationResponse(
            success=True,
            message="Data successfully exported",
            result=database
        )
    except Exception as e:
        return MigrationResponse(
            success=False,
            message=f"Error exporting data: {str(e)}"
        )

# Export specific collections
@router.get("/export-collection/{collection_name}")
def export_collection(collection_name: str) -> MigrationResponse:
    """
    Export a specific collection from Databutton storage.
    """
    try:
        collection_name = sanitize_storage_key(collection_name)
        data_json = db.storage.text.get(collection_name, default="[]")
        data = json.loads(data_json)
        
        return MigrationResponse(
            success=True,
            message=f"Collection {collection_name} successfully exported",
            result={collection_name: data}
        )
    except Exception as e:
        return MigrationResponse(
            success=False,
            message=f"Error exporting collection {collection_name}: {str(e)}"
        )

# Sanitize storage key to only allow alphanumeric and ._- symbols
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Additional helper function to export data in the background
def export_data_background(background_tasks: BackgroundTasks):
    """Export data in the background"""
    background_tasks.add_task(export_data_to_file)

def export_data_to_file():
    """Export all data to a JSON file"""
    try:
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
        
        # Save to Databutton storage as a file that can be downloaded
        db.storage.text.put("migration_export.json", database_json)
        
        print("Data successfully exported to migration_export.json")
    except Exception as e:
        print(f"Error exporting data: {e}")

@router.get("/create-export-file")
def create_export_file(background_tasks: BackgroundTasks) -> MigrationResponse:
    """
    Create an export file in the background and store it in Databutton storage.
    The file can then be downloaded and used for migration.
    """
    try:
        background_tasks.add_task(export_data_to_file)
        
        return MigrationResponse(
            success=True,
            message="Export process started in the background. The file will be available at /migration/download-export when complete."
        )
    except Exception as e:
        return MigrationResponse(
            success=False,
            message=f"Error starting export process: {str(e)}"
        )

@router.get("/download-export")
def download_export() -> MigrationResponse:
    """
    Get the URL to download the exported data file.
    """
    try:
        # Check if file exists
        try:
            db.storage.text.get("migration_export.json")
        except:
            return MigrationResponse(
                success=False,
                message="Export file not found. Please run /migration/create-export-file first."
            )
        
        # In a real scenario, we would return a download URL
        # Since we're in Databutton, we'll just return a message to use the UI to download
        
        return MigrationResponse(
            success=True,
            message="Export file is ready. Please use Databutton's storage UI to download 'migration_export.json'."
        )
    except Exception as e:
        return MigrationResponse(
            success=False,
            message=f"Error checking export file: {str(e)}"
        )
