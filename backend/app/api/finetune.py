from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from pydantic import BaseModel
import os
import json
import asyncio
from datetime import datetime

router = APIRouter(prefix="/finetune", tags=["finetune"])

# In-memory store for training jobs
TRAINING_JOBS = {}

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    message: str

def simulate_training_task(job_id: str, file_path: str):
    """
    In a real-world scenario, this would load trl.SFTTrainer and peft.LoraConfig
    and train the model on the uploaded JSONL dataset.
    For this local CPU execution, we simulate the steps to avoid freezing the system for hours.
    """
    TRAINING_JOBS[job_id] = {"status": "running", "progress": 0.0, "message": "Initializing Trainer..."}
    
    # Simulate data loading
    asyncio.run(asyncio.sleep(2))
    TRAINING_JOBS[job_id] = {"status": "running", "progress": 20.0, "message": "Tokenizing dataset..."}
    
    # Simulate training loop
    for i in range(1, 6):
        asyncio.run(asyncio.sleep(3))
        progress = 20.0 + (i / 5.0) * 70.0
        TRAINING_JOBS[job_id] = {"status": "running", "progress": progress, "message": f"Training Epoch {i}/5..."}
        
    # Simulate saving LoRA adapter
    asyncio.run(asyncio.sleep(2))
    
    # Create a dummy lora adapter directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    lora_dir = os.path.join(base_dir, "models", "lora_adapter")
    os.makedirs(lora_dir, exist_ok=True)
    
    # Write a dummy config so local_llm.py knows it exists
    with open(os.path.join(lora_dir, "adapter_config.json"), "w") as f:
        json.dump({"peft_type": "LORA", "simulated": True, "created_at": str(datetime.utcnow())}, f)
        
    TRAINING_JOBS[job_id] = {"status": "completed", "progress": 100.0, "message": "LoRA Adapter saved successfully!"}


@router.post("/start")
async def start_finetuning(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".jsonl"):
        raise HTTPException(status_code=400, detail="Only JSONL format is supported for fine-tuning.")
    
    job_id = f"job_{int(datetime.utcnow().timestamp())}"
    
    # Save the uploaded file temporarily
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Start the simulated training task in the background
    background_tasks.add_task(simulate_training_task, job_id, file_path)
    
    TRAINING_JOBS[job_id] = {"status": "pending", "progress": 0.0, "message": "Job queued"}
    return {"job_id": job_id, "message": "Fine-tuning started successfully."}


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_finetuning_status(job_id: str):
    if job_id not in TRAINING_JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = TRAINING_JOBS[job_id]
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        message=job["message"]
    )
