from fastapi import FastAPI

app = FastAPI(title="Health Check Only")

@app.get("/")
async def root():
    return {"status": "online", "message": "App is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
