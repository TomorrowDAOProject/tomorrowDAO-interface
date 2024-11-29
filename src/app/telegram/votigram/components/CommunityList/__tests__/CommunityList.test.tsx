import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CommunityList from '../index'; // Adjust the import path as necessary
import dayjs from 'dayjs';

import { RANKING_LABEL_KEY } from 'constants/ranking';

// Mock SVG components
vi.mock('assets/icons/vote.svg', () => ({
  ReactComponent: () => <svg data-testid="vote-icon" />,
}));
vi.mock('assets/icons/add.svg', () => ({
  ReactComponent: () => <svg data-testid="add-icon" />,
}));
vi.mock('assets/icons/chevron-right.svg', () => ({
  ReactComponent: () => <svg data-testid="chevron-icon" />,
}));

// Mock the RANKING_LABEL_KEY
vi.mock('constants/ranking', () => ({
  RANKING_LABEL_KEY: {
    GOLD: 'gold',
    SILVER: 'silver',
    BRONZE: 'bronze',
  },
}));

// Sample mock data for testing
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
    bannerUrl: 'https://example.com/banner2.jpg',
    chainId: '1',
    daoId: 'dao2',
    labelType: RANKING_LABEL_KEY.GOLD,
    proposalDescription: 'Description for Proposal 2',
    proposalId: '2',
    proposalTitle: 'Proposal 2',
    rankingType: 'community',
    totalVoteAmount: 50,
  },
];

const mockOnItemClick = vi.fn();
const mockHandleCreateVote = vi.fn();

describe('CommunityList component', () => {
  it('renders list items correctly', () => {
    render(
      <CommunityList
        data={mockData}
        onItemClick={mockOnItemClick}
        handleCreateVote={mockHandleCreateVote}
        hasMoreCommunity={true}
      />,
    );

    expect(screen.getByText(/COMMUNITY/i)).toBeInTheDocument();
    expect(screen.getByText('Proposal 1')).toBeInTheDocument();
    expect(screen.getByText('Proposal 2')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('calls onItemClick with correct parameters when a list item is clicked', () => {
    render(
      <CommunityList
        data={mockData}
        onItemClick={mockOnItemClick}
        handleCreateVote={mockHandleCreateVote}
        hasMoreCommunity={true}
      />,
    );

    fireEvent.click(screen.getByText('Proposal 1'));
    expect(mockOnItemClick).toHaveBeenCalledWith({
      proposalId: '1',
      proposalTitle: 'Proposal 1',
      isGold: true,
    });
  });

  it('displays "Expired" label for expired proposals', () => {
    render(
      <CommunityList
        data={mockData}
        onItemClick={mockOnItemClick}
        handleCreateVote={mockHandleCreateVote}
        hasMoreCommunity={true}
      />,
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('calls handleCreateVote when the "Create Poll" button is clicked', () => {
    render(
      <CommunityList
        data={mockData}
        onItemClick={mockOnItemClick}
        handleCreateVote={mockHandleCreateVote}
        hasMoreCommunity={true}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Create Poll/i }));
    expect(mockHandleCreateVote).toHaveBeenCalled();
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

    render(
      <CommunityList
        data={mockData}
        onItemClick={mockOnItemClick}
        handleCreateVote={mockHandleCreateVote}
        hasMoreCommunity={false}
      />,
    );

    // Check for the presence of placeholder elements
    const placeholderTitleLines = screen.getByTestId('proposal-title-testId');
    expect(placeholderTitleLines.children).toHaveLength(2);

    const placeholderVoteLines = screen.getByTestId('proposal-vote-testId');
    expect(placeholderVoteLines).toBeInTheDocument();
  });
});
