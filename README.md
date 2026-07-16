<h1 align="center">Xinyu Zhang</h1>

<p align="center">
  <code>TPU Architecture</code> · <code>Database Systems</code> · <code>Low-Level Systems</code>
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/xinyu-zhang1">LinkedIn</a> ·
  <a href="mailto:zhangxinyu040326@163.com">Email</a> ·
  <a href="https://pubmed.ncbi.nlm.nih.gov/41282750/">Publication</a>
</p>

I'm an undergraduate at the University of Michigan studying Data Science and
Mathematical Sciences, with a minor in Computer Science. I am interested in how
database workloads map onto specialized hardware, from query execution and data
layout down to memory movement and accelerator architecture.

## `current focus`

- Building and benchmarking database operators on Google Cloud TPU
- Exploring how joins, aggregations, and irregular access patterns map to
  SparseCore, MXU, and vector hardware
- Profiling bottlenecks across compute, memory bandwidth, data layout, and host
  transfers
- Developing a stronger low-level foundation through operating systems and
  computer architecture

## `selected work`

### [TPU-DB](https://github.com/samixyzdev/tpu-db)

Google-sponsored research at Michigan CSE on accelerating analytical database
queries with TPUs. I develop Pallas kernels for multi-table joins and GROUP-BY
aggregation, investigate SparseCore and MXU execution strategies, and compare
TPU implementations against CPU and GPU baselines.

Recent work includes a fused vectorized HBM path that reached a 25x speedup over
DuckDB on an SSB query, along with chunked execution that reduced peak HBM usage
from 28.6 GB to approximately 2 GB.

`Python` `JAX` `Pallas` `SQL` `Google Cloud TPU`

### [Language Model from Scratch](https://github.com/samixyzdev/A_language_model_from_scratch)

A from-scratch implementation of core language-model components and training
infrastructure. I keep this project because I wrote the implementation myself
and use it to understand the mechanics behind modern language models rather
than treating the framework as a black box.

`Python` `PyTorch` `Transformers`

### Low-level systems

| Project | What I implemented |
| --- | --- |
| User-level thread library | Preemptive scheduling across multiple CPUs, mutexes, condition variables, and interrupt handling |
| Multithreaded network file server | Concurrent TCP request handling, fine-grained read-write locking, and crash-consistent disk updates |
| Virtual memory manager | Page faults, swap- and file-backed pages, Clock replacement, and copy-on-write fork |

### Computer architecture

Co-designed a two-way superscalar processor with a five-stage pipeline,
limited out-of-order issue, branch prediction, hazard resolution, and
multi-level forwarding. I verified the RTL against cycle-accurate memory traces
and synthesized it under a 20 ns clock constraint.

`SystemVerilog` `VCS` `Verdi` `Synopsys Design Compiler`

## `publication`

Co-authored
[PANCDetect: Early Detection of Pancreatic Cancer from Multimodal EHR Data with LLM Embeddings](https://pubmed.ncbi.nlm.nih.gov/41282750/),
contributing to clinical data preprocessing and analysis for a multimodal
machine-learning study.

## `toolbox`

**Languages:** C, C++, Python, SQL, SystemVerilog<br>
**Systems:** Linux, multithreading, synchronization, networking, virtual memory<br>
**Performance:** profiling, benchmarking, memory-layout analysis, accelerator kernels

## `contact`

The easiest way to reach me is through
[LinkedIn](https://www.linkedin.com/in/xinyu-zhang1) or
[email](mailto:zhangxinyu040326@163.com).
