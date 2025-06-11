# Contributing to EstimateAI

Thank you for your interest in contributing to EstimateAI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information
   - Error messages

### Suggesting Features

1. **Check the roadmap** to see if it's already planned
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity**

### Code Contributions

#### Prerequisites

- Node.js 18+
- Git knowledge
- TypeScript/React experience
- Familiarity with Supabase

#### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/estimateai.git
   cd estimateai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment** (see README.md)
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Coding Standards

- **TypeScript**: Use strict typing
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS classes only
- **Icons**: Lucide React icons
- **Formatting**: Prettier configuration included
- **Linting**: ESLint rules enforced

#### Code Style Guidelines

```typescript
// ✅ Good: Descriptive component names
export default function FileUploadProgress() {
  // Component logic
}

// ✅ Good: Proper TypeScript interfaces
interface ProjectData {
  id: string;
  name: string;
  status: 'draft' | 'processing' | 'completed';
}

// ✅ Good: Consistent error handling
try {
  const result = await processFile(file);
  setResults(result);
} catch (error) {
  console.error('Processing failed:', error);
  setError('Failed to process file');
}
```

#### File Organization

- **Components**: One component per file
- **Hooks**: Custom hooks in `/hooks` directory
- **Services**: Business logic in `/services`
- **Utils**: Helper functions in `/utils`
- **Types**: TypeScript interfaces with components

#### Testing

- Write tests for new features
- Ensure existing tests pass
- Test across different browsers
- Verify mobile responsiveness

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all checks pass**:
   - TypeScript compilation
   - ESLint rules
   - Build process
4. **Write clear commit messages**:
   ```
   feat: add real-time processing status updates
   
   - Add WebSocket connection for live updates
   - Update ProcessingView component
   - Add progress indicators
   ```
5. **Create detailed PR description**:
   - What changes were made
   - Why they were necessary
   - How to test the changes
   - Screenshots if UI changes

## 🏗️ Architecture Guidelines

### Component Structure

```typescript
// Component template
import React, { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // Props interface
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
}
```

### Service Layer

```typescript
// Service template
class ServiceName {
  async methodName(params: ParamType): Promise<ReturnType> {
    try {
      // Service logic
      return result;
    } catch (error) {
      console.error('Service error:', error);
      throw new Error('User-friendly error message');
    }
  }
}

export const serviceName = new ServiceName();
```

### Database Patterns

- Use Supabase client consistently
- Implement proper error handling
- Follow RLS (Row Level Security) patterns
- Use TypeScript for database types

## 🔧 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Formatting changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Release Process

1. **Version bumping**: Follow semantic versioning
2. **Changelog**: Update CHANGELOG.md
3. **Testing**: Comprehensive testing before release
4. **Documentation**: Update relevant docs

## 🎨 UI/UX Guidelines

### Design Principles

- **Simplicity**: Clean, uncluttered interfaces
- **Consistency**: Uniform patterns across the app
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Mobile-first design
- **Performance**: Fast loading and interactions

### Color Palette

```css
/* Primary Colors */
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Status Colors */
--green-600: #16a34a; /* Success */
--red-600: #dc2626;   /* Error */
--yellow-600: #ca8a04; /* Warning */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-900: #111827;
```

### Component Patterns

- Use consistent spacing (Tailwind's spacing scale)
- Implement proper loading states
- Add hover and focus states
- Include proper ARIA labels

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Cover edge cases and error scenarios

### Integration Tests

- Test component interactions
- Verify API integrations
- Test user workflows

### Manual Testing

- Cross-browser compatibility
- Mobile responsiveness
- Accessibility features
- Performance on slow connections

## 📚 Documentation

### Code Documentation

- Use JSDoc for functions
- Comment complex logic
- Document API interfaces
- Include usage examples

### User Documentation

- Update README.md for new features
- Add setup instructions
- Include troubleshooting guides
- Provide configuration examples

## 🚀 Deployment

### Environment Setup

- Development: Local with hot reload
- Staging: Preview deployments for PRs
- Production: Main branch auto-deployment

### Quality Gates

- All tests must pass
- TypeScript compilation successful
- ESLint rules satisfied
- Build process completes
- Manual testing completed

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/estimateai)
- **GitHub Discussions**: Ask questions and share ideas
- **Email**: developers@estimateai.com
- **Documentation**: Check the wiki first

## 🏆 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Invited to the contributors team
- Given priority support

Thank you for helping make EstimateAI better! 🙏