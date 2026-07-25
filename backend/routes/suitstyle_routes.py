"""
HTTP layer for Suit Style Store. Every function here is a thin wrapper:
parse the request, call a processing_agent.suitstyle function, translate
ValueError into an HTTP 400. No business logic lives in this file.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.dependencies import require_auth
from processing_agent.suitstyle import analytics, customers, inventory, orders

router = APIRouter(prefix="/api/suitstyle", tags=["suitstyle"])


class CustomerCreate(BaseModel):
    Name: str
    Address: str
    Contact: str
    Remarks: str = ""
    Platform: str
    platform_other: str = Field("", alias="Platform other")

    class Config:
        populate_by_name = True


class CustomerUpdate(BaseModel):
    Name: str | None = None
    Address: str | None = None
    Remarks: str | None = None
    Platform: str | None = None
    platform_other: str | None = Field(None, alias="Platform other")

    class Config:
        populate_by_name = True


class OrderCreate(BaseModel):
    Contact: str
    actual_price: float = Field(..., alias="Actual price")
    sale_price: float = Field(..., alias="sale price")

    class Config:
        populate_by_name = True


class VendorCreate(BaseModel):
    vendor_name: str


class StockCreate(BaseModel):
    vendor_name: str
    cost_of_stock: float = Field(..., alias="Cost of stock")

    class Config:
        populate_by_name = True


# --- Customers -------------------------------------------------------

@router.get("/customers")
def list_customers(q: str | None = None, user=Depends(require_auth)):
    if q:
        return customers.search_customers(q)
    return customers.get_customers()


@router.get("/customers/{contact}")
def get_customer(contact: str, user=Depends(require_auth)):
    customer = customers.get_customer(contact)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/customers")
def create_customer(payload: CustomerCreate, user=Depends(require_auth)):
    customer_data = {
        "Name": payload.Name,
        "Address": payload.Address,
        "Contact": payload.Contact,
        "Remarks": payload.Remarks,
        "Platform": payload.Platform,
        "Platform other": payload.platform_other,
    }
    try:
        return customers.create_customer(customer_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/customers/{contact}")
def update_customer(contact: str, payload: CustomerUpdate, user=Depends(require_auth)):
    fields = payload.dict(by_alias=True, exclude_none=True)
    customers.update_customer(contact, fields)
    return {"ok": True}


@router.delete("/customers/{contact}")
def delete_customer(contact: str, user=Depends(require_auth)):
    customers.delete_customer(contact)
    return {"ok": True}


# --- Orders ------------------------------------------------------------

@router.get("/customers/{contact}/orders")
def list_orders_for_customer(contact: str, user=Depends(require_auth)):
    return orders.get_orders_for_customer(contact)


@router.post("/orders")
def add_order(payload: OrderCreate, user=Depends(require_auth)):
    order_data = {
        "Contact": payload.Contact,
        "Actual price": payload.actual_price,
        "sale price": payload.sale_price,
    }
    try:
        return orders.add_order(order_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/customers/{contact}/orders/{order_number}")
def delete_order(contact: str, order_number: int, user=Depends(require_auth)):
    orders.delete_order(contact, order_number)
    return {"ok": True}


# --- Inventory -----------------------------------------------------------

@router.get("/vendors")
def list_vendors(user=Depends(require_auth)):
    return inventory.get_vendors()


@router.post("/vendors")
def add_vendor(payload: VendorCreate, user=Depends(require_auth)):
    try:
        return inventory.add_vendor(payload.vendor_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/stock")
def list_all_stock(user=Depends(require_auth)):
    return inventory.get_all_stock()


@router.get("/vendors/{vendor_name}/stock")
def list_stock_for_vendor(vendor_name: str, user=Depends(require_auth)):
    return inventory.get_stock_by_vendor(vendor_name)


@router.post("/stock")
def add_stock(payload: StockCreate, user=Depends(require_auth)):
    try:
        return inventory.add_stock(payload.vendor_name, payload.cost_of_stock)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# --- Analytics -----------------------------------------------------------

@router.get("/analytics")
def get_analytics(user=Depends(require_auth)):
    return analytics.get_all_window_summaries()


@router.get("/options")
def get_options(user=Depends(require_auth)):
    return {"platforms": customers.PLATFORM_OPTIONS}
