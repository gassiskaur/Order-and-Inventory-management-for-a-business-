"""
Suit Style Store order domain logic. Orders are stored in their own
collection, referenced by `Contact` rather than embedded in the customer
document, so adding an order never requires rewriting the whole customer.

order_number is scoped per-customer (per Contact): it's one past the
highest order_number that customer currently has (1 if they have none),
so numbering always reflects what's actually there for that customer.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("suitstyle_orders")


def _validate_prices(actual_price, sale_price):
    if actual_price <= 0:
        raise ValueError("Actual price must be > 0")
    if actual_price < sale_price:
        raise ValueError("Actual price less than sale price, LOSS")


def get_next_order_number_for_contact(contact):
    existing_orders = list(db.retrieve_documents({"Contact": contact}))
    if not existing_orders:
        return 1
    return max(order["order_number"] for order in existing_orders) + 1


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
