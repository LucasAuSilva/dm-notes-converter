import markdown

from models import PreviewConfig, HtmlBuildConfig
from processing_md import preprocess, is_active
from html_generator import (
    build_html,
    remove_empty_html_lists
)


def preview_html(md_files, config: PreviewConfig):
    combined_md = ""

    title = config.title

    for file in md_files:
        md = file["content"]
        if not is_active(md, config.tags) and len(md_files) != 1:
            continue

        if config.use_file_name:
            title = file["name"]

        md = preprocess(md, config.ignored)

        if len(md_files) > 1:
            name = file["name"]
            combined_md += f"\n\n## {name}\n\n"
        combined_md += md
        combined_md += "\n\n"

    html_body = markdown.markdown(
        combined_md,
        extensions=["extra", "sane_lists"]
    )

    html_body = remove_empty_html_lists(html_body)

    html_body = html_body.replace("<li>☐", '<li class="checkbox">☐')
    html_body = html_body.replace("<li>☑", '<li class="checkbox">☑')

    html = build_html(HtmlBuildConfig(
        title=title,
        body=html_body,
        font_size=config.font_size,
        font_family=config.font_family,
        letter_spacing=config.letter_spacing,
        columns=config.columns,
        paper_size=config.paper_size,
        margin_left=config.margin_left,
        margin_right=config.margin_right,
        margin_bottom=config.margin_bottom
    ))

    return {
        "html": html
    }
