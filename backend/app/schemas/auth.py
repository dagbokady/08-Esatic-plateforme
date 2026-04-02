from pydantic import BaseModel
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    student  = "student"
    delegate = "delegate"


class UserResponse(BaseModel):
    id: str
    matricule: str
    full_name: str
    class_id: str

    class Config:
        from_attributes = True  # (ou orm_mode = True si Pydantic v1)

class RegisterRequest(BaseModel):
    matricule : str
    full_name : str
    password  : str
    class_id  : str



class LoginRequest(BaseModel):
    matricule : str
    password  : str



class TokenResponse(BaseModel):
    access_token : str
    token_type   : str = "bearer"



