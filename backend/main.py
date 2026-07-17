from fastapi import FastAPI, UploadFile, File, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from weasyprint import HTML
import json

from models import PreviewConfig, PdfRequest
from engine import preview_html

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "https://dm-grimoire.lucassilvadev.com",
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Vite Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/generate-pdf")
@limiter.limit("10/minute")
async def generate_pdf(request: Request, data: PdfRequest):
    pdf_bytes = HTML(string=data.html).write_pdf()
    headers = {
        "Content-Disposition": f'attachment; filename="{data.filename}"'
    }

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers=headers
    )


@app.post("/preview")
@limiter.limit("15/minute")
async def preview(
    request: Request,
    files: list[UploadFile] = File(...),
    config: str = Form(...)
):
    """
    files: uploaded markdown files
    config: JSON string with preview configuration
    """

    print(config)
    parsed = json.loads(config)
    preview_config = PreviewConfig(**parsed)
    md_files = []

    for file in files:
        content = (await file.read()).decode("utf-8")
        name = file.filename.replace(".md", "")
        md_files.append({
            "name": name,
            "content": content
        })

    result = preview_html(md_files, preview_config)
    pdf_bytes = HTML(string=result["html"]).write_pdf()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf"
    )
