"""
Suit Style Store dashboard analytics: order and stock-cost figures
bucketed by time window, computed from `Date created`.
"""

from datetime import datetime, timedelta, timezone

from processing_agent.db_helper import DBHelper

orders_db = DBHelper()
orders_db.select_collection("suitstyle_orders")

stock_db = DBHelper()
stock_db.select_collection("suitstyle_stock")

customers_db = DBHelper()
customers_db.select_collection("suitstyle_customers")

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


def _within_window(documents, cutoff):
    return [
        doc
        for doc in documents
        if (created := _parse_date(doc.get("Date created"))) is not None
        and created >= cutoff
    ]


def get_summary_for_window(window_name):
    if window_name not in WINDOW_DAYS:
        raise ValueError(f"Unknown window: {window_name}")

    cutoff = datetime.now(timezone.utc) - timedelta(days=WINDOW_DAYS[window_name])

    all_orders = list(orders_db.retrieve_documents({}))
    all_stock = list(stock_db.retrieve_documents({}))
    all_customers = list(customers_db.retrieve_documents({}))

    windowed_orders = _within_window(all_orders, cutoff)
    windowed_stock = _within_window(all_stock, cutoff)
    windowed_customers = _within_window(all_customers, cutoff)

    total_actual = sum(o.get("Actual price", 0) for o in windowed_orders)
    total_sale = sum(o.get("sale price", 0) for o in windowed_orders)
    total_stock_cost = sum(s.get("Cost of stock", 0) for s in windowed_stock)

    return {
        "order_count": len(windowed_orders),
        "new_customer_count": len(windowed_customers),
        "total_actual_price": total_actual,
        "total_sale_price": total_sale,
        "total_discount_given": total_actual - total_sale,
        "total_stock_cost": total_stock_cost,
    }


def get_all_window_summaries():
    return {window: get_summary_for_window(window) for window in WINDOW_DAYS}
