from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import Optional

# -----------------------------
# Database setup
# -----------------------------
DATABASE_URL = "sqlite:///../app.db"  
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# -----------------------------
# SQLAlchemy Model
# -----------------------------
class ArLocation(Base):
    __tablename__ = "ar_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    type = Column(String)
    modelUrl = Column(String, nullable=True)
    modelScale = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)


# -----------------------------
# Pydantic Schema (for validation if needed)
# -----------------------------
class ArLocationSchema(BaseModel):
    id: int
    name: str
    description: str
    type: str
    modelUrl: Optional[str] = None
    modelScale: Optional[str] = None
    lat: float
    lng: float

    class Config:
        orm_mode = True


# -----------------------------
# Data to insert
# -----------------------------
data = {
    "locations": [
        {
            "id": 0,
            "name": "Muktinath Temple",
            "description": "Sacred temple for both Hindus and Buddhists, located in Mustang district at the foot of the Thorong La pass",
            "type": "info",
            "lat": 27.7263058,
            "lng": 85.3560134
        },
        {
            "id": 1,
            "name": "Boudhanath Stupa",
            "description": "One of the largest Buddhist stupas in Nepal",
            "type": "model",
            "modelUrl": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF/CesiumMan.gltf",
            "modelScale": "0.5 0.5 0.5",
            "lat": 27.7263058,
            "lng": 85.3559119
        },
        {
            "id": 2,
            "name": "Local Momo Shop",
            "description": "Best momos in town! Family run since 1995",
            "type": "info",
            "lat": 27.7263957,
            "lng": 85.3559119
        }
    ]
}


# -----------------------------
# Function to insert data
# -----------------------------
def fill_locations():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        for loc in data["locations"]:
            # Check if already exists
            existing = db.query(ArLocation).filter(ArLocation.id == loc["id"]).first()
            if existing:
                print(f"Skipping existing ID {loc['id']}: {loc['name']}")
                continue

            new_loc = ArLocation(**loc)
            db.add(new_loc)
            print(f"Added: {loc['name']}")

        db.commit()
        print("✅ All data inserted successfully!")

    except Exception as e:
        db.rollback()
        print("❌ Error inserting data:", e)

    finally:
        db.close()


if __name__ == "__main__":
    fill_locations()
