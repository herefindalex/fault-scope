# Non-goals

FaultScope currently teaches reasoning about specific, authored cases. It is
not a workflow engine, task queue, chaos platform, generic distributed-system
simulator, formal verification platform, browser IDE, system-design interview
platform, Raft/Paxos course, or certification system.

Those tools serve different jobs. A simulator would need a general execution
model; a workflow engine would need durable business state; a browser IDE would
need code execution and isolation. FaultScope currently has none of those
runtime services. Its fixed, tested examples keep the lesson focused on
evidence, contract, and property.

The current Case 01 VM and payment examples are synthetic. They do not claim
the behavior of a particular cloud provider or payment API. Additional cases
for the intended three-case `v0.1.0` scope are planned, not implemented.

See the [product overview](overview.md) and
[runtime contract](../architecture/runtime-contract.md).
