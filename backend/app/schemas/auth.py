from pydantic import BaseModel
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    student  = "student"
    delegate = "delegate"


class UserResponse(BaseModel):
    id        : UUID
    matricule : str
    full_name : str
    role      : UserRole

    class Config:
        from_attributes = True

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



class UserResponse(BaseModel):
    id        : str
    matricule : str
    full_name : str
    role      : UserRole

    class Config:
        from_attributes = True