"""
NKSUITS order domain logic: creation, listing/sorting, status transitions,
and deletion. This is the only module that knows the rules for
nksuits_orders — routes/nksuits_routes.py just calls these functions.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("nksuits_orders")

PLATFORM_OPTIONS = ["Instagram", "Facebook", "Whatsapp", "Word of mouth", "Other"]
TYPE_OPTIONS = ["ready-made", "customization"]
STATUS_OPTIONS = ["Created", "Processing", "Dispatched", "Delivered"]


def get_next_order_number():
    """
    Next order number is one past the highest order_number currently in
    the collection (1 if the collection is empty). This means numbering
    always reflects what's actually there — delete every order and the
    next one starts back at 1 — while still never colliding: deleting an
    order from the middle of the sequence doesn't free up its number for
    reuse, since anything created after it will always be higher than
    the current max.
    """
    existing_orders = list(db.retrieve_documents({}))
    if not existing_orders:
        return 1
    return max(order["order_number"] for order in existing_orders) + 1


def _validate_prices(actual_price, sale_price):
    if actual_price <= 0:
        raise ValueError("Actual price must be > 0")
    if actual_price < sale_price:
        raise ValueError("Actual price less than sale price, LOSS")


def create_order(order_data):
    actual_price = order_data["Actual price"]
    sale_price = order_data["sale price"]
    _validate_prices(actual_price, sale_price)

    if order_data.get("Platform") != "Other":
        order_data["Platform other"] = ""

    order_data["discount given"] = ((actual_price - sale_price) / actual_price) * 100
    order_data["order_number"] = get_next_order_number()
    now_iso = datetime.now(timezone.utc).isoformat()
    order_data["Date created"] = now_iso
    order_data["Status"] = "Created"
    order_data["Dispatch date"] = order_data.get("Dispatch date", "")
    order_data["Delivery date"] = ""
    order_data["status_history"] = [{"status": "Created", "changed_on": now_iso}]

    db.save_document(order_data)
    order_data["_id"] = str(order_data["_id"])
    return order_data


def get_orders_sorted():
    all_orders = list(db.retrieve_documents({}))
    for order in all_orders:
        order["_id"] = str(order["_id"])

    not_delivered = [o for o in all_orders if o["Status"] != "Delivered"]
    delivered = [o for o in all_orders if o["Status"] == "Delivered"]
    not_delivered.sort(key=lambda o: o.get("Date created", ""), reverse=True)
    delivered.sort(key=lambda o: o.get("Delivery date", ""), reverse=True)
    return not_delivered + delivered


def get_order(order_number):
    order = db.retrieve_one_document({"order_number": order_number})
    if order is not None:
        order["_id"] = str(order["_id"])
    return order


def update_status(order_number, new_status):
    """
    Use only for status changes that aren't tied to a date (Created /
    Processing). Dispatched and Delivered must go through
    set_dispatch_date / set_delivery_date so the relevant date is always
    set together with the status — never one without the other.
    """
    if new_status not in STATUS_OPTIONS:
        raise ValueError(f"Unknown status: {new_status}")
    if new_status == "Dispatched":
        raise ValueError("Use set_dispatch_date to transition to Dispatched")
    if new_status == "Delivered":
        raise ValueError("Use set_delivery_date to transition to Delivered")

    now_iso = datetime.now(timezone.utc).isoformat()
    order = db.retrieve_one_document({"order_number": order_number})
    if order is None:
        raise ValueError("Order not found")

    history = order.get("status_history", [])
    history.append({"status": new_status, "changed_on": now_iso})

    db.update_document(
        {"order_number": order_number},
        {"Status": new_status, "status_history": history},
    )


def set_dispatch_date(order_number, dispatch_date):
    """
    Sets Dispatch date and Status together — picking a dispatch date
    always moves the order to "Dispatched", the same way picking a
    delivery date always moves it to "Delivered".
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    order = db.retrieve_one_document({"order_number": order_number})
    if order is None:
        raise ValueError("Order not found")

    history = order.get("status_history", [])
    history.append({"status": "Dispatched", "changed_on": now_iso})

    db.update_document(
        {"order_number": order_number},
        {
            "Status": "Dispatched",
            "Dispatch date": dispatch_date,
            "status_history": history,
        },
    )


def set_delivery_date(order_number, delivery_date):
    now_iso = datetime.now(timezone.utc).isoformat()
    order = db.retrieve_one_document({"order_number": order_number})
    if order is None:
        raise ValueError("Order not found")

    history = order.get("status_history", [])
    history.append({"status": "Delivered", "changed_on": now_iso})

    db.update_document(
        {"order_number": order_number},
        {
            "Status": "Delivered",
            "Delivery date": delivery_date,
            "status_history": history,
        },
    )


def delete_order(order_number):
    db.delete_document({"order_number": order_number})


def get_order_count_for_contact(contact):
    return db.count_documents({"Contact": contact})
