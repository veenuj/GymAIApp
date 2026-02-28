import os
import random
import warnings

# --- SILENCE THE GOOGLE API WARNING ---
warnings.filterwarnings("ignore", category=FutureWarning)

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Use the stable, Chroma-compatible package
import google.generativeai as genai
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from typing import Union

# --- SQLALCHEMY IMPORTS ---
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from datetime import datetime, timedelta

# 1. Load environment variables
load_dotenv()

# 2. Initialize FastAPI App
app = FastAPI()

# 3. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Configure Gemini AI (Stable)
api_key = os.getenv("GEMINI_API_KEY")
if not api_key: print("❌ ERROR: GEMINI_API_KEY is missing from .env file!")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# 5. Initialize Vector DB (Chroma)
try:
    chroma_client = chromadb.PersistentClient(path="./rag_db")
    google_ef = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
        api_key=os.getenv("GEMINI_API_KEY"), model_name="models/gemini-embedding-001"
    )
    collection = chroma_client.get_or_create_collection(name="tathastu_knowledge_base", embedding_function=google_ef)
    print("✅ AI Brain & Vector DB Online")
except Exception as e:
    print(f"⚠️ Vector DB Warning: {e}")

# ==========================================
# 6. SQL DATABASE CONFIGURATION
# ==========================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./tathastu_erp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQL MODELS (Tables) ---
class DB_Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mobile = Column(String)
    email = Column(String)
    weight = Column(String)
    height = Column(String)
    address = Column(String)
    last_seen_days = Column(Integer, default=0)
    sub_expiry = Column(String)
    status = Column(String, default="Active")
    plan_name = Column(String)
    amount_paid = Column(String)
    is_present_today = Column(Boolean, default=False)

class DB_Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) 
    category = Column(String)
    amount = Column(Float)

class DB_Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    area = Column(String)
    source = Column(String)

class DB_Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    stock = Column(Integer)
    price = Column(Float)
    threshold = Column(Integer)

class DB_Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    usage_hours = Column(Integer)
    limit = Column(Integer)
    status = Column(String)
class DB_Transformation(Base):
    __tablename__ = "transformations"
    id = Column(Integer, primary_key=True, index=True)
    member_name = Column(String, index=True)
    month = Column(String)
    weight = Column(Float)
    fat = Column(Float)
    muscle = Column(Float)
class DB_Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    base_salary = Column(Float)
    pt_commissions = Column(Float, default=0.0)
# Create tables in the SQLite database
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- DB SEEDING (Runs once to populate empty DB) ---
def seed_database():
    db = SessionLocal()
    if not db.query(DB_Inventory).first():
        db.add_all([
            DB_Inventory(name="Whey Protein (ON 2kg)", stock=14, price=6500, threshold=5),
            DB_Inventory(name="Creatine Monohydrate", stock=3, price=1200, threshold=5)
        ])
        db.add(DB_Equipment(name="Treadmill Matrix-V1", usage_hours=480, limit=500, status="Needs Service"))
        db.add_all([
            DB_Transaction(type="revenue", category="Initial Memberships", amount=125000),
            DB_Transaction(type="expense", category="Rent & Electricity", amount=60000)
        ])
        db.add_all([
            DB_Transformation(member_name="Rahul Sharma", month="Jan", weight=95, fat=28, muscle=32),
            DB_Transformation(member_name="Rahul Sharma", month="Mar", weight=90, fat=24, muscle=34),
            DB_Transformation(member_name="Rahul Sharma", month="Jun", weight=83, fat=18, muscle=37)
        ])
        db.commit()
    db.close()
seed_database()

# ==========================================
# 7. PYDANTIC SCHEMAS
# ==========================================
class MemberCreate(BaseModel):
    name: str; mobile: str; email: str; weight: Union[str, int, float]; height: Union[str, int, float]
    address: str; sub_expiry: str; plan_name: str; amount_paid: Union[str, int, float]

class DietRequest(BaseModel):
    member_name: str; requirements: str

class AdRequest(BaseModel):
    area: str; platform: str; goal: str

class InventoryCreate(BaseModel):
    name: str
    stock: int
    price: float
    threshold: int

class EquipmentCreate(BaseModel):
    name: str
    limit: int

class StaffCreate(BaseModel):
    name: str
    role: str
    base_salary: float

