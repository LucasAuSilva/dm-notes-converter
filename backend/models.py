from pydantic import BaseModel


class PdfRequest(BaseModel):
    html: str
    filename: str | None = "document.pdf"


class PreviewConfig(BaseModel):
    title: str = "Preview"
    columns: int = 1
    font_family: str = "EB Garamond"
    font_size: float = 10
    letter_spacing: float = 0
    paper_size: str = "A4"
    use_file_name: bool = False
    margin_right: float | None = None
    margin_left: float | None = None
    margin_bottom: float | None = None
    ignored: list[str] = []
    tags: list[str] = []


class HtmlBuildConfig(BaseModel):
    title: str
    body: str
    font_family: str
    font_size: float
    letter_spacing: float
    columns: int
    paper_size: str
    margin_left: float | None = None
    margin_right: float | None = None
    margin_bottom: float | None = None
