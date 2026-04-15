FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libglib2.0-0 \
    libgdk-pixbuf-2.0-0 \
    fonts-liberation \
    fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv pip install --system --no-cache .

# Copy everything including fonts/
COPY . .

# Install fonts from /app/fonts/ into system font directory
RUN mkdir -p /usr/local/share/fonts/custom \
    && cp /app/fonts/*.ttf /usr/local/share/fonts/custom/ \
    && fc-cache -fv

# Verify fonts are registered — will show in build logs
RUN fc-list

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
