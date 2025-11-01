from pydantic import BaseModel
from typing import Optional

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
        from_attributes = True
