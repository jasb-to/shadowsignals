# install dependencies if not already (e.g., via requirements.txt)
# pip install transformers accelerate torch

from transformers import LlamaTokenizer, LlamaForCausalLM
import torch

MODEL_NAME = "ChanceFocus/finma-7b-full"

def load_model(device="auto"):
    tokenizer = LlamaTokenizer.from_pretrained(MODEL_NAME)
    model = LlamaForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map="auto" if torch.cuda.is_available() else None,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    )
    model.eval()
    return tokenizer, model

def infer(text, tokenizer, model, max_length=256):
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    with torch.no_grad():
        output_ids = model.generate(
            inputs["input_ids"],
            max_length=max_length,
            do_sample=False
        )
    output = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return output

if __name__ == "__main__":
    tokenizer, model = load_model()
    prompt = (
        "Summarise the following crypto-asset news for risk signals:\n"
        "'[Insert your news article here]'\n"
        "Detect sentiment, flag any tokens or projects mentioned, and provide a one-line actionable insight."
    )
    result = infer(prompt, tokenizer, model)
    print("Result:\n", result)
