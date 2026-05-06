from fastapi import FastAPI
from webhooks import router

app = FastAPI(title="Nexus LifeOS API")
app.include_router(router)

