"""
Suit Style Store customer domain logic. `Contact` is the unique identity
for a customer — suitstyle_orders reference customers by Contact rather
than embedding, so a customer document can be updated cheaply on its own.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("suitstyle_customers")

PLATFORM_OPTIONS = ["Instagram", "Facebook", "Whatsapp", "Word of mouth", "Other"]


def create_customer(customer_data):
    existing = db.retrieve_one_document({"Contact": customer_data["Contact"]})
    if existing is not None:
        raise ValueError("A customer with this Contact already exists")

    if customer_data.get("Platform") != "Other":
        customer_data["Platform other"] = ""

    customer_data["Date created"] = datetime.now(timezone.utc).isoformat()
    db.save_document(customer_data)
    return customer_data


def get_customers():
    customers = list(db.retrieve_documents({}, sort_by=[("Date created", -1)]))
    for customer in customers:
        customer["_id"] = str(customer["_id"])
    return customers


def get_customer(contact):
    customer = db.retrieve_one_document({"Contact": contact})
    if customer is not None:
        customer["_id"] = str(customer["_id"])
    return customer


def search_customers(query):
    """Case-insensitive substring match against Name or Contact."""
    condition = {
        "$or": [
            {"Name": {"$regex": query, "$options": "i"}},
            {"Contact": {"$regex": query, "$options": "i"}},
        ]
    }
    customers = list(db.retrieve_documents(condition))
    for customer in customers:
        customer["_id"] = str(customer["_id"])
    return customers


def update_customer(contact, fields_to_update):
    fields_to_update.pop("Contact", None)
    db.update_document({"Contact": contact}, fields_to_update)


def delete_customer(contact):
    db.delete_document({"Contact": contact})
