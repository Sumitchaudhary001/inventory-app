from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db, engine
import models
import time

def wait_for_db():
    retries = 10
    while retries > 0:
        try:
            models.Base.metadata.create_all(bind=engine)
            from database import run_migrations
            run_migrations()
            print("Database connected!")
            return
        except Exception as e:
            print(f"Database not ready, retrying... ({retries} left)")
            retries -= 1
            time.sleep(3)
    raise Exception("Could not connect to database")

wait_for_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

class CustomerCreate(BaseModel):
    full_name: str
    email: str
    phone: str

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemIn]

@app.post("/products", status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    if db.query(models.Product).filter(models.Product.sku == data.sku).first():
        raise HTTPException(400, "SKU already exists")
    if data.quantity < 0:
        raise HTTPException(400, "Quantity cannot be negative")
    product = models.Product(**data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/products/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product

@app.put("/products/{id}")
def update_product(id: int, data: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if data.quantity < 0:
        raise HTTPException(400, "Quantity cannot be negative")
    for key, value in data.dict().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Deleted"}

@app.post("/customers", status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    if db.query(models.Customer).filter(models.Customer.email == data.email).first():
        raise HTTPException(400, "Email already exists")
    customer = models.Customer(**data.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@app.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.get("/customers/{id}")
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(404, "Customer not found")
    return customer

class OrderStatusUpdate(BaseModel):
    status: str

@app.put("/orders/{id}/status")
def update_order_status(id: int, data: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    valid_statuses = ["Pending", "Confirmed", "Shipped", "Delivered"]
    if data.status not in valid_statuses:
        raise HTTPException(400, f"Status must be one of {valid_statuses}")
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order

@app.delete("/customers/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(404, "Customer not found")
    orders = db.query(models.Order).filter(models.Order.customer_id == id).all()
    for order in orders:
        db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).delete()
        db.delete(order)
    db.delete(customer)
    db.commit()
    return {"message": "Deleted"}

@app.post("/orders", status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(404, "Customer not found")
    total = 0
    order = models.Order(customer_id=data.customer_id)
    db.add(order)
    db.flush()
    for item in data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(400, f"Insufficient stock for {product.name}")
        product.quantity -= item.quantity
        total += product.price * item.quantity
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(order_item)
    order.total_amount = total
    db.commit()
    db.refresh(order)
    return order

@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.get("/orders/{id}")
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return order

@app.delete("/orders/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    db.query(models.OrderItem).filter(models.OrderItem.order_id == id).delete()
    db.delete(order)
    db.commit()
    return {"message": "Deleted"}

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity < 5).all()
    all_orders = db.query(models.Order).all()
    total_sales = sum(o.total_amount for o in all_orders)
    top_stocked = db.query(models.Product).order_by(models.Product.quantity.desc()).limit(5).all()
    recent_orders = db.query(models.Order).order_by(models.Order.id.desc()).limit(5).all()
    recent_orders_data = []
    for o in recent_orders:
        customer = db.query(models.Customer).filter(models.Customer.id == o.customer_id).first()
        recent_orders_data.append({
            "id": o.id,
            "customer_name": customer.full_name if customer else "Unknown",
            "total_amount": o.total_amount,
            "status": o.status or "Pending",
            "created_at": o.created_at
        })
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "low_stock_products": low_stock,
        "top_stocked_products": top_stocked,
        "recent_orders": recent_orders_data
    }
