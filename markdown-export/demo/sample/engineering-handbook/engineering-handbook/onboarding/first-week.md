---
title: "First week"
page_id: "1003"
source_url: "https://example.atlassian.net/wiki/spaces/ENG/pages/1003/First+week"
space_key: "ENG"
parent_id: "1002"
breadcrumb: ["Engineering Handbook", "Onboarding", "First week"]
labels: ["onboarding"]
author: "Priya Shah"
last_updated_by: "Sam Lee"
created: "2026-09-01T09:00:00.000Z"
updated: "2026-10-08T15:30:00.000Z"
version: 4
exported: "2026-10-10T16:00:00Z"
---

# First week

- Day 1: set up your machine
- Day 2: ship a small fix, tracked in [ENG-42](https://example.atlassian.net/browse/ENG-42)
- Day 3 to 5: pair on the current sprint

## Set up your machine

```bash
git clone git@example.com:acme/app.git
cd app
npm ci
npm test
```

**Troubleshooting**

If tests fail on a fresh clone, check your Node version against `.nvmrc`.
