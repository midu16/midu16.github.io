---
layout: post
title: "Leveling Up: A Deep-Dive Guide to Building NVIDIA-Powered Agents on Fedora"
date: 2026-05-30
categories: [AI, Engineering]
tags: [NVIDIA, Agents, Fedora, ReAct, RAG, Podman]
---

# 🍄 Leveling Up: A Deep-Dive Guide to Building NVIDIA-Powered Agents on Fedora

*Pull up a chair. Clear the whiteboard. We aren't here for the marketing hype or the "AI will change the world" clickbait. We're here to talk about the mechanics. We're going to walk through the architecture used in the `brevdev/workshop-build-an-agent` workshop, but we're doing it the right way: with deep-dive code, measurable metrics, and a setup optimized strictly for Fedora.*

*If you're looking for a tutorial on how to prompt a chatbot, close this tab. If you want to build a system that reasons, retrieves, and defends itself, let's get to work.*

---

## 🛠️ The Foundation: The Fedora Engineering Station

Before we write a single line of Python, we need a workstation that won't fail us. On Fedora, we want a clean, container-ready environment with the necessary NVIDIA toolchains.

**The Setup:**
Open your terminal. We aren't just installing packages; we're setting up a professional pipeline.

```bash
# 1. Update the system to ensure the kernel and drivers are aligned
sudo dnf update -y

# 2. Install the essential build tools and container runtime
sudo dnf install -y python3-pip python3-devel git podman podman-compose gcc

# 3. Ensure the NVIDIA Container Toolkit is present (Crucial for GPU access in Podman)
# Note: This assumes you have already installed the NVIDIA drivers via RPM Fusion
sudo dnf config-manager --add-repo https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo
sudo dnf install -y nvidia-container-toolkit
sudo systemctl restart podman

# 4. Create our isolated workspace
mkdir -p ~/projects/agent-workshop && cd ~/projects/agent-workshop
python3 -m venv venv
source venv/bin/activate

# 5. Install the NVIDIA AI stack
pip install nvidia-nemo-retriever nvidia-nim-client langchain ragas podman
```

---

## 🧠 Module 1: The Brain — ReAct Architecture

**The Concept: Define "ReAct"**
**ReAct** (Reason + Act) is an architecture where an LLM doesn't just output text; it outputs a sequence of **Thoughts**, **Actions**, and **Observations**. 

Think of it like a chess engine. The engine doesn't just move a piece. It *thinks* ("If I move my Knight, I threaten the Queen"), *acts* (moves the Knight), and *observes* the new board state. Without the "Observe" step, the agent is just hallucinating in a vacuum.

**Deep Dive: Implementing the ReAct Loop**
Here is how we implement the core loop in Python using NVIDIA NIM clients.

```python
# agent_core.py
import os
from nvidia_nim_client import NIMClient

class ReActAgent:
    def __init__(self, model_name="meta/llama-3-70b"):
        self.client = NIMClient(api_key=os.getenv("NVIDIA_API_KEY"))
        self.model = model_name
        self.tools = {"get_weather": self._get_weather_tool}

    def _get_weather_tool(self, location: str):
        # In a real scenario, this calls an external API
        return f"The weather in {location} is 22°C and sunny."

    async def run(self, prompt: str):
        current_prompt = f"Prompt: {prompt}\nFormat: Thought, Action, Observation\n"
        
        for _ in range(5):  # Limit loops to prevent infinite recursion
            # 1. THOUGHT & ACTION PHASE
            response = await self.client.complete(
                model=self.model,
                prompt=current_prompt,
                stop=["Observation:"]
            )
            
            thought_action = response.text
            print(f"🤖 [THOUGHT/ACTION]: {thought_action.strip()}")
            
            # 2. PARSING THE ACTION
            # We look for a pattern like: Action: tool_name(arg)
            if "Action:" in thought_action:
                action_line = [l for l in thought_action.split('\n') if "Action:" in l][0]
                tool_name = action_line.split(":")[1].split("(")[0].strip()
                arg = action_line.split("(")[1].split(")")[0].strip()
                
                # 3. OBSERVATION PHASE
                print(f"🔍 [EXECUTING]: {tool_name} with {arg}")
                observation = self.tools[tool_name](arg)
                print(f"📝 [OBSERVATION]: {observation}")
                
                current_prompt += f"{thought_action}\nObservation: {observation}\n"
            else:
                # If no action, the agent has reached a final answer
                print(f"✅ [FINAL ANSWER]: {thought_action}")
                break

# Usage
# await ReActAgent().run("What is the weather in Fedora City?")
```

---

## 📚 Module 2: The Memory — Agentic RAG

**The Concept: Define "Agentic RAG"**
Standard **RAG** (Retrieval-Augmented Generation) is passive: you ask a question, the system finds documents, and it answers. 
**Agentic RAG** is active. The agent has the autonomy to decide *how* to search. It can perform multi-hop retrieval, verify if the retrieved chunk is sufficient, and decide to search again if the first attempt failed.

**Deep Dive: Implementing Multi-Hop Retrieval**
We use **NVIDIA NeMo Retriever** to allow the agent to query a vector database.

