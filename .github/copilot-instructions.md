# TypeScript Development Guidelines

## Code Organization
- Organize code into feature-based modules following single responsibility principle
- Separate rendering logic from game/business logic into dedicated modules
- Follow component-based architecture patterns where applicable
- Keep configuration numbers and strings (colors, names, configs) in global constants.ts file

## Type Safety
- Define explicit types for all variables, parameters, and return values
- Create interfaces for object structures and type aliases for complex types
- Use readonly modifiers for immutable properties
- Implement discriminated unions for type-safe conditional logic
- Use type guards and assertion functions for runtime type checking
- Never use `any` - prefer `unknown` for dynamic types
- Leverage generics for reusable, type-safe components

## Best Practices
- Initialize all class properties in constructors
- Explicitly declare access modifiers (private, protected, public)
- Use optional properties (?) instead of undefined unions
- Implement custom error types and proper error handling
- Use async/await with try/catch blocks
- Apply optional chaining (?.) and nullish coalescing (??)
- Extract magic values into named constants
- Enable and follow TypeScript-specific ESLint rules

## Data Structures
- Use enums for fixed sets of values
- Create type-safe data models using interfaces
- Implement immutable data patterns where possible

For detailed implementation examples, refer to:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)