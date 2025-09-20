# Contributing to Stock Prophecy

Thank you for your interest in contributing to Stock Prophecy! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A GitHub account

### Local Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/stock-prophecy.git
   cd stock-prophecy
   ```

3. **Add the original repository as upstream**:

   ```bash
   git remote add upstream https://github.com/abhinavsudhik/stock-prophecy.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Create a branch** for your feature:

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes for production

### Making Changes

1. **Keep your fork synced**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes** following our style guidelines

4. **Test your changes**:

   ```bash
   npm run lint
   npm run build
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the README.md** if needed
5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots if applicable

### PR Title Format

Use conventional commit format:

- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update README`
- `style: fix formatting`
- `refactor: improve code structure`
- `test: add unit tests`
- `chore: update dependencies`

## Style Guidelines

### TypeScript/React

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Code Style

- Use ESLint and Prettier configurations
- 2 spaces for indentation
- Semicolons are required
- Use camelCase for variables and functions
- Use PascalCase for components and types

### Component Guidelines

- One component per file
- Use meaningful component names
- Implement proper TypeScript interfaces
- Include JSDoc comments for complex functions

### Example Component:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

/**
 * A reusable button component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Maintain consistent spacing scale

## Issue Guidelines

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if it's already fixed in the latest version
- Gather relevant information about your environment

### Creating Quality Issues

- Use appropriate issue templates
- Provide clear, concise titles
- Include steps to reproduce for bugs
- Add screenshots when helpful
- Tag with appropriate labels

### Bug Reports Should Include:

- Environment details (OS, browser, Node.js version)
- Steps to reproduce
- Expected vs. actual behavior
- Console errors (if any)
- Screenshots (if applicable)

### Feature Requests Should Include:

- Clear problem statement
- Proposed solution
- Alternative approaches considered
- Use cases and benefits

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for components
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update type definitions
- Include code examples in documentation

## Getting Help

- Check existing issues and discussions
- Join our community discussions
- Tag maintainers in issues when needed
- Be patient and respectful

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for contributing to Stock Prophecy! 🔮