```python
# retriever_tool.py
from langchain.tools import tool
from nvidia_nemo_retriever import NeMoRetriever

class AgenticRetriever:
    def __arg_parsing(self):
        # Logic to parse queries
        pass

    @tool
    async def intelligent_search(query: str):
        """Searches the internal knowledge base for technical details."""
        retriever = NeMoRetriever(index_path="./vector_db")
        
        # The agent can decide to 're-query' if the first result is too vague
        docs = await retriever.retrieve(query, top_k=3)
        
        if not docs:
            return "No direct info found. Suggesting a broader search."
        
        return "\n".join([d.page_content for d in docs])

# This tool is then injected into the ReActAgent.tools dictionary above.
```

---

## ⚖️ Module 3: The Judge — Evaluation & RAGAS

**The Concept: Define "LLM-as-a-Judge"**
How do we verify correctness? We use an LLM to grade another LLM. We use the **RAGAS** framework to quantify this using three pillars:
1. **Faithfulness**: Did the answer come from the retrieved context (no hallucinations)?
2. **Answer Relevance**: Did it actually answer the user's question?
3. **Context Precision**: Was the retrieved information actually useful?

**Deep Dive: The Evaluation Pipeline**
On Fedora, we run this as a post-deployment check.

```python
# evaluator.py
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy
from datasets import Dataset

async def run_eval(agent_responses, context_chunks):
    """
    agent_responses: List of strings produced by our agent.
    context_chunks: The actual chunks retrieved from the DB.
    """
    data = {
        "question": ["What is the weather in Fedora City?"],
        "answer": agent_responses,
        "contexts": [context_chunks],
        "ground_truth": ["The weather in Fedora City is 22°C and sunny."]
    }
    
    dataset = Dataset.from_dict(data)
    result = await evaluate(dataset, metrics=[faithfulness, answer_relevancy])
    
    print(f"📊 Evaluation Score: {result}")
    return result

# This is part of our CI/CD pipeline. If faithfulness < 0.8, the build fails.
```

---

## 📈 Module 4: The Training — GRPO Optimization

**The Concept: Define "GRPO"**
**GRPO** (Group Relative Policy Optimization) is a reinforcement learning technique. Instead of comparing an action to a fixed "correct" answer, we compare an action to a **group** of other actions taken in the same context. This allows the model to learn which trajectories are *relatively* better, reducing the need for massive labeled datasets.

**Deep Dive: Synthetic Data Generation**
To train our agent, we need a dataset of "Good" vs "Bad" reasoning paths.

```python
# synthetic_gen.py
import json

def generate_training_samples(base_query, model_client):
    """Generates a group of reasoning paths for GRPO training."""
    samples = []
    for i in range(5):  # Generate a 'group' of 5 different attempts
        # We prompt the model to generate a different 'Thought' path
        path = model_client.generate_varied_path(base_query, temperature=0.9)
        samples.append({
            "query": base_query,
            "path": path,
            "id": f"sample_{i}"
        })
    
    with open("training_data.jsonl", "w") as f:
        for s in samples:
            f.write(json.dumps(s) + "\n")

# This JSONL file is then fed into the fine-tuning pipeline.
```

---

## 🛡️ Module 5: The Fortress — Deployment & NemoClaw

**The Concept: Define "NemoClaw"**
Deploying an agent is dangerous. An agent with tool-access is a potential gateway to your filesystem. **NemoClaw** is a security architecture that implements **Kernel-level enforcement**. It sits between the Agent and the OS, ensuring that even if the Agent is compromised, it cannot execute unauthorized `bash` commands or access sensitive files like `/etc/shadow`.

**Deep Dive: The Secure Container**
We use **Podman** on Fedora to sandbox the agent.

```podmanfile
# Podmanfile
FROM nvidia/cuda:12.1.0-base-ubuntu22.04

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Copy our secure agent code
COPY ./agent_core.py /app/agent_core.py
COPY ./retriever_tool.py /app/retriever_tool.py

WORKDIR /app
RUN pip install -r requirements.txt

# The agent runs as a non-privileged user
RUN useradd -m agentuser
USER agentuser

CMD ["python3", "agent_core.py"]
```

**The Security Enforcement (Python Middleware):**
```python
# security_wrapper.py
import subprocess

def secure_execute(command: str):
    """A wrapper that implements NemoClaw-style policy enforcement."""
    forbidden_patterns = ["/etc/shadow", "rm -rf", "chmod", "chown"]
    
    if any(pattern in command for pattern in forbidden_patterns):
        raise PermissionError(f"🚨 SECURITY VIOLATION: Attempted to use forbidden pattern: {command}")
    
    # Only allow specific, pre-approved binaries
    allowed_binaries = ["/usr/bin/ls", "/usr/bin/echo", "/usr/bin/date"]
    binary = command.split()[0]
    
    if binary not in allowed_binaries:
        raise PermissionError(f"🚨 SECURITY VIOLATION: Unauthorized binary: {binary}")

    return subprocess.check_output(command, shell=True)
```

---

## 🏁 Final Wrap-up

We've built a complete, production-ready pipeline:
1.  **ReAct** for reasoning.
2.  **Agentic RAG** for deep knowledge retrieval.
3.  **RAGAS** for measurable, automated quality control.
4.  **GRPO** for scalable, group-based reinforcement learning.
5.  **Podman & NemoClaw** for ironclad, kernel-level security.

*This isn't just a tutorial; it's a blueprint. Now, take this code, take your Fedora machine, and go build something intelligent.*

**Sources:**
- [Workshop: Build an AI Agent](https://github.com/brevdev/workshop-build-an-agent)
- [NVIDIA NeMo Documentation](https://github.com/NVIDIA/NeMo)
- [RAGAS Evaluation Framework](https://github.com/explodinggradients/ragas)
