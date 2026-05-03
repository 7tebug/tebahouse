# Backend Python deprecato - migrato a Next.js + Supabase
# Questo file esiste solo per evitare crashloop di supervisor (Emergent preview)
# Non viene usato da Vercel
from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def root(): return {"status": "deprecated", "migrated_to": "Next.js + Supabase on Vercel"}
