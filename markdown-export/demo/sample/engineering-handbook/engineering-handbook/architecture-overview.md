---
title: "Architecture overview"
page_id: "1004"
source_url: "https://example.atlassian.net/wiki/spaces/ENG/pages/1004/Architecture+overview"
space_key: "ENG"
parent_id: "1001"
breadcrumb: ["Engineering Handbook", "Architecture overview"]
labels: ["architecture"]
author: "Priya Shah"
last_updated_by: "Sam Lee"
created: "2026-09-01T09:00:00.000Z"
updated: "2026-10-08T15:30:00.000Z"
version: 4
exported: "2026-10-10T16:00:00Z"
---

# Architecture overview

Three services, one direction of traffic.

![System overview](architecture-overview.assets/system-overview.svg)

## Services

<table><tr><th><p>Service</p></th><th><p>Owner</p></th><th><p>Status</p></th></tr><tr><td><p>Web app</p></td><td><p>@Sam Lee</p></td><td><p>[LIVE]</p></td></tr><tr><td><p>API</p></td><td><p>@Priya Shah</p></td><td><p>[MIGRATING]</p></td></tr><tr><td colspan="3"><p>The database is managed by the platform team.</p></td></tr></table>

> [!WARNING]
> Never connect to the production database from a laptop.
