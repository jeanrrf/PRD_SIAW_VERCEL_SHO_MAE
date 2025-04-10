from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="../public/static"), name="static")

# ...existing code...