"""
NKSUITS dashboard analytics: order counts and sales figures bucketed by
time window. All windows are computed from `Date created`.
"""

from datetime import datetime, timedelta, timezone

from processing_agent.db_helper import DBHelper

db = DBHelper()
db.select_collection("nksuits_orders")

WINDOW_DAYS = {
    "weekly": 7,
    "monthly": 30,
    "six_monthly": 182,
    "yearly": 365,
}


def _parse_date(value):
    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def _summarize(orders):
    total_orders = len(orders)
    total_actual = sum(o.get("Actual price", 0) for o in orders)
    total_sale = sum(o.get("sale price", 0) for o in orders)
    delivered = sum(1 for o in orders if o.get("Status") == "Delivered")
    return {
        "order_count": total_orders,
        "delivered_count": delivered,
        "total_actual_price": total_actual,
        "total_sale_price": total_sale,
        "total_discount_given": total_actual - total_sale,
    }


def get_summary_for_window(window_name):
    if window_name not in WINDOW_DAYS:
        raise ValueError(f"Unknown window: {window_name}")

    cutoff = datetime.now(timezone.utc) - timedelta(days=WINDOW_DAYS[window_name])
    all_orders = list(db.retrieve_documents({}))

    windowed = []
    for order in all_orders:
        created = _parse_date(order.get("Date created"))
        if created is not None and created >= cutoff:
            windowed.append(order)

    return _summarize(windowed)


def get_all_window_summaries():
    return {window: get_summary_for_window(window) for window in WINDOW_DAYS}
