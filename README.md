# Xinyu Zhang

**Database systems · Computer architecture · Accelerated computing**

Undergraduate at the **University of Michigan**, studying Computer Science and
Mathematical Sciences, with a minor in Electrical Engineering.

I study how analytical queries execute on specialized hardware—from operator
semantics to kernels, memory layouts, and data movement.

[Email](mailto:zhangxinyu040326@163.com) ·
[LinkedIn](https://www.linkedin.com/in/xinyu-zhang1) ·
[Publication](https://pubmed.ncbi.nlm.nih.gov/41282750/)

---

### Research

Exploring accelerator-native database execution through correctness checks,
operator benchmarks, and hardware-aware profiling. Active faculty-supervised
research; code and unpublished measurements remain private.

<details>
<summary>A closer look · matrix multiplication on a systolic array</summary>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/systolic-array-mobile.svg">
  <img src="./assets/systolic-array.svg" width="100%" alt="Conceptual 3 by 3 output-stationary matrix multiplication: operands meet across the array and outputs complete diagonally.">
</picture>

A conceptual trace: 27 multiply–accumulate events, nine completed outputs.
This illustrates execution mechanics, not a physical accelerator floorplan.

</details>

### Selected work

- **Processor architecture** — A two-wide LC2K core with micro-op lowering,
  windowed issue, dual ALUs, and writeback bypassing. Verified with memory
  traces and gate-level synthesis under a 20 ns clock constraint.
- **Operating systems** — A preemptive thread library, concurrent TCP file
  server, and virtual memory manager with Clock replacement and copy-on-write.
- **[Language model from scratch](https://github.com/samixyzdev/A_language_model_from_scratch)** —
  BPE tokenization and Transformer components in PyTorch, with reference-output tests.

<sub>Processor and operating-systems implementations are private coursework.</sub>

<details>
<summary>A closer look · processor execution trace</summary>

<picture>
  <source media="(max-width: 600px)" srcset="./assets/lc2k-pipeline-mobile.svg">
  <img src="./assets/lc2k-pipeline.svg" width="100%" alt="Two-wide LC2K execution trace showing load micro-ops, memory stalls, and writeback forwarding into an add.">
</picture>

Archived RTL-derived playback of `simple_add`, slowed for inspection;
initial instruction-cache fill omitted. Topology is schematic.

</details>

### Publication

**[PANCDetect](https://pubmed.ncbi.nlm.nih.gov/41282750/)** · Co-author, preprint

Early detection of pancreatic cancer from multimodal EHR data with LLM embeddings.
Contributed to clinical data preprocessing and analysis.

---

<sub>Python · C++ · SQL · SystemVerilog · PyTorch · Linux</sub>
