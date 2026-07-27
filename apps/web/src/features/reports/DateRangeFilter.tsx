import { TextField } from '@/components/common/TextField';

export interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (range: { dateFrom: string; dateTo: string }) => void;
}

/** REPORTS.md section 9: defaults to the trailing 30 days server-side when both are left blank. */
export function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <TextField
          label="From"
          type="date"
          value={dateFrom}
          onChange={(event) => onChange({ dateFrom: event.target.value, dateTo })}
        />
      </div>
      <div className="w-44">
        <TextField
          label="To"
          type="date"
          value={dateTo}
          onChange={(event) => onChange({ dateFrom, dateTo: event.target.value })}
        />
      </div>
    </div>
  );
}
