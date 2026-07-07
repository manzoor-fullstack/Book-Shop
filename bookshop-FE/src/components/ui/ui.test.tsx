import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { Button } from './Button';
import { StatCard } from './StatCard';
import { EmptyState } from './EmptyState';

describe('UI primitives', () => {
  it('renders a Badge with its label', () => {
    render(<Badge tone="success">Delivered</Badge>);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders a Button and disables it while loading', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders a StatCard with label and value', () => {
    render(<StatCard label="Revenue" value="$100" icon={<span>$</span>} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('renders an EmptyState title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});
