# BIOMEG documentation

Three layers live in this folder. They answer different questions. A sentence in one layer does not cancel a sentence in another.

| Layer | Folder | What it answers |
|---|---|---|
| Evidence | [session/](session/), [workflow/](workflow/), [data-model/](data-model/), [modules/](modules/), [architecture/](architecture/), [sicoexc-research.md](sicoexc-research.md) | What the current program and the public SICOEXC notes showed. A line that says a portal download was not published means it was not seen. It does not cancel the BIOMEG portal |
| Behavior | [product/](product/) | What the new application does. How, when, where, and why a client, an order, a result, and a portal session are kept |
| Appearance | [brand/](brand/) and [../assets/brand/](../assets/brand/) | Color, type, components, and logo files |

## Which sentence wins

A design rule in [product/](product/) wins over a design rule in [brand/](brand/) when they describe behavior. [brand/](brand/) wins for color, type, and layout. What was on a screen on 30 October 2026 follows [session/](session/).

[access-control-plan.md](access-control-plan.md) is the analysis behind [product/06-access-control.md](product/06-access-control.md). The product page is the rule. [access-control-analysis.md](access-control-analysis.md) is the one-document summary. A prototype of the application is in progress at the repository root. Its data is invented and kept in memory. A real patient record waits for Gate C in [v0-prompts/](v0-prompts/README.md).

[v0-prompts/](v0-prompts/README.md) is a catalog of prompts that restates the behavior and appearance layers and sets no rules. The prototype follows that order. It was not produced by sending the prompts to v0.

[gates/](gates/README.md) holds Gate B: the blank answer sheet ([gate-b.md](gates/gate-b.md)), the questions to send ([gate-b-ask.md](gates/gate-b-ask.md)), and a public-web research brief ([gate-b-research.md](gates/gate-b-research.md)). Gate B is **Deferred by request**. Laboratory answers stay **Unknown**. The research brief is **Published** secondary context only; it does not close the gate or set rates, hosting, or Control N° for BIOMEG.

Start with [workspace-guide.md](workspace-guide.md) for an overview of the whole workspace, [product/README.md](product/README.md) for the application, and [brand/README.md](brand/README.md) for how a screen is drawn.
