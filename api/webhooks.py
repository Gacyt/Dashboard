import os
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from supabase import Client, create_client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
  raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) are required.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.post("/webhook/expense")
@router.post("/api/webhook/expense")
async def webhook_expense(request: Request):
  token = request.query_params.get("token")
  print("[webhook-expense] auth bypass confirmed for public token flow")
  print(f"[webhook-expense] token received: {'present' if token else 'missing'}")

  if not token:
    return JSONResponse(
      {"error": "Missing token"},
      status_code=status.HTTP_400_BAD_REQUEST,
    )

  try:
    payload = await request.json()
  except Exception:
    return JSONResponse(
      {"error": "Invalid request"},
      status_code=status.HTTP_400_BAD_REQUEST,
    )

  print(f"[webhook-expense] request body: {payload}")

  user_result = (
    supabase
    .table("profiles")
    .select("id")
    .eq("webhook_token", token)
    .limit(1)
    .execute()
  )

  if not user_result.data:
    return JSONResponse(
      {"error": "Invalid token"},
      status_code=status.HTTP_401_UNAUTHORIZED,
    )

  amount = payload.get("amount")
  if amount is None:
    return JSONResponse(
      {"error": "Missing amount"},
      status_code=status.HTTP_400_BAD_REQUEST,
    )

  try:
    normalized_amount = float(amount)
  except (TypeError, ValueError):
    return JSONResponse(
      {"error": "Amount must be numeric"},
      status_code=status.HTTP_400_BAD_REQUEST,
    )

  if normalized_amount <= 0:
    return JSONResponse(
      {"error": "Amount must be greater than zero"},
      status_code=status.HTTP_400_BAD_REQUEST,
    )

  inserted = (
    supabase
    .table("expenses")
    .insert(
      {
        "user_id": user_result.data[0]["id"],
        "amount": normalized_amount,
        "category": payload.get("category", "other"),
        "description": payload.get("description", ""),
        "expense_type": "normal",
      }
    )
    .execute()
  )

  if not inserted.data:
    return JSONResponse(
      {"error": "Failed to create expense"},
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

  return {"success": True, "expense_id": inserted.data[0]["id"]}

