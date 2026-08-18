from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Esquema base de usuario"""

    cedula: str
    email: EmailStr
    full_name: str
    is_active: bool = True


class UserCreate(UserBase):
    """Esquema al registrar un nuevo usuario"""

    password: str


class UserUpdate(BaseModel):
    """Esquema al actualizar un usuario"""

    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None


class UserResponse(UserBase):
    """Esquema de salida devuelto (sin exponer hashed_password)"""

    id: int

    model_config = {"from_attributes": True}