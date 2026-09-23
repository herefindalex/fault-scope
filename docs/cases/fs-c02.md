# FS-C02: Can the Old Worker Still Commit?

**Primary reasoning dimension:** authority. The interactive route `/en/cases/can-the-old-worker-still-commit/` presents a synthetic Job J, Workers A and B, and an authoritative Job Store.

## Contract and property

A acquires generation 7 and starts processing. A pauses. B takes over with generation 8, which becomes current in the Job Store. B starts but **has not committed**. Job J remains `RUNNING` when A resumes.

The weak `StoreResult(jobID, result)` accepts a result whenever the job exists and is `RUNNING`. It does not compare the worker's acquired generation with the Store's current generation. A7 can therefore make its result authoritative after B8 has taken over.

> Once generation 8 becomes current, generation 7 must not make Job J's protected result authoritative.

The stronger mutation carries `acquiredGeneration`. The Job Store atomically checks `state == RUNNING` and `acquired_generation == current_generation`. It rejects A7 and accepts B8. This is a positive control: current authority can still make progress.

## What the repair establishes

A stale worker may continue executing. The repair prevents stale authority from changing **protected Job Store state**; it does not stop A's process. A local `lease.Valid()` check can become stale between the check and the mutation. An email provider that does not receive and enforce the generation can still accept A's `SendEmail` call. The guarantee ends at a resource that does not participate in the protocol.

The Authority Timeline is Case-specific. Guided mode walks through the takeover, weak counterexample, repair, positive control, external boundary, and Six Questions recap. Challenge asks the learner to judge the weak Store contract. Deep Dive explores stale local checks, terminal-state guards, external effects, and a document-publishing transfer.

## Implementation and evidence

- Canonical metadata: `web/src/case-02-data.json`
- Human copy: `web/content/cases/fs-c02/locales/`
- Case reasoning and Authority Timeline: `web/components/LaterCaseExperience.tsx`
- Seven Code Lens sources and behavioral fixtures: `examples/<language>/case02*` (Java and PHP use `Case02*`)
- Shared route, progress, and navigation: `web/src/cases.ts`, `web/components/useCaseProgress.ts`, and `web/components/CaseShell.tsx`

The fixtures prove the synthetic Store behavior under the stated assumptions. They do not prove that a real lease service, database, or external provider implements this contract.