class ExpenseCreate(BaseModel):
    category: str
    amount: float
# ==========================================
# 8. API ROUTES
# ==========================================

@app.get("/api/members")
def get_members(db: Session = Depends(get_db)):
    return {"members": db.query(DB_Member).all()}

@app.post("/api/add-member")
def add_member(member: MemberCreate, db: Session = Depends(get_db)):
    print(f"🚀 Processing Onboarding for: {member.name} into SQL Database")
    
    new_m = DB_Member(
        name=member.name, mobile=member.mobile, email=member.email,
        weight=str(member.weight), height=str(member.height), address=member.address,
        sub_expiry=member.sub_expiry, plan_name=member.plan_name, amount_paid=str(member.amount_paid)
    )
    db.add(new_m)
    
    try:
        payment_val = float(member.amount_paid)
        if payment_val > 0:
            new_txn = DB_Transaction(type="revenue", category=f"Signup: {member.name}", amount=payment_val)
            db.add(new_txn)
    except: pass

    db.commit()
    db.refresh(new_m)
    return {"message": "Onboarding Successful", "member": new_m}

@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(DB_Member).filter(DB_Member.id == member_id).first()
    if member:
        db.delete(member)
        db.commit()
    return {"message": "Member removed from SQL registry"}

# Create a tiny schema for the incoming request
class AttendanceLog(BaseModel):
    weight: Union[str, float, None] = None

@app.post("/api/mark-attendance/{member_id}")
def mark_attendance(member_id: int, log: AttendanceLog, db: Session = Depends(get_db)):
    member = db.query(DB_Member).filter(DB_Member.id == member_id).first()
    if member:
        # 1. Mark them as present
        member.is_present_today = True
        member.last_seen_days = 0
        
        # 2. If weight was entered, update their master profile
        if log.weight:
            member.weight = str(log.weight)
            
            # 3. Save to Transformation History for the Growth Vision Graph!
            from datetime import datetime
            current_month = datetime.now().strftime("%b")
            
            # Simplified mock of fat/muscle change for demonstration based on weight loss/gain
            # In a real scenario, you'd want an InBody scanner API, but this makes the chart work!
            new_transformation = DB_Transformation(
                member_name=member.name,
                month=current_month,
                weight=float(log.weight),
                fat=20.0, # Placeholder until real body fat % is inputted
                muscle=35.0 # Placeholder
            )
            db.add(new_transformation)
            
        db.commit()
        return {"message": "Check-in logged to DB."}
    
    raise HTTPException(status_code=404, detail="Not found")

@app.post("/api/trigger-retention")
def trigger_retention(db: Session = Depends(get_db)):
    members = db.query(DB_Member).filter(DB_Member.last_seen_days > 4).all()
    for m in members: m.status = "AI Message Sent ✅"
    db.commit()
    return {"message": "SQL Records Updated: Nudges Sent"}

@app.get("/api/finance")
def get_finance(db: Session = Depends(get_db)):
    rev = db.query(DB_Transaction).filter(DB_Transaction.type == "revenue").all()
    exp = db.query(DB_Transaction).filter(DB_Transaction.type == "expense").all()
    return {
        "revenue": [{"category": r.category, "amount": r.amount} for r in rev],
        "expenses": [{"category": e.category, "amount": e.amount} for e in exp]
    }

@app.get("/api/finance-analysis")
def analyze_finance(db: Session = Depends(get_db)):
    rev = sum(r.amount for r in db.query(DB_Transaction).filter(DB_Transaction.type == "revenue").all())
    exp = sum(e.amount for e in db.query(DB_Transaction).filter(DB_Transaction.type == "expense").all())
    profit = rev - exp
    prompt = f"CFO Analysis. Rev: {rev}, Exp: {exp}, Profit: {profit}. Provide 3 short bullet points."
    try: 
        response = model.generate_content(prompt)
        return {"analysis": response.text.strip()}
    except: return {"analysis": "Analysis offline."}

@app.get("/api/leads")
def get_leads(db: Session = Depends(get_db)):
    return {"leads": db.query(DB_Lead).all()}

