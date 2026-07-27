import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeadSources } from '@/features/lead-sources/useLeadSources';
import { useAssignableUsers } from '@/features/users/useUsers';
import { ApiError } from '@/lib/api/api-error';
import { LeadCreateModal } from './LeadCreateModal';
import { useCreateLead } from './useLeads';

vi.mock('@/features/lead-sources/useLeadSources');
vi.mock('@/features/users/useUsers');
vi.mock('./useLeads');

const mockedUseLeadSources = vi.mocked(useLeadSources);
const mockedUseAssignableUsers = vi.mocked(useAssignableUsers);
const mockedUseCreateLead = vi.mocked(useCreateLead);

const SOURCE = { id: 'source-1', name: 'Website' };
const ASSIGNEE = { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' };

function renderModal(onCreated = vi.fn()) {
  return render(<LeadCreateModal onClose={vi.fn()} onCreated={onCreated} />);
}

describe('LeadCreateModal', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUseLeadSources.mockReturnValue({ data: [SOURCE] } as ReturnType<typeof useLeadSources>);
    mockedUseAssignableUsers.mockReturnValue({
      data: [ASSIGNEE],
    } as ReturnType<typeof useAssignableUsers>);
    mockedUseCreateLead.mockReturnValue({ mutateAsync } as unknown as ReturnType<typeof useCreateLead>);
  });

  /**
   * Regression test: the Source/Assign-to selects used to default to the
   * first async-loaded option while react-hook-form's uncontrolled register()
   * never observed it, so the field silently submitted as undefined despite
   * appearing selected. They are now plain controlled state - this proves an
   * explicit choice is actually captured.
   */
  it('submits the explicitly chosen source and assignee', async () => {
    mutateAsync.mockResolvedValue({ id: 'lead-1' });
    renderModal();

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Rajesh Kumar' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Source' }), { target: { value: SOURCE.id } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Assign to' }), {
      target: { value: ASSIGNEE.id },
    });
    fireEvent.click(screen.getByRole('button', { name: /create lead/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sourceId: SOURCE.id, assignedTo: ASSIGNEE.id }),
      ),
    );
  });

  it('omits source and assignee when the user never chooses one', async () => {
    mutateAsync.mockResolvedValue({ id: 'lead-1' });
    renderModal();

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Rajesh Kumar' } });
    fireEvent.click(screen.getByRole('button', { name: /create lead/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sourceId: undefined, assignedTo: undefined }),
      ),
    );
  });

  it('shows a validation error and does not submit when the name is empty', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /create lead/i }));

    expect(await screen.findByText('Enter a name.')).toBeVisible();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  /** CRM.md section 45: a blocked duplicate must have a real way past it, not just a message. */
  it('offers "Create anyway" when the backend reports a duplicate, and resubmits with the override', async () => {
    mutateAsync
      .mockRejectedValueOnce(
        new ApiError({
          code: 'DUPLICATE_RESOURCE',
          message: 'A lead for Rajesh Kumar already exists with a matching phone or email.',
          status: 409,
        }),
      )
      .mockResolvedValueOnce({ id: 'lead-1' });
    renderModal();

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Rajesh Kumar' } });
    fireEvent.click(screen.getByRole('button', { name: /create lead/i }));

    expect(await screen.findByText(/already exists/i)).toBeVisible();
    const createAnyway = screen.getByRole('button', { name: /create anyway/i });

    fireEvent.click(createAnyway);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenLastCalledWith(expect.objectContaining({ confirmDuplicate: true })),
    );
  });
});
