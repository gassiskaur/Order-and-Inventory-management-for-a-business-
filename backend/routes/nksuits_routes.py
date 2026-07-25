"""
HTTP layer for NK Suits Botique. Every function here is a thin wrapper:
parse the request, call a processing_agent.nksuits function, translate
ValueError into an HTTP 400. No business logic lives in this file.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.dependencies import require_auth
from processing_agent.nksuits import analytics, orders

router = APIRouter(prefix="/api/nksuits", tags=["nksuits"])

# Pydantic field names with spaces can't be written as normal Python
# identifiers, so the request models below use Field(alias=...) to accept
# the exact JSON keys from Part 2's data models while keeping readable
# Python attribute names internally.


class OrderCreate(BaseModel):
    Name: str
    Address: str
    Contact: str
    Remarks: str = ""
    Platform: str
    platform_other: str = Field("", alias="Platform other")
    Type: str
    actual_price: float = Field(..., alias="Actual price")
    sale_price: float = Field(..., alias="sale price")

    class Config:
        populate_by_name = True


class DispatchDateUpdate(BaseModel):
    dispatch_date: str = Field(..., alias="Dispatch date")

    class Config:
        populate_by_name = True


class DeliveryDateUpdate(BaseModel):
    delivery_date: str = Field(..., alias="Delivery date")

    class Config:
        populate_by_name = True


class StatusUpdate(BaseModel):
    Status: str


@router.get("/orders")
def list_orders(user=Depends(require_auth)):
    return orders.get_orders_sorted()


@router.get("/orders/{order_number}")
def get_order(order_number: int, user=Depends(require_auth)):
    order = orders.get_order(order_number)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/orders")
def create_order(payload: OrderCreate, user=Depends(require_auth)):
    order_data = {
        "Name": payload.Name,
        "Address": payload.Address,
        "Contact": payload.Contact,
        "Remarks": payload.Remarks,
        "Platform": payload.Platform,
        "Platform other": payload.platform_other,
        "Type": payload.Type,
        "Actual price": payload.actual_price,
        "sale price": payload.sale_price,
        "Dispatch date": "",
    }
    try:
        return orders.create_order(order_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/orders/{order_number}/status")
def update_status(order_number: int, payload: StatusUpdate, user=Depends(require_auth)):
    try:
        orders.update_status(order_number, payload.Status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"ok": True}


@router.patch("/orders/{order_number}/dispatch-date")
def set_dispatch_date(
    order_number: int, payload: DispatchDateUpdate, user=Depends(require_auth)
):
    orders.set_dispatch_date(order_number, payload.dispatch_date)
    return {"ok": True}


@router.patch("/orders/{order_number}/deliver")
def deliver_order(
    order_number: int, payload: DeliveryDateUpdate, user=Depends(require_auth)
):
    try:
        orders.set_delivery_date(order_number, payload.delivery_date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"ok": True}


@router.delete("/orders/{order_number}")
def delete_order(order_number: int, user=Depends(require_auth)):
    orders.delete_order(order_number)
    return {"ok": True}


@router.get("/analytics")
def get_analytics(user=Depends(require_auth)):
    return analytics.get_all_window_summaries()


@router.get("/options")
def get_options(user=Depends(require_auth)):
    return {
        "platforms": orders.PLATFORM_OPTIONS,
        "types": orders.TYPE_OPTIONS,
        "statuses": orders.STATUS_OPTIONS,
    }