@app.post("/api/launch-campaign")
def launch_campaign(area: str, db: Session = Depends(get_db)):
    first_names = ["Rahul", "Amit", "Priya", "Neha", "Vikas", "Rohan", "Sneha", "Karan"]
    last_names = ["Sharma", "Verma", "Singh", "Gupta", "Dhiman", "Saini", "Chaudhary"]
    
    num_leads = random.randint(1, 3)
    new_leads = []
    
    for _ in range(num_leads):
        new_lead = DB_Lead(
            name=f"{random.choice(first_names)} {random.choice(last_names)}",
            phone=f"+91 9{random.randint(100000000, 999999999)}",
            area=area,
            source=random.choice(["Instagram Ads", "WhatsApp Blast"])
        )
        db.add(new_lead)
        new_leads.append(new_lead)
        
    db.commit()
    for nl in new_leads: db.refresh(nl)
    
    return {"message": f"Campaign live! Captured {num_leads} prospects into SQL DB.", "leads": new_leads}

@app.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)): return {"inventory": db.query(DB_Inventory).all()}

@app.get("/api/equipment")
def get_equipment(db: Session = Depends(get_db)): return {"equipment": db.query(DB_Equipment).all()}

@app.get("/api/analytics/{member_name}")
def get_analytics(member_name: str):
    transformation_db = {"Rahul Sharma": [{"month": "Jan", "weight": 95, "fat": 28, "muscle": 32}, {"month": "Jun", "weight": 83, "fat": 18, "muscle": 37}]}
    return {"progress": transformation_db.get(member_name, transformation_db["Rahul Sharma"])}

@app.post("/api/generate-diet")
async def generate_diet(request: DietRequest):
    try:
        results = collection.query(query_texts=[request.requirements], n_results=2)
        rag_context = "\n".join(results['documents'][0]) if results['documents'] else ""
        prompt = f"Coach Report for {request.member_name}. Requirements: {request.requirements}. Rules: {rag_context}"
        
        response = model.generate_content(prompt)
        return {"plan": response.text.strip()}
    except Exception as e: return {"plan": f"Error: {str(e)}"}

@app.post("/api/generate-ad")
async def generate_ad(request: AdRequest):
    print(f"🚀 Attempting to generate AI ad for {request.area} on {request.platform}...")
    prompt = f"""
    System: Professional Gym Marketer for 'Tathastu Fit'.
    Target Area: {request.area}
    Platform: {request.platform}
    Focus: {request.goal}
    
    Task: Write a high-converting {request.platform} ad.
    - Include a hook about training in {request.area}.
    - Use emojis. 
    - End with a strong Call to Action (CTA).
    - Keep it under 100 words.
    """
    try:
        response = model.generate_content(prompt)
        print("✅ AI Engine Success!")
        return {"ad_copy": response.text.strip()}
    except Exception as e:
        print(f"❌ GEMINI API ERROR: {str(e)}")
        return {"ad_copy": f"AI Engine Offline. Backend Error: {str(e)}"}

@app.post("/api/inventory")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    new_item = DB_Inventory(
        name=item.name, 
        stock=item.stock, 
        price=item.price, 
        threshold=item.threshold
    )
    db.add(new_item)
    db.commit()
    return {"message": "Item registered to database"}

