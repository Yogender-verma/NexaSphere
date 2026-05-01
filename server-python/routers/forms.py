from fastapi import APIRouter
from models.forms import FormSubmission
from services.sheets import append_to_sheet
from services.supabase import insert_supabase

router = APIRouter(prefix="/api", tags=["forms"])

async def _handle(form_type: str, body: FormSubmission):
    payload = body.model_dump()
    await append_to_sheet(form_type, payload)
    await insert_supabase(form_type, payload)
    return {"ok": True}

@router.post('/forms/membership')
async def membership(body: FormSubmission):
    return await _handle('membership', body)

@router.post('/forms/recruitment')
async def recruitment(body: FormSubmission):
    return await _handle('recruitment', body)

@router.post('/core-team/apply')
async def core_team_apply(body: FormSubmission):
    return await _handle('core-team-apply', body)
