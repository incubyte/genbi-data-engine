# Documentation Maintenance Guide

_Version: 1.0.0 (Last updated: April 2025)_

This guide provides best practices for maintaining documentation in the GenBI project.

## Documentation Files

The GenBI project includes the following documentation files:

1. **README.md** - Main project overview and setup instructions
2. **docs/developer-guide.md** - Detailed guide for developers
3. **docs/api-documentation.md** - API endpoint documentation
4. **docs/user-guide.md** - End-user guide for using the application
5. **frontend/README.md** - Frontend-specific documentation
6. **frontend/TESTING.md** - Frontend testing documentation
7. **docs/documentation-maintenance.md** - This guide

## Version Tracking

All documentation files should include a version number and last updated date at the top of the file:

```markdown
_Version: 1.0.0 (Last updated: April 2025)_
```

Update this information whenever you make significant changes to the documentation.

## Documentation Update Checklist

When making code changes, use this checklist to ensure documentation stays up to date:

### For All Changes

- [ ] Update version information in affected documentation files
- [ ] Ensure code examples match the current implementation
- [ ] Update any screenshots if UI changes were made

### For API Changes

- [ ] Update API endpoint documentation in `docs/api-documentation.md`
- [ ] Update request/response examples
- [ ] Document any new parameters or response fields

### For Database Changes

- [ ] Update database connection documentation
- [ ] Document any new database types or connection parameters
- [ ] Update schema information if relevant

### For Frontend Changes

- [ ] Update component documentation
- [ ] Update UI flow descriptions
- [ ] Update screenshots if UI has changed

### For Testing Changes

- [ ] Update testing documentation
- [ ] Document any new testing approaches or tools
- [ ] Update coverage information if thresholds have changed

## Documentation Review Process

Before submitting a pull request:

1. Run all tests to ensure they pass
2. Review all documentation changes for accuracy
3. Check that version information has been updated
4. Ensure code examples are up to date
5. Verify that screenshots match the current UI

## Automated Documentation Checks

Consider implementing the following automated checks:

1. **Link Validation**: Check that all links in documentation are valid
2. **Code Example Validation**: Verify that code examples compile/run
3. **Version Check**: Ensure version information is present and up to date
4. **Spelling and Grammar**: Run documentation through a spell checker

## Documentation Best Practices

1. **Be Concise**: Keep documentation clear and to the point
2. **Use Examples**: Include code examples for complex concepts
3. **Use Screenshots**: Include screenshots for UI features
4. **Keep It Current**: Update documentation as code changes
5. **Cross-Reference**: Link between related documentation sections
6. **Use Consistent Formatting**: Follow the same formatting throughout
