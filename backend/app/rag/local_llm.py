"""Local, offline text generation for the RAG pipeline."""

import asyncio
import logging
from functools import lru_cache

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LocalLLM:
    def __init__(self) -> None:
        settings = get_settings()
        logger.info("Loading local LLM: %s", settings.local_model_id)
        self.tokenizer = AutoTokenizer.from_pretrained(settings.local_model_id)
        self.model = AutoModelForCausalLM.from_pretrained(
            settings.local_model_id,
            torch_dtype="auto",
        )
        self.model.eval()
        self.max_new_tokens = settings.local_max_new_tokens
        logger.info("Local LLM ready (device=%s)", self.model.device)

    def _generate_sync(self, system: str, user: str) -> str:
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer(prompt, return_tensors="pt")
        inputs = {name: value.to(self.model.device) for name, value in inputs.items()}

        with torch.inference_mode():
            output = self.model.generate(
                **inputs,
                max_new_tokens=self.max_new_tokens,
                do_sample=True,
                temperature=0.4,
                top_p=0.9,
                repetition_penalty=1.08,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = output[0, inputs["input_ids"].shape[1]:]
        return self.tokenizer.decode(generated, skip_special_tokens=True).strip()

    async def generate(self, system: str, user: str) -> str:
        """Run CPU-heavy generation outside the FastAPI event loop."""
        return await asyncio.to_thread(self._generate_sync, system, user)

    async def generate_stream(self, system: str, user: str):
        from transformers import TextIteratorStreamer
        from threading import Thread
        import asyncio
        import queue

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer(prompt, return_tensors="pt")
        inputs = {name: value.to(self.model.device) for name, value in inputs.items()}

        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
        
        generation_kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=self.max_new_tokens,
            do_sample=True,
            temperature=0.4,
            top_p=0.9,
            repetition_penalty=1.08,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()
        
        loop = asyncio.get_running_loop()
        
        while True:
            try:
                # get chunk with short timeout to yield to event loop
                chunk = await loop.run_in_executor(None, streamer.text_queue.get, True, 0.1)
                if chunk == streamer.stop_signal:
                    break
                if chunk:
                    yield chunk
            except queue.Empty:
                if not thread.is_alive() and streamer.text_queue.empty():
                    break


@lru_cache(maxsize=1)
def get_local_llm() -> LocalLLM:
    return LocalLLM()
