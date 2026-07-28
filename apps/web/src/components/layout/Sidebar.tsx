import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
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

function sectionContainsPath(section: NavSection, pathname: string): boolean {
  return section.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
}

const NAV_LINK_CLASSES = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]'
      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)] hover:text-[var(--color-text-primary)]',
  );

/** Nine module sections no longer fit comfortably as permanently-expanded lists - each one collapses independently, defaulting open only where the current route already is. */
export function Sidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(SECTIONS.filter((section) => sectionContainsPath(section, location.pathname)).map((s) => s.label)),
  );

  function toggleSection(label: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-4"
    >
      <div className="mb-5 px-2">
        <span className="font-serif text-base font-bold text-[var(--color-text-primary)]">
          CRM
        </span>
      </div>

      <NavLink to={HOME_ITEM.to} className={NAV_LINK_CLASSES}>
        {HOME_ITEM.label}
      </NavLink>

      <div className="my-2 border-t border-[var(--color-border-default)]" />

      {SECTIONS.map((section) => {
        const isOpen = openSections.has(section.label);
        return (
          <div key={section.label}>
            <button
              type="button"
              onClick={() => toggleSection(section.label)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between rounded-[var(--radius-button)] px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {section.label}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isOpen ? 'rotate-90' : '')}
              >
                <path d="M7 5l6 5-6 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isOpen && (
              <ul className="flex flex-col gap-0.5 pb-1">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} className={NAV_LINK_CLASSES}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
