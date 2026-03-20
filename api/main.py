from app.engine import ScaleEngine
from app.models import Scale
from fastapi import FastAPI, Query
from fastapi.encoders import jsonable_encoder

app = FastAPI(title="SaxScale API")


@app.get("/scale")
async def get_random_scale(cat: str = Query(None)) -> Scale:
    return ScaleEngine.generate(category=cat)


@app.get("/library")
async def get_library():
    return ScaleEngine.LIBRARY


@app.get("/scales/categories")
async def get_categories():
    return list(ScaleEngine.LIBRARY.keys())


# To run: uvicorn api.main:app --reload
