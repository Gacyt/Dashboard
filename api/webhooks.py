import os
from fastapi import APIRouter, HTTPException, Request, status
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
  payload = await request.json()
  token = request.query_params.get("token")

  if not token:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Missing token"
    )

  user_result = (
    supabase
    .table("profiles")
    .select("id")
    .eq("webhook_token", token)
    .limit(1)
    .execute()
  )

  if not user_result.data:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid token"
    )

  amount = payload.get("amount")
  if amount is None:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Missing amount"
    )

  try:
    normalized_amount = float(amount)
  except (TypeError, ValueError) as exc:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Amount must be numeric"
    ) from exc

  if normalized_amount <= 0:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Amount must be greater than zero"
    )

  inserted = (
    supabase
    .table("expenses")
    .insert(
      {
        "user_id": user_result.data[0]["id"],
        "amount": normalized_amount,
        "category": payload.get("category", "other"),
        "description": payload.get("description", "")
      }
    )
    .execute()
  )

  if not inserted.data:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to create expense"
    )

  return {"status": "ok", "expense_id": inserted.data[0]["id"]}

