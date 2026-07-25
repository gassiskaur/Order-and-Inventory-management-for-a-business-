"""
NKSUITS order domain logic: creation, listing/sorting, status transitions,
and deletion. This is the only module that knows the rules for
nksuits_orders — routes/nksuits_routes.py just calls these functions.
"""

from datetime import datetime, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("nksuits_orders")

COUNTER_COLLECTION = "nksuits_order_counter"

PLATFORM_OPTIONS = ["Instagram", "Facebook", "Whatsapp", "Word of mouth", "Other"]
TYPE_OPTIONS = ["ready-made", "customization"]
STATUS_OPTIONS = ["Created", "Processing", "Dispatched", "Delivered"]


def get_next_order_number():
    counter_db = DBHelper()
    counter_db.select_collection(COUNTER_COLLECTION)
    counter_doc = counter_db.retrieve_one_document({"name": "order_counter"})
    if counter_doc is None:
        counter_db.save_document({"name": "order_counter", "value": 1})
        return 1
    next_value = counter_doc["value"] + 1
    counter_db.update_document({"name": "order_counter"}, {"value": next_value})
    return next_value


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
    order_data["Delivery date"] = ""
    order_data["status_history"] = [{"status": "Created", "changed_on": now_iso}]

    db.save_document(order_data)
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
    Use for non-Delivered status changes (Created / Processing / Dispatched).
    Delivered must go through set_delivery_date so Delivery date is set
    together with Status.
    """
    if new_status not in STATUS_OPTIONS:
        raise ValueError(f"Unknown status: {new_status}")
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
    db.update_document(
        {"order_number": order_number}, {"Dispatch date": dispatch_date}
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
