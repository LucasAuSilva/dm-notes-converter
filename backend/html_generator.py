import re
import tempfile

from models import HtmlBuildConfig
from weasyprint import HTML
from pypdf import PdfReader


def remove_empty_html_lists(html):
    html = re.sub(r"<li>\s*</li>", "", html)
    html = re.sub(r"<ul>\s*</ul>", "", html)
    return html


def fits_in_pages(html, page_numbers):
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        HTML(string=html).write_pdf(tmp.name)
        reader = PdfReader(tmp.name)
        return len(reader.pages) <= page_numbers


PAPER_SIZES = {
    "A4": {
        "size": "210mm 297mm",
        "margin-top": "8mm",
        "margin-bottom": "8mm",
        "margin-left": "8mm",
        "margin-right": "8mm"
    },
    "A5": {
        "size": "148mm 210mm",
        "margin-top": "4mm",
        "margin-bottom": "10mm",
        "margin-left": "6mm",
        "margin-right": "6mm"
    },
    "A6": {
        "size": "105mm 148mm",
        "margin-top": "4mm",
        "margin-bottom": "4mm",
        "margin-left": "4mm",
        "margin-right": "4mm"
    },
}


def build_html(html: HtmlBuildConfig):

    column_css = ""

    margin_left_css = PAPER_SIZES[html.paper_size]["margin-left"]
    margin_right_css = PAPER_SIZES[html.paper_size]["margin-right"]

    if html.margin_left is not None:
        margin_left_css = str(html.margin_left) + "mm"
    if html.margin_right is not None:
        margin_right_css = str(html.margin_right) + "mm"

    if html.columns >= 2:
        column_css = f"""
        .columns {{
            column-count: {html.columns};
            column-gap: 10px;
            column-fill: auto;
        }}
        """

    css = f"""
    @page {{
        size: {PAPER_SIZES[html.paper_size]["size"]};
        margin-top: {PAPER_SIZES[html.paper_size]["margin-top"]};
        margin-bottom: {PAPER_SIZES[html.paper_size]["margin-bottom"]};
        margin-left: {margin_left_css};
        margin-right: {margin_right_css};
    }}

    body {{
        font-family: "{html.font_family}", Georgia, serif;
        font-size: {html.font_size}pt;
        line-height: 1.15;
        font-stretch: condensed;
        letter-spacing: {html.letter_spacing}pt;
    }}

    h1 {{
        font-size: {html.font_size + 2}pt;
        text-align: center;
        border-bottom: 2px solid black;
        margin-bottom: 4px;
    }}

    h2 {{
        font-size: {html.font_size + 0.6}pt;
        font-variant: small-caps;
        border-bottom: 1px solid #444;
        margin-top: 3px;
    }}

    h3 {{
        font-size: {html.font_size + 0.3}pt;
        font-variant: small-caps;
        margin-top: 3px;
    }}

    p {{
        margin-top: 1px;
        margin-bottom: 1px;
    }}

    ul {{
        padding-left: 8px;
        list-style-position: inside;
    }}

    li {{
        margin-bottom: 1px;
    }}

    li.checkbox {{
        list-style: none;
        margin-left: -8px;
    }}
    """

    return f"""
<html>
<head>
<meta charset="utf-8">
<style>
{css}
{column_css}
</style>
</head>

<body>

<h1>{html.title}</h1>

<div class="columns">
{html.body}
</div>

</body>
</html>
"""
