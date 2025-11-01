from sqlalchemy.orm import Session
from fastapi import Depends
from .model import ArLocation
from db.database import get_db
from fastapi import APIRouter
from .fill_data import ArLocationSchema, ArLocation

router = APIRouter(
    prefix="/ar-locations",
    tags=["ar-locations"],
    responses={
        401: {"description": "Unauthorized - Invalid credentials or token"},
        403: {"description": "Forbidden - Account inactive"},
        400: {"description": "Bad Request - Invalid input data"},
    },
)

@router.get("/locations", response_model=list[ArLocationSchema])
def get_locations(db: Session = Depends(get_db)):
    locations = db.query(ArLocation).all()
    return [
        {
            "id": loc.id,
            "name": loc.name,
            "description": loc.description,
            "type": loc.type,
            "modelUrl": loc.modelUrl,
            "modelScale": loc.modelScale,
            "lat": loc.lat,
            "lng": loc.lng,
        }
        for loc in locations
    ]

