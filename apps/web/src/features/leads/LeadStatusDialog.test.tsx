import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lead } from '@crm/types';
import { LeadStatusDialog } from './LeadStatusDialog';
import { useTransitionLeadStatus } from './useLeads';

vi.mock('./useLeads');
const mockedUseTransitionLeadStatus = vi.mocked(useTransitionLeadStatus);

const LEAD = { id: 'lead-1', status: 'new' } as Lead;

describe('LeadStatusDialog', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn().mockResolvedValue(LEAD);
    mockedUseTransitionLeadStatus.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useTransitionLeadStatus>);
  });

  /** CRM.md section 49: "when a lead is lost, capture a reason" - Save must not be reachable without one. */
  it('requires a reason before saving a transition to Lost, and disables Save until one is chosen', async () => {
    render(<LeadStatusDialog lead={LEAD} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'lost' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByRole('combobox', { name: 'Reason' }), { target: { value: 'price' } });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'lost', lostReason: 'price' }),
      ),
    );
  });

  it('saves a non-lost transition without requiring a reason', async () => {
    render(<LeadStatusDialog lead={LEAD} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'qualified' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'qualified', lostReason: undefined }),
      ),
    );
  });
});
