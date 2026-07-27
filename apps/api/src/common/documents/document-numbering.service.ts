import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { DocumentType, Prisma } from '@prisma/client';
import { financialYearFor } from './financial-year';

type TransactionClient = Prisma.TransactionClient;

/**
 * Generates document numbers (DATABASE.md sections 79-81), e.g.
 * "QT/2026-27/000001". No Branch entity exists yet, so `location_code`
 * stays empty (the schema's own default) rather than inventing a segment.
 *
 * Must be called from inside the same `$transaction` as the document it
 * numbers, and takes that transaction's client rather than owning one -
 * a rollback of the surrounding create then also rolls back the increment,
 * so numbers are never silently wasted by a failed creation.
 *
 * Concurrency-safety comes from the atomic `UPDATE ... RETURNING`, not a
 * read-then-write - two concurrent callers serialize on the row lock the
 * first UPDATE takes, exactly like the guarded stock updates in the
 * Inventory module (DATABASE.md section 80: never `COUNT(*) + 1`).
 */
@Injectable()
export class DocumentNumberingService {
  async next(tx: TransactionClient, documentType: DocumentType, prefix: string): Promise<string> {
    const financialYear = financialYearFor(new Date());
    const locationCode = '';

    await tx.documentSequence.upsert({
      where: { documentType_financialYear_locationCode: { documentType, financialYear, locationCode } },
      create: { id: randomUUID(), documentType, prefix, financialYear, locationCode },
      update: {},
    });

    const rows = await tx.$queryRaw<{ currentNumber: number; prefix: string; padding: number }[]>`
      UPDATE document_sequences
      SET current_number = current_number + 1, updated_at = now()
      WHERE document_type = ${documentType}::document_type
        AND financial_year = ${financialYear}
        AND location_code = ${locationCode}
      RETURNING current_number AS "currentNumber", prefix, padding
    `;
    const [row] = rows;
    const serial = String(row.currentNumber).padStart(row.padding, '0');
    return `${row.prefix}/${financialYear}/${serial}`;
  }
}
