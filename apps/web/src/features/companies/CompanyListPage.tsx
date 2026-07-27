import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { TextField } from '@/components/common/TextField';
import { CompanyCreateModal } from './CompanyCreateModal';
import { companyTypeLabel } from './labels';
import { useCompaniesList } from './useCompanies';

/** CRM.md sections 54-55, UX.md section 30: accounts/dealers/customers/suppliers. */
export function CompanyListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError } = useCompaniesList({ page, pageSize: 25, search: search || undefined });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Companies</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Dealers, distributors, retailers, and other business accounts.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Company</Button>
      </div>

      <div className="mb-4 w-64">
        <TextField
          label="Search"
          placeholder="Name, GSTIN, phone"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load companies. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search ? 'No companies match this search.' : 'No companies yet'}
          description={search ? 'Clear the search and try again.' : 'Add your first company to start tracking accounts.'}
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Company</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Relationship</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{company.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{companyTypeLabel(company.companyType)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{company.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      {company.isCustomer && <Badge tone="info">Customer</Badge>}
                      {company.isSupplier && <Badge tone="neutral" className="ml-1">Supplier</Badge>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} companies)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <CompanyCreateModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(company) => {
            setIsCreateOpen(false);
            navigate(`/companies/${company.id}`);
          }}
        />
      )}
    </div>
  );
}
