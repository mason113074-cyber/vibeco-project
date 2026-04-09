from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="狀態碼，成功時為 success")
    message: str = Field(..., description="人類可讀訊息")


class ValidationErrorBody(BaseModel):
    """422 時給前端的統一格式，方便對欄位畫紅線。"""

    error: str = Field(default="validation_error", description="固定類型，前端可據此判斷")
    message: str = Field(..., description="給使用者看的總結說明")
    fields: list[dict] = Field(
        default_factory=list,
        description="每筆含 loc、msg、type 等，對應哪個欄位出了什麼問題",
    )


app = FastAPI(title="vibeco API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """422：回傳清楚 JSON，讓前端能對欄位顯示錯誤。"""
    body = ValidationErrorBody(
        message="請求內容不符合 API 格式，請檢查標註的欄位。",
        fields=exc.errors(),
    )
    return JSONResponse(status_code=422, content=body.model_dump())


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    return HealthResponse(status="success", message="我活著")
