FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app

COPY pyproject.toml uv.lock* ./

RUN uv pip install --system .

COPY . .

CMD ["python", "main.py"]