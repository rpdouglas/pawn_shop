# Incident Postmortems

Blameless postmortems for production incidents. Written within 48 hours of resolution.

## Naming convention

`INC-NNN-YYYY-MM-DD-short-description.md`

## Template

```markdown
# INC-NNN: [Short description] — YYYY-MM-DD

**Severity:** P0 / P1 / P2
**Duration:** HH:MM
**Affected:** [views / features impacted]
**On-call:** [name]

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | Incident detected |
| HH:MM | Mitigated |
| HH:MM | Resolved |

## Root cause
[One paragraph, factual, blameless]

## Impact
[Users affected, data loss, compliance implications]

## Corrective actions
- [ ] Owner: action item
```

## Reference

Runbook playbooks are in `docs/runbook.md`. Reference the relevant playbook in each postmortem.
