"""
Suit Style Store inventory: vendors and stock cost entries.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

vendors_db = DBHelper()
vendors_db.select_collection("suitstyle_vendors")

stock_db = DBHelper()
stock_db.select_collection("suitstyle_stock")


def add_vendor(vendor_name):
    existing = vendors_db.retrieve_one_document({"vendor_name": vendor_name})
    if existing is not None:
        raise ValueError("A vendor with this name already exists")
    vendor = {"vendor_name": vendor_name}
    vendors_db.save_document(vendor)
    vendor["_id"] = str(vendor["_id"])
    return vendor


def get_vendors():
    vendors = list(vendors_db.retrieve_documents({}, sort_by=[("vendor_name", 1)]))
    for vendor in vendors:
        vendor["_id"] = str(vendor["_id"])
    return vendors


def add_stock(vendor_name, cost_of_stock):
    vendor = vendors_db.retrieve_one_document({"vendor_name": vendor_name})
    if vendor is None:
        raise ValueError("Vendor does not exist — add the vendor first")

    stock_entry = {
        "vendor_name": vendor_name,
        "Cost of stock": cost_of_stock,
        "Date created": datetime.now(timezone.utc).isoformat(),
    }
    stock_db.save_document(stock_entry)
    stock_entry["_id"] = str(stock_entry["_id"])
    return stock_entry


def get_stock_by_vendor(vendor_name):
    stock_entries = list(
        stock_db.retrieve_documents(
            {"vendor_name": vendor_name}, sort_by=[("Date created", -1)]
        )
    )
    for entry in stock_entries:
        entry["_id"] = str(entry["_id"])
    return stock_entries


def get_all_stock():
    stock_entries = list(stock_db.retrieve_documents({}, sort_by=[("Date created", -1)]))
    for entry in stock_entries:
        entry["_id"] = str(entry["_id"])
    return stock_entries
