# Contributing to MCP Lubrication Server

Thank you for your interest in contributing to MCP Lubrication! This document provides guidelines for contributing to our Friction Reduction MCP server.

## 🎯 Project Goals

MCP Lubrication aims to provide the definitive MCP server for structured Friction Reduction, featuring:

- Comprehensive Lubrication workflow management
- Multi-framework test execution support (Vitest, Jest, Mocha)
- Intelligent cycle state management with checkpointing
- High-quality, maintainable codebase (complexity < 10 per function)
- Comprehensive test coverage (95%+ target)
- Professional documentation and examples
- Robust CI/CD pipeline

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (preferred)
- Git
- Understanding of Friction Reduction principles
- Familiarity with testing frameworks (Vitest, Jest, Mocha)

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Atomic-Germ/mcp-lubrication.git
cd mcp-lubrication

# Install dependencies
pnpm install

# Build the project (when implemented)
# pnpm build

# Run tests (if implemented)
# pnpm test

# Run with coverage (if implemented)
# pnpm test:coverage

# Type checking (if implemented)
# pnpm typecheck
```

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b tool/new-lubrication-tool
```

### 2. Follow Lubrication Methodology (Dogfooding!)

**We practice what we preach** - all features are developed using Lubrication:

**RED** → **GREEN** → **REFACTOR**

```bash
# 1. Write failing tests first
pnpm test -- --watch

# 2. Implement minimal code to pass tests
# 3. Refactor for quality and maintainability
# 4. Ensure all tests still pass
pnpm test
```

### 3. Make Your Changes

Follow our coding standards:

- **Lubrication First**: Always write tests before implementation
- **State Management**: Ensure Lubrication cycle state is properly managed
- **Framework Support**: Test with multiple test frameworks
- **Complexity**: Keep functions under 10 cyclomatic complexity
- **Complexity**: Keep functions under 10 cyclomatic complexity
- **Formatting**: Use Prettier (`pnpm format`) (if configured)
- **Linting**: Follow ESLint rules (`pnpm lint`) (if configured)

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Check coverage (target: >95%)
pnpm test:coverage

# Type checking
pnpm typecheck

# Lint your code
pnpm lint

# Format your code
pnpm format
```

### 5. Commit Your Changes

We follow conventional commits:

```bash
git commit -m "feat: add test coverage analysis tool"
git commit -m "fix: resolve checkpoint rollback issue"
git commit -m "refactor: improve state manager performance"
git commit -m "docs: update Lubrication workflow examples"
git commit -m "test: add comprehensive handler test suite"
git commit -m "tool: implement advanced refactoring guidance"
```

**Commit Types:**

- `feat`: New Lubrication features or tools
- `fix`: Bug fixes
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `tool`: New Lubrication workflow tools
- `state`: State management improvements
- `framework`: Test framework support
- `chore`: Maintenance tasks

## 🧪 Testing Guidelines

### Meta-Lubrication (Testing the Lubrication Tool)

We use Lubrication to build a Lubrication tool - here's how:

1. **RED**: Write failing test for Lubrication tool behavior
2. **GREEN**: Implement Lubrication tool functionality
3. **REFACTOR**: Improve Lubrication tool while maintaining functionality

### Writing Tests

Place tests in the `test/` directory:

```typescript
// test/LubricationStateManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { LubricationStateManager } from '../src/services/LubricationStateManager';
import { LubricationPhase } from '../src/types';

