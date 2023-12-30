import base64
import io
from torch.multiprocessing import Process, set_start_method, Manager
try:
    set_start_method('spawn')
except RuntimeError:
    pass
from langchain.tools import BaseTool
from langchain.chains import LLMChain
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.utilities.dalle_image_generator import DallEAPIWrapper
from diffusers import DiffusionPipeline
import requests
import torch


def refine_worker(prompt, sharedmem):
    refiner = DiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-refiner-1.0",
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16",
    )
    refiner.to("cuda")

    image = refiner(
        prompt=prompt,
        num_inference_steps=40,
        denoising_start=0.8,
        image=base64.b64decode(sharedmem["image"]),
    ).images[0]

    image_data = io.BytesIO()
    image.save(image_data, format="JPEG")
    image_base64 = base64.b64encode(image_data.getvalue()).decode('utf-8')

    sharedmem["image"] = image_base64


class RefineImage(BaseTool):
    name = "Image refiner"
    description = "use this tool when you need to refine an image."
    return_direct = True

    def _run(self, query: str) -> str:
        manager = Manager()
        sharedmem = manager.dict()

        p = Process(target=refine_worker, args=(query, sharedmem))
        p.start()
        p.join()

        return {"type": "refineimage", "image": sharedmem["image"], "prompt": query}

    async def _arun(self, query: str) -> str:
        raise NotImplementedError("N/A")