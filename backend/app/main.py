from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.health import router as health_router
from app.api.verification import router as verification_router
from app.api.proto_orders import router as orders_router
from app.api.whatsapp import router as whatsapp_router
from app.core.config import settings

app = FastAPI(
    title="LaundryKhalaas Backend",
    description="Operations platform backend — UAE laundry services",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # must be False when allow_origins=["*"]; we use no cookies/auth
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
    expose_headers=["Content-Type"],
)

app.include_router(health_router)
app.include_router(verification_router)
app.include_router(orders_router)
app.include_router(whatsapp_router)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
