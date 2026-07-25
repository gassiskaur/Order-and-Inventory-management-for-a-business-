"""
Suit Style Store order domain logic. Orders are stored in their own
collection, referenced by `Contact` rather than embedded in the customer
document, so adding an order never requires rewriting the whole customer.

order_number is scoped per-customer (per Contact) and comes from a
persisted counter document keyed by Contact, so deleting an order never
disrupts numbering for that customer.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("suitstyle_orders")

COUNTER_COLLECTION = "suitstyle_order_counter"


def _validate_prices(actual_price, sale_price):
    if actual_price <= 0:
        raise ValueError("Actual price must be > 0")
    if actual_price < sale_price:
        raise ValueError("Actual price less than sale price, LOSS")


def get_next_order_number_for_contact(contact):
    counter_db = DBHelper()
    counter_db.select_collection(COUNTER_COLLECTION)
    counter_doc = counter_db.retrieve_one_document({"contact": contact})
    if counter_doc is None:
        counter_db.save_document({"contact": contact, "value": 1})
        return 1
    next_value = counter_doc["value"] + 1
    counter_db.update_document({"contact": contact}, {"value": next_value})
    return next_value


def add_order(order_data):
    actual_price = order_data["Actual price"]
    sale_price = order_data["sale price"]
    _validate_prices(actual_price, sale_price)

    order_data["discount given"] = ((actual_price - sale_price) / actual_price) * 100
    order_data["order_number"] = get_next_order_number_for_contact(
        order_data["Contact"]
    )
    order_data["Date created"] = datetime.now(timezone.utc).isoformat()

    db.save_document(order_data)
    order_data["_id"] = str(order_data["_id"])
    return order_data


def get_orders_for_customer(contact):
    orders = list(
        db.retrieve_documents({"Contact": contact}, sort_by=[("order_number", -1)])
    )
    for order in orders:
        order["_id"] = str(order["_id"])
    return orders


def delete_order(contact, order_number):
    db.delete_document({"Contact": contact, "order_number": order_number})
