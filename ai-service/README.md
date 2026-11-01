# DisasterReady AI service

This FastAPI service provides the server-side disaster-safety assistant. It defaults to a
safe rule-based educational fallback when no provider key is configured; it never presents
that fallback as live emergency information.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set `AI_PROVIDER=groq` or `AI_PROVIDER=openai` and configure the corresponding key in the
service environment. The Node backend calls this service through `AI_SERVICE_URL`; keys
never reach the React application.

Tests run with `pytest`.
