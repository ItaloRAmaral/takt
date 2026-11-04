## What and why

<!-- What changes, which plan, rule (RN-...) or use case (UC-...) it implements. -->

## Checklist

### Tests

- [ ] Arrange, Act, Assert separated by blank lines, without comments; one Act per test
- [ ] Test names start with the rule or use case ID, or are a plain description when there is none
- [ ] Coverage of at least 90% (lines and branches) in every changed project

### Authorization

- [ ] Every new or changed route decides authorization on the server, per organization (ADR-0006)
- [ ] Every new business table has `organization_id` and row-level security (ADR-0003)

### Documentation

- [ ] ADR or PDR written or superseded for any decision that is hard to reverse
- [ ] Business rules (`docs/product/rules/`) updated with the behavior
- [ ] Architecture docs (`docs/architecture/`) updated with the change

### Security

- [ ] No secrets, tokens or personal data in code, config, tests or logs (ADR-0007)