@app.put("/api/inventory/{item_id}")
def update_inventory_stock(item_id: int, action: str, db: Session = Depends(get_db)):
    item = db.query(DB_Inventory).filter(DB_Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if action == "add":
        item.stock += 1
    elif action == "sell" and item.stock > 0:
        item.stock -= 1
        # Automatically logs the sale to your Finance Tracker!
        from datetime import datetime
        new_txn = DB_Transaction(type="revenue", category=f"Sale: {item.name}", amount=item.price)
        db.add(new_txn)
        
    db.commit()
    return {"message": "Stock updated successfully"}

@app.get("/api/analytics/{member_name}")
def get_analytics(member_name: str, db: Session = Depends(get_db)):
    # Fetch real SQL rows matching the exact member name
    records = db.query(DB_Transformation).filter(DB_Transformation.member_name == member_name).all()
    
    # Convert SQL rows to JSON array for Recharts
    progress_data = [
        {"month": r.month, "weight": r.weight, "fat": r.fat, "muscle": r.muscle} 
        for r in records
    ]
    return {"progress": progress_data}

# --- MODULE 16 ROUTES (MACHINE HEALTH) ---

@app.post("/api/equipment")
def add_equipment(item: EquipmentCreate, db: Session = Depends(get_db)):
    new_machine = DB_Equipment(
        name=item.name,
        usage_hours=0,
        limit=item.limit,
        status="Optimal"
    )
    db.add(new_machine)
    db.commit()
    return {"message": "Hardware registered successfully"}

@app.put("/api/equipment/{item_id}/use")
def log_equipment_usage(item_id: int, hours: int = 50, db: Session = Depends(get_db)):
    machine = db.query(DB_Equipment).filter(DB_Equipment.id == item_id).first()
    if not machine: raise HTTPException(status_code=404, detail="Machine not found")
    
    machine.usage_hours += hours
    
    # Auto-calculate status based on telemetry
    percent = (machine.usage_hours / machine.limit) * 100
    if percent >= 90:
        machine.status = "Needs Service"
    elif percent >= 70:
        machine.status = "Warning"
    else:
        machine.status = "Optimal"
        
    db.commit()
    return {"message": f"Logged {hours} hours."}

@app.put("/api/equipment/{item_id}/service")
def reset_equipment_service(item_id: int, db: Session = Depends(get_db)):
    machine = db.query(DB_Equipment).filter(DB_Equipment.id == item_id).first()
    if not machine: raise HTTPException(status_code=404, detail="Machine not found")
    
    # Maintenance completed, reset telemetry
    machine.usage_hours = 0
    machine.status = "Optimal"
    
    # Optional: Log the maintenance cost to Finance Tracker!
    new_expense = DB_Transaction(type="expense", category=f"Service: {machine.name}", amount=2500.0)
    db.add(new_expense)
    
    db.commit()
    return {"message": "Service logged and usage reset."}

# --- MODULE 14 ROUTES (STAFF & PAYROLL) ---

@app.get("/api/staff")
def get_staff(db: Session = Depends(get_db)):
    return {"staff": db.query(DB_Staff).all()}

@app.post("/api/staff")
def add_staff(staff: StaffCreate, db: Session = Depends(get_db)):
    # Create tables if they don't exist yet (safety catch for new models)
    Base.metadata.create_all(bind=engine) 
    
    new_employee = DB_Staff(
        name=staff.name,
        role=staff.role,
        base_salary=staff.base_salary,
        pt_commissions=0.0
    )
    db.add(new_employee)
    db.commit()
    return {"message": "Personnel added to roster"}

@app.post("/api/staff/payroll")
def execute_payroll(db: Session = Depends(get_db)):
    staff_members = db.query(DB_Staff).all()
    if not staff_members:
        raise HTTPException(status_code=400, detail="No staff to pay")

    total_payout = 0
    for emp in staff_members:
        payout = emp.base_salary + emp.pt_commissions
        total_payout += payout
        # Reset commissions for the new month
        emp.pt_commissions = 0.0

    # Log this massive deduction in the Finance Database!
    from datetime import datetime
    month_name = datetime.now().strftime("%B %Y")
    new_expense = DB_Transaction(
        type="expense", 
        category=f"Payroll Execution: {month_name}", 
        amount=total_payout
    )
    db.add(new_expense)
    db.commit()
    
    return {"message": f"Payroll of ₹{total_payout} executed and logged to Finance."}

# --- MODULE 15 ROUTES (EXPENSES) ---

@app.post("/api/expense")
def add_operational_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    # Log it directly into the Finance Transactions table as an expense
    new_expense = DB_Transaction(
        type="expense",
        category=expense.category,
        amount=expense.amount
    )
    db.add(new_expense)
    db.commit()
    return {"message": "Expense successfully deducted from ledger"}

@app.post("/api/members/{member_id}/renew")
def renew_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(DB_Member).filter(DB_Member.id == member_id).first()
    if not member: raise HTTPException(status_code=404)

    # Add 30 days to expiry
    member.sub_expiry = (datetime.now() + timedelta(days=30)).strftime("%d %b %Y")
    
    # Auto-charge the finance ledger based on their plan amount!
    payment = float(member.amount_paid) if member.amount_paid else 3500.0
    new_txn = DB_Transaction(type="revenue", category=f"Renewal: {member.name}", amount=payment)
    
    db.add(new_txn)
    db.commit()
    return {"message": f"Access restored! ₹{payment} logged to revenue."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8005)