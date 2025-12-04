import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TrendingList from '../index'; // Adjust this path as needed
import { RANKING_LABEL_KEY } from 'constants/ranking';
import dayjs from 'dayjs';

// Mock SVG component
vi.mock('assets/icons/vote.svg', () => ({
  ReactComponent: ({ className }: { className: string }) => (
    <svg className={className} data-testid="vote-icon" />
  ),
}));

// Mock the RANKING_LABEL_KEY
vi.mock('constants/ranking', () => ({
  RANKING_LABEL_KEY: {
    GOLD: 'gold',
    SILVER: 'silver',
    BRONZE: 'bronze',
  },
}));

describe('TrendingList component', () => {
  const mockOnItemClick = vi.fn();

  const mockData = [
    {
      active: true,
      activeEndEpochTime: dayjs().add(1, 'day').valueOf(),
      activeEndTime: dayjs().add(1, 'day').format(),
      activeStartEpochTime: dayjs().subtract(1, 'day').valueOf(),
      activeStartTime: dayjs().subtract(1, 'day').format(),
      bannerUrl: 'https://example.com/banner1.jpg',
      chainId: '1',
      daoId: 'dao1',
      labelType: RANKING_LABEL_KEY.GOLD,
      proposalDescription: 'Description for Proposal 1',
      proposalId: '1',
      proposalTitle: 'Proposal 1',
      rankingType: 'community',
      totalVoteAmount: 100,
    },
    {
      active: false,
      activeEndEpochTime: dayjs().subtract(1, 'day').valueOf(),
      activeEndTime: dayjs().subtract(1, 'day').format(),
      activeStartEpochTime: dayjs().subtract(2, 'day').valueOf(),
      activeStartTime: dayjs().subtract(2, 'day').format(),
      bannerUrl: undefined,
      chainId: '1',
      daoId: 'dao2',
      labelType: RANKING_LABEL_KEY.BLUE,
      proposalDescription: 'Description for Proposal 2',
      proposalId: '2',
      proposalTitle: 'Proposal 2',
      rankingType: 'community',
      totalVoteAmount: 50,
    },
    {
      active: false,
      activeEndEpochTime: dayjs().subtract(1, 'day').valueOf(),
      activeEndTime: dayjs().subtract(1, 'day').format(),
      activeStartEpochTime: dayjs().subtract(2, 'day').valueOf(),
      activeStartTime: dayjs().subtract(2, 'day').format(),
      bannerUrl: undefined,
      chainId: '1',
      daoId: 'dao2',
      labelType: RANKING_LABEL_KEY.BLUE,
      proposalDescription: 'Description for Proposal 2',
      proposalId: '3',
      proposalTitle: 'This is a very long proposal title that is more than expected',
      rankingType: 'community',
      totalVoteAmount: 50,
    },
  ];

  it('renders list items correctly', () => {
    render(<TrendingList data={mockData} onItemClick={mockOnItemClick} />);

    // Check if the TRENDING title is displayed
    expect(screen.getByText('TRENDING')).toBeInTheDocument();

    // Check rendered proposals
    expect(screen.getByText('Proposal 1')).toBeInTheDocument();
    expect(screen.getByText('Proposal 2')).toBeInTheDocument();

    // Check for image or placeholder
    expect(screen.getAllByAltText('Banner')).toHaveLength(1); // Ensures the banner image renders
    expect(screen.getAllByTestId('vote-icon')).toHaveLength(3); // Ensures the vote icon renders

    // Check placeholder for missing banner
    expect(screen.getAllByTestId('proposal-banner-testid')).toHaveLength(2);
  });

  it('handles item click correctly', () => {
    render(<TrendingList data={mockData} onItemClick={mockOnItemClick} />);

    // Click on the first proposal
    fireEvent.click(screen.getByTestId('1'));
    expect(mockOnItemClick).toHaveBeenCalledWith({
      proposalId: '1',
      proposalTitle: 'Proposal 1',
      isGold: true,
    });

    // Click on the second proposal
    fireEvent.click(screen.getByTestId('2'));
    expect(mockOnItemClick).toHaveBeenCalledWith({
      proposalId: '2',
      proposalTitle: 'Proposal 2',
      isGold: false,
    });
  });

  it('displays skeleton loaders when title or voteAmount is undefined', () => {
    render(<TrendingList data={mockData} onItemClick={mockOnItemClick} />);

    // Check skeleton placeholder for missing proposalTitle and totalVoteAmount
    expect(screen.getAllByTestId('proposal-banner-testid')).toHaveLength(2);
  });

  it('renders placeholder elements when proposalTitle and totalVoteAmount are undefined', () => {
    // Providing data with undefined proposalTitle and totalVoteAmount
    const mockData = [
      {
        active: false,
        activeEndEpochTime: dayjs().subtract(1, 'day').valueOf(),
        activeEndTime: dayjs().subtract(1, 'day').format(),
        activeStartEpochTime: dayjs().subtract(2, 'day').valueOf(),
        activeStartTime: dayjs().subtract(2, 'day').format(),
        bannerUrl: 'https://example.com/banner2.jpg',
        chainId: '1',
        daoId: 'dao2',
        labelType: RANKING_LABEL_KEY.GOLD,
        proposalDescription: 'Description for Proposal 2',
        proposalId: '2',
        rankingType: 'community',
        proposalTitle: undefined,
        totalVoteAmount: undefined,
      },
    ];

    render(<TrendingList data={mockData} onItemClick={mockOnItemClick} />);

    // Check for the presence of placeholder elements
    const placeholderTitleLines = screen.getByTestId('proposal-title-testId');
    expect(placeholderTitleLines.children).toHaveLength(1);

    const placeholderVoteLines = screen.getByTestId('proposal-vote-testId');
    expect(placeholderVoteLines).toBeInTheDocument();
  });
});