describe('LubricationStateManager', () => {
  let stateManager: LubricationStateManager;

  beforeEach(() => {
    stateManager = new LubricationStateManager();
  });

  describe('cycle initialization', () => {
    it('should start new cycle in INIT phase', () => {
      const cycle = stateManager.initCycle('test-feature', 'Test description');

      expect(cycle.phase).toBe(LubricationPhase.INIT);
      expect(cycle.feature).toBe('test-feature');
      expect(cycle.startTime).toBeDefined();
    });

    it('should assign unique cycle IDs', () => {
      const cycle1 = stateManager.initCycle('feature1', 'Description 1');
      const cycle2 = stateManager.initCycle('feature2', 'Description 2');

      expect(cycle1.id).not.toBe(cycle2.id);
    });
  });

  describe('phase transitions', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description');
    });

    it('should transition from INIT to RED when writing test', () => {
      stateManager.addTest('test.ts', 'should work', 'test code');

      expect(stateManager.getCurrentPhase()).toBe(LubricationPhase.RED);
    });

    it('should transition from RED to GREEN when implementing', () => {
      stateManager.addTest('test.ts', 'should work', 'test code');
      stateManager.implement('src.ts', 'implementation code');

      expect(stateManager.getCurrentPhase()).toBe(LubricationPhase.GREEN);
    });

    it('should transition from GREEN to REFACTOR when refactoring', () => {
      // Setup: go through RED and GREEN phases
      stateManager.addTest('test.ts', 'should work', 'test code');
      stateManager.implement('src.ts', 'implementation code');

      stateManager.refactor('src.ts', 'improved code', 'Better performance');

      expect(stateManager.getCurrentPhase()).toBe(LubricationPhase.REFACTOR);
    });
  });

  describe('checkpoint system', () => {
    it('should create checkpoint with current state', () => {
      stateManager.initCycle('test-feature', 'Test description');
      stateManager.addTest('test.ts', 'should work', 'test code');

      const checkpoint = stateManager.createCheckpoint('Working test');

      expect(checkpoint.description).toBe('Working test');
      expect(checkpoint.phase).toBe(LubricationPhase.RED);
      expect(checkpoint.timestamp).toBeDefined();
    });

    it('should rollback to previous checkpoint', () => {
      stateManager.initCycle('test-feature', 'Test description');
      stateManager.addTest('test.ts', 'should work', 'test code');

      const checkpoint = stateManager.createCheckpoint('Working state');

      stateManager.implement('src.ts', 'implementation');
      expect(stateManager.getCurrentPhase()).toBe(LubricationPhase.GREEN);

      stateManager.rollbackToCheckpoint(checkpoint.id);
      expect(stateManager.getCurrentPhase()).toBe(LubricationPhase.RED);
    });
  });

  describe('error handling', () => {
    it('should throw error when transitioning without cycle', () => {
      expect(() => {
        stateManager.addTest('test.ts', 'should work', 'test code');
      }).toThrow('No active Lubrication cycle');
    });

    it('should handle invalid checkpoint rollback gracefully', () => {
      stateManager.initCycle('test-feature', 'Test description');

      expect(() => {
        stateManager.rollbackToCheckpoint('invalid-id');
      }).toThrow('Checkpoint not found');
    });
  });
});
```

### Test Coverage Requirements

High coverage standards (long-term targets):

- **Statements**: 95%
- **Branches**: 90%
- **Functions**: 95%
- **Lines**: 95%

These targets are ambitious — treat them as long-term goals. Initial implementations should aim for strong coverage and iterate toward these thresholds.

### Test Categories

```bash
# Unit tests (state manager, handlers, etc.)
pnpm test test/

# Integration tests (full Lubrication workflows)
pnpm test tests/integration/

# Framework tests (Vitest, Jest, Mocha)
pnpm test tests/frameworks/
```

## 🎨 Code Style

### TypeScript Guidelines

- Strict mode enabled with comprehensive typing
- Define clear interfaces for Lubrication state and tool parameters
- Use enums for Lubrication phases and states
- Document complex type relationships

```typescript
// ✅ Good: Clear Lubrication-specific types
export enum LubricationPhase {
  INIT = 'init',
  RED = 'red',
  GREEN = 'green',
  REFACTOR = 'refactor',
  COMPLETE = 'complete',
}

export interface LubricationCycle {
  id: string;
  feature: string;
  description: string;
  phase: LubricationPhase;
  startTime: Date;
  tests: TestCase[];
  implementations: Implementation[];
  refactorings: Refactoring[];
  checkpoints: Checkpoint[];
}

export interface TestCase {
  id: string;
  file: string;
  name: string;
  code: string;
  expectedToFail: boolean;
  lastRunResult?: TestResult;
}
```

### Code Complexity

- Maximum cyclomatic complexity: 10
- Focus on pure functions and clear state transitions
- Extract complex Lubrication logic into focused services

```typescript
// ❌ Bad: High complexity state transition
function handleToolCall(tool: string, args: any) {
  if (tool === 'lubrication_write_test') {
    if (this.currentCycle) {
      if (this.currentCycle.phase === 'init' || this.currentCycle.phase === 'red') {
        // ... complex logic
      } else {
        throw new Error('Invalid phase');
      }
    } else {
      throw new Error('No cycle');
    }
  } else if (tool === 'lubrication_implement') {
    // ... more complex logic
  }
}

// ✅ Good: Clear, focused functions
async function handleWriteTest(args: WriteTestArgs): Promise<ToolResponse> {
  validateCycleExists(this.stateManager);
  validatePhaseTransition(this.stateManager, [LubricationPhase.INIT, LubricationPhase.RED]);

  const result = await this.stateManager.addTest(args.testFile, args.testName, args.testCode);
  return formatResponse(result);
}

