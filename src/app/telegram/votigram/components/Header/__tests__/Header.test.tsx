import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Header from '../index'; // Adjust the import path if necessary

// Mock the SVG component
vi.mock('assets/icons/chevron-right.svg', () => ({
  ReactComponent: ({ className }: { className: string }) => <svg className={className} />,
}));

describe('Header component', () => {
  const mockOnPointsClick = vi.fn();
  const mockOnAdsVideoClick = vi.fn();

  it('renders total points correctly and handles points click', () => {
    const points = 12345;
    render(
      <Header
        points={points}
        hasCompletedAds={true}
        onPointsClick={mockOnPointsClick}
        onAdsVideoClick={mockOnAdsVideoClick}
      />,
    );

    // Check if the points are displayed correctly
    expect(screen.getByText('12,345')).toBeInTheDocument();

    // Simulate click on points
    fireEvent.click(screen.getByText(/Total Points Earned/i));
    expect(mockOnPointsClick).toHaveBeenCalled();
  });

  it('renders ads promotion and handles video click when ads are not completed', () => {
    render(
      <Header
        points={0}
        hasCompletedAds={false}
        onPointsClick={mockOnPointsClick}
        onAdsVideoClick={mockOnAdsVideoClick}
      />,
    );

    // Check if the ads promotion is displayed
    expect(screen.getByText('Watch Ads For Free Points!')).toBeInTheDocument();

    // Simulate click on ads video
    fireEvent.click(screen.getByAltText('Watch Video'));
    expect(mockOnAdsVideoClick).toHaveBeenCalled();
  });

  it('does not render ads promotion when ads are completed', () => {
    render(
      <Header
        points={0}
        hasCompletedAds={true}
        onPointsClick={mockOnPointsClick}
        onAdsVideoClick={mockOnAdsVideoClick}
      />,
    );

    // Check that the ads promotion is not displayed
    expect(screen.queryByText('Watch Ads For Free Points!')).not.toBeInTheDocument();
  });
});
