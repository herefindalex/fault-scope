# Non-goals

FaultScope teaches reasoning through specific authored Cases. It is not a workflow engine, task queue, chaos platform, generic distributed-system simulator, formal verification platform, browser IDE, system-design interview platform, Raft/Paxos course, or certification system. A general simulator would need a general execution model; a browser IDE would need code execution isolation. FaultScope has neither runtime service.

The VM, Job Store, order, and broker examples are synthetic teaching models. They do not claim the behavior of any particular cloud provider, lease service, database deployment, or message broker. The fixtures establish the stated model's behavior, not universal correctness. See [product overview](overview.md) and [runtime contract](../architecture/runtime-contract.md).