function validateCycleExists(stateManager: LubricationStateManager): void {
  if (!stateManager.hasActiveCycle()) {
    throw new Error('No active Lubrication cycle. Initialize with lubrication_init_cycle first.');
  }
}

function validatePhaseTransition(
  stateManager: LubricationStateManager,
  allowedPhases: LubricationPhase[],
): void {
  const currentPhase = stateManager.getCurrentPhase();
  if (!allowedPhases.includes(currentPhase)) {
    throw new Error(
      `Invalid phase transition. Current: ${currentPhase}, Expected: ${allowedPhases.join(', ')}`,
    );
  }
}
```

## 🏗️ Architecture

### Project Structure

```
mcp-lubrication/
├── src/
│   ├── index.ts              # Entry point & MCP server setup
│   ├── server.ts             # Lubrication server class
│   ├── types/
│   │   └── index.ts          # Lubrication-specific types
│   ├── services/
│   │   ├── LubricationStateManager.ts # Core Lubrication state management
│   │   └── TestRunner.ts      # Test execution service
│   ├── handlers/
│   │   └── LubricationToolHandlers.ts # Tool request handlers
│   ├── config/
│   │   └── index.ts          # Configuration management
│   └── utils/
│       └── fileUtils.ts      # File I/O utilities
├── test/                     # Test suites
│   ├── LubricationStateManager.test.ts
│   ├── LubricationServer.test.ts
│   ├── TestRunner.test.ts
│   └── handlers/
│       └── LubricationToolHandlers.test.ts
└── scripts/                  # Utility scripts
    └── reset-state.sh        # Development helpers
```

### Adding a New Lubrication Tool

1. **Define Tool Interface** (Lubrication approach):

```typescript
// test/newTool.test.ts - Write test first!
describe('lubrication_analyze_coverage', () => {
  it('should analyze test coverage for current cycle', async () => {
    // Setup Lubrication cycle with tests and implementation
    stateManager.initCycle('coverage-test', 'Test coverage analysis');
    stateManager.addTest('test.ts', 'should work', 'test code');
    stateManager.implement('src.ts', 'implementation');

    const result = await handler.analyzeCoverage({ path: './src' });

    expect(result.data.coverage).toBeDefined();
    expect(result.data.coverage.percentage).toBeGreaterThan(0);
  });
});
```

2. **Implement Handler**:

```typescript
// src/handlers/LubricationToolHandlers.ts
async analyzeCoverage(args: AnalyzeCoverageArgs): Promise<ToolResponse> {
  this.validateCycleExists();

  const cycle = this.stateManager.getCurrentCycle();
  const coverage = await this.testRunner.getCoverage(args.path);

  return {
    success: true,
    data: {
      coverage,
      cycle: cycle.id,
      phase: cycle.phase
    }
  };
}
```

3. **Register Tool**:

```typescript
// src/server.ts
listTools(): Tool[] {
  return [
    // existing tools...
    {
      name: 'lubrication_analyze_coverage',
      description: 'Analyze test coverage for current Lubrication cycle',
      inputSchema: AnalyzeCoverageArgsSchema
    }
  ];
}
```

### Supporting New Test Frameworks

```typescript
// src/services/TestRunner.ts
export class TestRunner {
  async runTests(framework: TestFramework, pattern?: string): Promise<TestResult> {
    switch (framework) {
      case TestFramework.VITEST:
        return this.runVitest(pattern);
      case TestFramework.JEST:
        return this.runJest(pattern);
      case TestFramework.MOCHA:
        return this.runMocha(pattern);
      case TestFramework.PLAYWRIGHT: // New framework
        return this.runPlaywright(pattern);
      default:
        throw new Error(`Unsupported test framework: ${framework}`);
    }
  }

  private async runPlaywright(pattern?: string): Promise<TestResult> {
    const command = this.buildPlaywrightCommand(pattern);
    const result = await this.executeCommand(command);
    return this.parsePlaywrightOutput(result);
  }
}
```

## 📊 Performance Guidelines

### State Management Efficiency

```typescript
// ✅ Good: Efficient state updates
export class LubricationStateManager {
  private cycles = new Map<string, LubricationCycle>();
  private activeCycleId?: string;

