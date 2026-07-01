---
layout: post
title: "Observability-Driven LLM Infrastructure: Scaling Ollama with Podman & Prometheus"
date: 2026-07-01 00:00:00 +0000
categories: [AI, Architecture]
tags: [Ollama, Podman, Prometheus, Observability, LocalLLM, Infrastructure]
---

# 📊 Observability-Driven LLM Infrastructure: Scaling Ollama with Podman & Prometheus

*Pull up a chair. Clear the terminal. Most people treat local LLMs as a 'set-and-forget' binary—they run a container, chat with a model, and call it a day. But in an engineering context, that is a liability. If you cannot measure your inference latency, monitor your VRAM pressure, or track request throughput, you aren't running a service; you're running a hobby.*

*In this guide, we are going to build a production-grade local LLM stack using Ollama, Podman, and the Prometheus ecosystem. We will move from basic inference to a fully observable architecture that treats your local model as a first-class citizen of your infrastructure.*

---

## 🛠️ The Foundation: Rootless Containerization & Hardware Acceleration

Before we touch the models, we need an execution environment that doesn't compromise the host system but still has direct access to the silicon. We use **Podman** for rootless execution, ensuring that our LLM service runs with the least privilege necessary.

### The Hardware Problem: GFX and iGPU
If you are running on modern AMD hardware (like the Radeon 700 series), Ollama needs a nudge to recognize the GPU correctly. This is where `HSA_OVERRIDE_GFX_VERSION` comes into play, tricking the runtime into using a compatible instruction set.

### Step-by-Step: Preparing the Host
1. **Persistence Layer**: Create a dedicated directory for model weights. Storing models inside the container layer leads to massive image sizes and data loss on restart.
   ```bash
   sudo mkdir -p /var/apps/ollama-models
   sudo chown -R $USER:$USER /var/apps/ollama-models
   ```
2. **Environment Configuration**: Create a tuning file `/var/apps/ollama.env`. This separates the "what" (the application) from the "how" (the hardware optimization).

---

## 🧠 Module 1: The Inference Engine — Optimized Ollama

We aren't using default settings. To make an LLM usable for agentic workflows (like Claude Code or custom ReAct agents), we need to expand the context window and optimize memory layouts.

### Deep-Dive: The Tuning Blueprint
In our `/var/apps/ollama.env`, we implement the following strategic overrides:

**1. Context Window Expansion:**
Standard LLMs often default to 2k or 4k tokens. For technical documentation analysis, this is insufficient. We push this to 64k.
- `OLLAMA_NUM_CTX=65536`
- `OLLAMA_CONTEXT_LENGTH=65536`

**2. Memory Efficiency:**
Using `OLLAMA_KV_CACHE_TYPE=q4_0` allows us to compress the Key-Value cache, reducing VRAM pressure during long convolutions without significantly degrading intelligence.

**3. Latency Reduction:**
- `OLLAMA_KEEP_ALIVE=24h`: Keeps the model in VRAM. No more waiting 10 seconds for the "cold start" on every request.
- `LLAMA_ARG_FLASH_ATTN=1`: Enables Flash Attention to speed up token generation.

### Deployment Execution
Run the engine with direct device passthrough:
```bash
podman run -d \
  --name=ollama \
  -p 11434:11434 \
  --device /dev/dri \
  --device /dev/kfd \
  --ulimit nofile=1048576:1048576 \
  --env-file /var/apps/ollama.env \
  -v /var/apps/ollama-models/:/var/apps/ollama-models/:z \
  docker.io/ollama/ollama
```

---

## 📈 Module 2: The Observability Stack — Metrics & Monitoring

An LLM is a black box. To open it, we introduce two sidecar components that transform raw API calls into time-series data.

### Component A: The Ollama Exporter
The `ollama-exporter` bridges the gap between Ollama's internal state and Prometheus. It scrapes the `/api/tags` and current model status to report how many models are loaded and their health.

**Deployment:**
```bash
podman run -d \
  --name=ollama_exporter \
  -p 9400:9400 \
  -e OLLAMA_HOST=http://ollama:11434 \
  ghcr.io/maravexa/ollama-exporter:latest
```

### Component B: The Metrics Proxy
While the exporter tells us about the *state*, the `ollama-metrics` proxy tells us about the *traffic*. It intercepts every request to measure:
- **TTFT (Time To First Token):** The critical metric for perceived responsiveness.
- **TPS (Tokens Per Second):** The actual throughput of your hardware setup.

---

## ⚖️ Module 3: Integration & Verification

Now we verify that our "Hardened" stack is actually performing as expected.

### Testing the Context Window
To verify that the 64k context window is active, use a large prompt or a long-form document and monitor for `OOM` (Out of Memory) errors. Because we set `OLLAMA_KV_CACHE_TYPE=q4_0`, your VRAM usage should remain stable even as the conversation grows.

### The Observability Loop
1. **Prometheus Scrape**: Configure Prometheus to scrape port `9400`.
2. **Grafana Dashboard**: Build a dashboard focusing on:
   - **VRAM Saturation**: Is the model fully offloaded? (`LLAMA_ARG_N_GPU_LAYERS=999`).
   - **Inference Latency**: Compare your TPS against different quantization levels (q4 vs q8).

---

## 🏁 Final Wrap-up: From Hobby to Infrastructure

We've moved from a simple binary to a professional AI inference stack. By implementing the following, we've ensured our local LLM is production-ready:
1. **Hardware Alignment**: GFX overrides for GPU stability.
2. **Performance Tuning**: 64k context and Flash Attention for agentic utility.
3. **Infrastructure Standards**: Rootless Podman with volume persistence.
4. **Full Observability**: Prometheus integration to eliminate the "black box" problem.

*The goal isn't just to run a model; it's to know exactly why that model is slow, where the bottleneck is, and how to scale it. Now you have the blueprint—go build your own ironclad inference station.*
