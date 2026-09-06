import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPane } from '@/components/ChatPane';
import { useStore } from '@/store/useStore';
import { vi } from 'vitest';

// Mock the store
vi.mock('@/store/useStore', () => ({
  useStore: () => ({
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn(),
    sessionId: 'test-session',
    connected: true,
    setConnected: vi.fn(),
    setSessionId: vi.fn(),
    files: new Map(),
    setFile: vi.fn(),
    getFile: vi.fn(),
    deleteFile: vi.fn(),
    terminalOutput: '',
    appendTerminalOutput: vi.fn(),
    clearTerminalOutput: vi.fn(),
    previewUrl: '',
    setPreviewUrl: vi.fn(),
    activeLeftTab: 'chat',
    activeRightTab: 'preview',
    setActiveLeftTab: vi.fn(),
    setActiveRightTab: vi.fn(),
  })
}));

describe('ChatPane', () => {
  it('renders without crashing', () => {
    render(<ChatPane />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows send button', () => {
    render(<ChatPane />);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('has message input', () => {
    render(<ChatPane />);
    expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
  });
});

describe('useStore', () => {
  it('provides store interface', () => {
    const store = useStore();
    expect(store).toHaveProperty('addMessage');
    expect(store).toHaveProperty('files');
  });
});