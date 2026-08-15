# Database execution on specialized hardware

**Database systems · computer architecture · specialized hardware**

I study how database execution changes when the compute substrate is
specialized hardware. My current investigation explores analytical query
execution on TPUs with JAX and Pallas.

I am an undergraduate at the University of Michigan studying Computer Science
and Mathematical Sciences, with a minor in Electrical Engineering.

[Current investigation](#current-investigation-tpu-db) ·
[Systems evidence](#selected-systems-evidence) ·
[Research](#research-and-publication)

## Current investigation: TPU-DB

**Question.** How should analytical operators, data layouts, and memory
movement change when the execution substrate is a TPU rather than a CPU?

**What I am investigating.** I lower database operators into JAX and Pallas
kernels, then study tiling, layout, movement, and execution behavior on Google
Cloud TPU.

**Evidence.** Correctness checks, operator-level benchmarks, layout
experiments, and hardware-aware execution traces.

**Status.** Active Google-sponsored research at Michigan CSE. Research code
and unpublished measurements remain private while the work is in progress.

**Methods.** `Python` · `JAX` · `Pallas` · `SQL` · `Google Cloud TPU`

## Clocked wavefront observatory

This conceptual output-stationary trace follows one complete 3×3 matrix
multiplication. Blue A packets move right, amber B packets move down, and a
white phase-lock ring appears only when an operand pair meets at a crosspoint.
Each node locks three accumulator arcs before its teal output contact closes.

The active MAC envelope is `1 · 3 · 6 · 7 · 6 · 3 · 1`; nine outputs become
ready in an anti-diagonal `1 · 2 · 3 · 2 · 1` wave. In total, the trace records
27 MAC events and 9 completed C values.

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/systolic-array-mobile.svg">
    <img src="./assets/systolic-array.svg" width="100%" alt="Animated conceptual cycle trace of a 3 by 3 output-stationary MXU: blue A packets and amber B packets meet at circular crosspoints, three accumulator arcs lock per node, and teal output contacts close diagonally">
  </picture>
</p>

<p align="center">
  <sub>Conceptual cycle trace — not a physical TPU floorplan.</sub>
</p>

## Execution path

The broader project is an iterative systems investigation, not a fixed linear
pipeline. Measurements feed back into operator lowering, tiling, and layout.

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/execution-path-mobile.svg">
    <img src="./assets/execution-path.svg" width="100%" alt="Static systems cross-section connecting a relational operator to a JAX and Pallas execution plan, memory movement and an accelerator substrate, then feeding correctness, latency, and bandwidth measurements back into layout and kernel decisions">
  </picture>
</p>

## Selected systems evidence

### Two-way superscalar processor

**Question.** How much instruction-level parallelism can a compact pipeline
extract while keeping hazards and forwarding understandable?

**Built.** A five-stage, two-way superscalar processor with limited
out-of-order issue, branch prediction, hazard resolution, and multi-level
forwarding.

**Evidence.** Cycle-accurate memory-trace verification and gate-level synthesis
under a 20 ns clock constraint.

**Status.** Completed course project; implementation is private.

**Methods.** `SystemVerilog` · `VCS` · `Verdi` · `Synopsys Design Compiler`

### Operating systems and concurrency

**Question.** Which invariants keep concurrent runtimes, network services, and
virtual memory correct under interleaving and failure?

**Built.** A preemptive user-level thread library, a concurrent TCP file server
with hand-over-hand read-write locking and crash-consistent updates, and a
virtual memory manager with Clock replacement and copy-on-write fork.

**Evidence.** Adversarial concurrency tests, protocol validation, fault-path
testing, and correctness traces.

**Status.** Completed systems coursework; implementations are private.

**Methods.** `C++` · `Linux` · `Threads` · `TCP` · `Virtual memory`

### Language-model components from first principles

**Question.** What is hidden behind the high-level interfaces of a Transformer
implementation?

**Built.** BPE training and tokenization, embeddings, RMSNorm, SwiGLU,
scaled dot-product attention, multi-head self-attention, RoPE, and Transformer
blocks with reference-output tests.

**Evidence.** [Coursework repository and visible implementation scope](https://github.com/samixyzdev/A_language_model_from_scratch).

**Status.** Supporting coursework, not a current research focus.

**Methods.** `Python` · `PyTorch` · `Transformers`

## Research and publication

I co-authored
[PANCDetect: Early Detection of Pancreatic Cancer from Multimodal EHR Data with LLM Embeddings](https://pubmed.ncbi.nlm.nih.gov/41282750/),
a preprint for which I contributed to clinical data preprocessing and analysis.

## Methods and contact

I work across operator semantics, systems implementation, profiling,
benchmarking, memory-layout analysis, and accelerator kernels. The easiest way
to reach me is through
[LinkedIn](https://www.linkedin.com/in/xinyu-zhang1) or
[email](mailto:zhangxinyu040326@163.com).