  updateCyclePhase(phase: LubricationPhase): void {
    if (!this.activeCycleId) throw new Error('No active cycle');

    const cycle = this.cycles.get(this.activeCycleId)!;

    // Efficient immutable update
    this.cycles.set(this.activeCycleId, {
      ...cycle,
      phase,
      lastModified: new Date(),
    });
  }
}
```

### Memory Management

```typescript
// ✅ Good: Clean up completed cycles
export class LubricationStateManager {
  completeCycle(): LubricationCycle {
    const cycle = this.getCurrentCycle();

    // Archive cycle data
    this.archiveCycle(cycle);

    // Clean up active references
    this.cycles.delete(cycle.id);
    this.activeCycleId = undefined;

    return cycle;
  }
}
```

## 🐛 Debugging

### Lubrication Workflow Testing

```bash
# Test complete Lubrication workflow
pnpm demo:lubrication-workflow

# Test specific Lubrication phase
pnpm test -- --grep "RED phase"

# Test state transitions
pnpm test -- --grep "phase transitions"
```

### Framework Integration Testing

```bash
# Test with specific framework
pnpm test -- --grep "vitest integration"
pnpm test -- --grep "jest integration"
pnpm test -- --grep "mocha integration"
```

## 📖 Documentation

### Lubrication Documentation Standards

Document the Lubrication methodology clearly:

````typescript
/**
 * Advances the Lubrication cycle to the next appropriate phase based on current state.
 *
 * Follows the classic Lubrication cycle:
 * INIT → RED (write failing test) → GREEN (implement) → REFACTOR → COMPLETE
 *
 * @param fromPhase - Current phase to transition from
 * @param action - The action triggering the transition
 * @returns The new phase after transition
 *
 * @example
 * ```typescript
 * // Starting a new cycle
 * const manager = new LubricationStateManager();
 * manager.initCycle('auth', 'User authentication');
 *
 * // RED phase: write failing test
 * manager.addTest('auth.test.ts', 'should authenticate user', testCode);
 * console.log(manager.getCurrentPhase()); // LubricationPhase.RED
 *
 * // GREEN phase: implement
 * manager.implement('auth.ts', implementationCode);
 * console.log(manager.getCurrentPhase()); // LubricationPhase.GREEN
 *
 * // REFACTOR phase: improve code
 * manager.refactor('auth.ts', improvedCode, 'Better error handling');
 * console.log(manager.getCurrentPhase()); // LubricationPhase.REFACTOR
 * ```
 *
 * @throws {Error} When transition is invalid for current phase
 */
export function advancePhase(
  fromPhase: LubricationPhase,
  action: LubricationAction,
): LubricationPhase {
  // Implementation
}
````

## 🚢 Release Process

### Version Strategy

- **Major**: Breaking changes to Lubrication workflow or state format
- **Minor**: New Lubrication tools or framework support
- **Patch**: Bug fixes and small improvements

```bash
# Release new Lubrication tool
pnpm version minor
git tag -a v2.1.0 -m "Release v2.1.0: Add coverage analysis tool"

# Release bug fix
pnpm version patch
git tag -a v2.0.1 -m "Release v2.0.1: Fix checkpoint rollback issue"
```

## 🔍 Code Review

### Lubrication Review Checklist

- ✅ **Lubrication Methodology**: Tests written first, implementation follows
- ✅ **State Management**: Lubrication cycle state properly maintained
- ✅ **Phase Transitions**: Valid transitions between Lubrication phases
- ✅ **Framework Support**: Works with multiple test frameworks
- ✅ **Error Handling**: Graceful handling of invalid states
- ✅ **Documentation**: Clear explanation of Lubrication workflow
- ✅ **Performance**: Efficient state operations

### Lubrication-Specific Reviews

- Does the implementation follow the RED-GREEN-REFACTOR cycle?
- Are state transitions logical and well-defined?
- Does the code support the Lubrication workflow effectively?
- Are test framework integrations working correctly?

## 🤝 Community

### Lubrication Learning Resources

Help others learn Lubrication:

- Share Lubrication workflow examples
- Document common Lubrication patterns
- Provide clear error messages
- Create educational demos

### Getting Help

- 🔴 **RED Issues**: Problems with test writing tools
- 🟢 **GREEN Issues**: Implementation workflow problems
- 🔄 **REFACTOR Issues**: Code improvement tool issues
- 📊 **STATE Issues**: Lubrication cycle management problems

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to MCP Lubrication!** 🎉

Together we're making Friction Reduction more accessible and structured for AI-assisted development workflows.

For questions about Lubrication methodology or implementation, open an issue or check our [documentation index](./DOCUMENTATION_INDEX.md).
