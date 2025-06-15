# GitHub Copilot Notes

This file captures learnings and insights to guide future Copilot runs on this project.

## Project Context & Architecture

### Technology Stack
- **Runtime**: Bun (v1.2.x)
- **Language**: TypeScript with strict type checking
- **Linting**: ESLint with TypeScript rules
- **Testing**: Bun's built-in test runner
- **Containerization**: Docker with multi-stage builds

### Key Patterns & Conventions
- Use double quotes for strings (enforced by ESLint)
- 2-space indentation
- Unix line endings
- Semicolons required
- All TypeScript files should pass type checking without errors

## Development Workflow Insights

### Quality Gates
- Always run `bun install` before any development tasks
- Required checks before completion: lint, typecheck, test
- All quality checks must pass before considering work complete

### Code Organization
- Source code in `src/` directory
- Tests co-located with source files (`.test.ts` suffix)
- Configuration files in project root
- GitHub-specific configurations in `.github/` directory

## Common Patterns & Solutions

### Bun-Specific Considerations
- Use Bun's native test runner instead of external testing frameworks
- Leverage Bun's TypeScript support without additional transpilation
- Watch mode available for development with `bun dev`

### Docker & Deployment
- Use `oven/bun:1.2.14-slim` as base image
- Install production dependencies only in final image
- Expose port 3000 for web applications

## Lessons Learned

### Development Process
- Start with understanding existing project structure before making changes
- Verify current state (build, test, lint) before implementing changes
- Make incremental changes and verify each step
- Maintain existing code quality standards

### File Management
- Use absolute paths when working with repository files
- Respect existing file organization patterns
- Update documentation alongside code changes

## Future Guidance

### When Adding New Features
1. Check if feature aligns with existing architecture
2. Add appropriate tests for new functionality
3. Update documentation if user-facing changes
4. Ensure all quality gates pass

### When Modifying Existing Code
1. Understand the current implementation thoroughly
2. Make minimal changes to achieve the goal
3. Preserve existing functionality and tests
4. Update related documentation if needed

### Common Gotchas
- Remember to run `bun install` in fresh environments
- ESLint rules are strict - follow existing code style
- TypeScript compiler is configured for strict checking
- Tests should use Bun's test framework, not external ones