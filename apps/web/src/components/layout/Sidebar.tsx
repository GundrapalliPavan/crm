import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Primary navigation (UX.md sections 13-15). Only built modules are listed -
 * Settings does not exist yet, and section 13 explicitly warns against
 * padding navigation out to look comprehensive before the modules behind it
 * exist.
 */
const HOME_ITEM: NavItem = { to: '/dashboard', label: 'Dashboard' };

const SECTIONS: NavSection[] = [
  {
    label: 'CRM',
    items: [
      { to: '/leads', label: 'Leads' },
      { to: '/contacts', label: 'Contacts' },
      { to: '/companies', label: 'Companies' },
      { to: '/follow-ups', label: 'Follow-ups' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', label: 'Products' },
      { to: '/categories', label: 'Categories' },
      { to: '/brands', label: 'Brands' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/inventory', label: 'Stock' },
      { to: '/stock-movements', label: 'Movements' },
      { to: '/warehouses', label: 'Warehouses' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/opportunities', label: 'Opportunities' },
      { to: '/quotations', label: 'Quotations' },
      { to: '/sales-orders', label: 'Sales Orders' },
    ],
  },
  {
    label: 'Purchase',
    items: [
      { to: '/purchase-orders', label: 'Purchase Orders' },
      { to: '/goods-receipts', label: 'Goods Receipts' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: '/invoices', label: 'Invoices' },
      { to: '/payments', label: 'Payments' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/reports/leads', label: 'Leads' },
      { to: '/reports/sales', label: 'Sales' },
      { to: '/reports/inventory', label: 'Inventory' },
      { to: '/reports/purchases', label: 'Purchase' },
      { to: '/reports/billing', label: 'Billing' },
      { to: '/reports/outstanding', label: 'Outstanding' },
      { to: '/reports/team-performance', label: 'Team Performance' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/communications', label: 'History' },
      { to: '/communication-templates', label: 'Templates' },
    ],
  },
  {
    label: 'Team',
    items: [{ to: '/teams', label: 'Teams' }],
  },
];

export function Sidebar() {
  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-56 shrink-0 flex-col gap-6 border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-4"
    >
      <div className="px-2">
        <span className="font-serif text-base font-bold text-[var(--color-text-primary)]">
          CRM
        </span>
      </div>

      <NavLink
        to={HOME_ITEM.to}
        className={({ isActive }) =>
          cn(
            'block rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)] hover:text-[var(--color-text-primary)]',
          )
        }
      >
        {HOME_ITEM.label}
      </NavLink>

      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)] hover:text-[var(--color-text-primary)]',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
