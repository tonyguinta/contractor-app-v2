# Linting and Code Quality Setup

This project uses ESLint and TypeScript to maintain code quality and catch issues before deployment.

## Tools Configured

### ESLint
- **Purpose**: Catches unused imports, variables, and other code quality issues
- **Config**: `.eslintrc.json`
- **Key Rules**:
  - `unused-imports/no-unused-imports`: Catches unused imports (would have prevented our deployment failure)
  - `unused-imports/no-unused-vars`: Catches unused variables
  - `@typescript-eslint/no-explicit-any`: Warns about `any` types

### TypeScript Compiler
- **Purpose**: Type checking without emitting files
- **Command**: `tsc --noEmit`

### Husky Pre-commit Hooks
- **Purpose**: Runs checks before each commit
- **Location**: `.husky/pre-commit`
- **Checks**: TypeScript compilation + ESLint

## Available Commands

```bash
# Run linting (allows warnings)
npm run lint

# Run linting (fails on warnings - for CI)
npm run lint:strict

# Auto-fix linting issues
npm run lint:fix

# TypeScript type checking
npm run type-check

# Run both type checking and linting
npm run pre-commit
```

## Development Workflow

### Local Development
1. **VS Code Integration**: Install ESLint extension for real-time feedback
2. **Auto-fix on save**: Configured in `.vscode/settings.json`
3. **Manual checks**: Run `npm run lint` or `npm run type-check` anytime

### Pre-commit Checks
Every commit automatically runs:
1. TypeScript compilation check
2. ESLint validation

If either fails, the commit is blocked.

### CI/CD Integration
For deployment builds, use:
```bash
npm run lint:strict  # Fails on warnings
npm run type-check   # Fails on type errors
npm run build        # Full build with type checking
```

## Common Issues and Solutions

### Unused Imports/Variables
**Error**: `unused-imports/no-unused-imports`
**Solution**: Remove the unused import or variable

### TypeScript Errors
**Error**: Type compilation failures
**Solution**: Fix type annotations or use proper TypeScript types

### `any` Type Warnings
**Error**: `@typescript-eslint/no-explicit-any`
**Solution**: Use proper TypeScript types instead of `any`

## Configuration Files

- `.eslintrc.json` - ESLint rules and configuration
- `.vscode/settings.json` - VS Code integration
- `.husky/pre-commit` - Git pre-commit hook
- `package.json` - npm scripts and lint-staged config

## Benefits

1. **Prevents deployment failures** - Catches TypeScript errors locally
2. **Maintains code quality** - Enforces consistent coding standards  
3. **Catches bugs early** - Unused variables often indicate logic errors
4. **Improves maintainability** - Cleaner, more consistent codebase
5. **Better DX** - Real-time feedback in VS Code

## Troubleshooting

### Pre-commit Hook Not Running
```bash
# Re-install Husky
cd .. && npx husky install
chmod +x .husky/pre-commit
```

### ESLint Not Working in VS Code
1. Install ESLint extension
2. Reload VS Code window
3. Check VS Code settings match `.vscode/settings.json`

### TypeScript Version Warning
The warning about TypeScript 5.8.3 vs supported 5.4.0 is cosmetic and doesn't affect functionality. 