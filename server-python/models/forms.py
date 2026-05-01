from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any

class FormSubmission(BaseModel):
    fullName: str = Field(..., max_length=140, min_length=1)
    collegeEmail: EmailStr
    whatsapp: str = Field(..., pattern=r"^[\d\s\+\-\(\)]{8,20}$")
    extra: Dict[str, Any] = {}
