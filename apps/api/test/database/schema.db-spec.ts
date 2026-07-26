import { Prisma } from '@prisma/client';
import { createCustomer, createProduct, createUser, resetDatabase, testPrisma } from './helpers';

/**
 * Verifies the guarantees the database itself must provide.
 *
 * These assert integrity that application code cannot be trusted to uphold
 * under concurrency - constraints, delete behaviour and numeric precision.
 */
describe('database schema', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe('referential integrity', () => {
    it('rejects a lead referencing a user that does not exist', async () => {
      await expect(
        testPrisma.lead.create({
          data: {
            firstName: 'Ghost',
            assignedTo: '00000000-0000-0000-0000-000000000000',
          },
        }),
      ).rejects.toThrow();
    });

    it('rejects a quotation item without its parent quotation', async () => {
      const product = await createProduct('SKU-ORPHAN');

      await expect(
        testPrisma.quotationItem.create({
          data: {
            quotationId: '00000000-0000-0000-0000-000000000000',
            productId: product.id,
            skuSnapshot: product.sku,
            productNameSnapshot: product.name,
            unitSnapshot: 'pcs',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(100),
            lineTotal: new Prisma.Decimal(100),
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('unique constraints', () => {
    it('enforces a unique product SKU', async () => {
      await createProduct('FAN-REN-1200-WHT');

      await expect(createProduct('FAN-REN-1200-WHT', 'Duplicate')).rejects.toThrow();
    });

    it('enforces a unique invoice number', async () => {
      const customer = await createCustomer();
      const invoiceData = {
        customerCompanyId: customer.id,
        invoiceDate: new Date('2026-07-26'),
        customerNameSnapshot: customer.name,
      };

      await testPrisma.invoice.create({
        data: { ...invoiceData, invoiceNumber: 'INV/HYD/2026-27/000001' },
      });

      await expect(
        testPrisma.invoice.create({
          data: { ...invoiceData, invoiceNumber: 'INV/HYD/2026-27/000001' },
        }),
      ).rejects.toThrow();
    });

    it('enforces a unique user email', async () => {
      await createUser('rahul@example.com');

      await expect(createUser('rahul@example.com')).rejects.toThrow();
    });

    it('scopes document sequences by type, financial year and location', async () => {
      await testPrisma.documentSequence.create({
        data: {
          documentType: 'invoice',
          prefix: 'INV',
          financialYear: '2026-27',
          locationCode: 'HYD',
        },
      });

      // Same type and year at a different location is a separate counter.
      await expect(
        testPrisma.documentSequence.create({
          data: {
            documentType: 'invoice',
            prefix: 'INV',
            financialYear: '2026-27',
            locationCode: 'BLR',
          },
        }),
      ).resolves.toBeDefined();

      // The same counter twice must not be possible.
      await expect(
        testPrisma.documentSequence.create({
          data: {
            documentType: 'invoice',
            prefix: 'INV',
            financialYear: '2026-27',
            locationCode: 'HYD',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('check constraints', () => {
    it('requires a follow-up to reference at least one CRM entity', async () => {
      const user = await createUser('owner@example.com');

      await expect(
        testPrisma.followUp.create({
          data: {
            assignedTo: user.id,
            followUpType: 'call',
            scheduledAt: new Date(),
          },
        }),
      ).rejects.toThrow();
    });

    it('requires an address to have exactly one owner', async () => {
      const company = await createCustomer();
      const contact = await testPrisma.contact.create({
        data: { firstName: 'Amit', companyId: company.id },
      });

      // Two owners at once is invalid.
      await expect(
        testPrisma.address.create({
          data: {
            companyId: company.id,
            contactId: contact.id,
            addressType: 'billing',
            line1: '1 Test Road',
            city: 'Hyderabad',
            state: 'Telangana',
          },
        }),
      ).rejects.toThrow();

      // No owner at all is equally invalid.
      await expect(
        testPrisma.address.create({
          data: {
            addressType: 'billing',
            line1: '1 Test Road',
            city: 'Hyderabad',
            state: 'Telangana',
          },
        }),
      ).rejects.toThrow();
    });

    it('rejects a stock movement with a zero quantity delta', async () => {
      const product = await createProduct('SKU-ZERO');
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH1', name: 'Main' },
      });

      await expect(
        testPrisma.stockMovement.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            movementType: 'adjustment_in',
            quantityDelta: new Prisma.Decimal(0),
          },
        }),
      ).rejects.toThrow();
    });

    it('rejects a non-positive payment allocation', async () => {
      const customer = await createCustomer();
      const invoice = await testPrisma.invoice.create({
        data: {
          invoiceNumber: 'INV/HYD/2026-27/000010',
          customerCompanyId: customer.id,
          invoiceDate: new Date('2026-07-26'),
          customerNameSnapshot: customer.name,
        },
      });
      const payment = await testPrisma.payment.create({
        data: {
          paymentNumber: 'PAY/2026-27/000010',
          customerCompanyId: customer.id,
          paymentDate: new Date('2026-07-26'),
          amount: new Prisma.Decimal('1000.00'),
          paymentMethod: 'upi',
        },
      });

      await expect(
        testPrisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            allocatedAmount: new Prisma.Decimal('0.00'),
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('numeric precision', () => {
    it('stores INR amounts without floating-point drift', async () => {
      const customer = await createCustomer();

      const invoice = await testPrisma.invoice.create({
        data: {
          invoiceNumber: 'INV/HYD/2026-27/000002',
          customerCompanyId: customer.id,
          invoiceDate: new Date('2026-07-26'),
          customerNameSnapshot: customer.name,
          subtotal: new Prisma.Decimal('125000.00'),
          taxAmount: new Prisma.Decimal('999.99'),
          totalAmount: new Prisma.Decimal('125999.99'),
          paidAmount: new Prisma.Decimal('0.01'),
        },
      });

      const stored = await testPrisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } });

      expect(stored.subtotal.toFixed(2)).toBe('125000.00');
      expect(stored.taxAmount.toFixed(2)).toBe('999.99');
      expect(stored.totalAmount.toFixed(2)).toBe('125999.99');
      expect(stored.paidAmount.toFixed(2)).toBe('0.01');
    });

    it('preserves the classic 0.1 + 0.2 case exactly', async () => {
      const customer = await createCustomer();

      const payment = await testPrisma.payment.create({
        data: {
          paymentNumber: 'PAY/2026-27/000001',
          customerCompanyId: customer.id,
          paymentDate: new Date('2026-07-26'),
          amount: new Prisma.Decimal('0.30'),
          paymentMethod: 'cash',
        },
      });

      const stored = await testPrisma.payment.findUniqueOrThrow({ where: { id: payment.id } });

      const sum = new Prisma.Decimal('0.10').plus(new Prisma.Decimal('0.20'));
      expect(stored.amount.equals(sum)).toBe(true);
      expect(stored.amount.toFixed(2)).toBe('0.30');
    });

    it('stores fractional quantities for goods sold by length', async () => {
      const product = await createProduct('WIRE-1.5SQMM');
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH2', name: 'Wire Store' },
      });

      await testPrisma.inventoryBalance.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          onHandQuantity: new Prisma.Decimal('125.750'),
        },
      });

      const balance = await testPrisma.inventoryBalance.findUniqueOrThrow({
        where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
      });

      expect(balance.onHandQuantity.toFixed(3)).toBe('125.750');
    });

    it('stores tax and discount percentages exactly', async () => {
      const product = await createProduct('SKU-TAX', 'Taxed Product');

      const stored = await testPrisma.product.update({
        where: { id: product.id },
        data: { taxRate: new Prisma.Decimal('18.00') },
      });

      expect(stored.taxRate.toFixed(2)).toBe('18.00');
    });
  });

  describe('relationships', () => {
    it('links a sales order back to its source quotation', async () => {
      const customer = await createCustomer();
      const quotation = await testPrisma.quotation.create({
        data: {
          quotationNumber: 'QT/HYD/2026-27/000001',
          customerCompanyId: customer.id,
          quotationDate: new Date('2026-07-26'),
        },
      });

      const salesOrder = await testPrisma.salesOrder.create({
        data: {
          salesOrderNumber: 'SO/HYD/2026-27/000001',
          quotationId: quotation.id,
          customerCompanyId: customer.id,
          orderDate: new Date('2026-07-27'),
        },
      });

      const withOrders = await testPrisma.quotation.findUniqueOrThrow({
        where: { id: quotation.id },
        include: { salesOrders: true },
      });

      expect(withOrders.salesOrders).toHaveLength(1);
      expect(withOrders.salesOrders[0].id).toBe(salesOrder.id);
    });

    it('allows several goods receipts against one purchase order', async () => {
      const supplier = await testPrisma.company.create({
        data: { name: 'Supplier Co', isSupplier: true },
      });
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH3', name: 'Receiving' },
      });
      const product = await createProduct('SKU-PARTIAL');

      const purchaseOrder = await testPrisma.purchaseOrder.create({
        data: {
          poNumber: 'PO/HYD/2026-27/000001',
          supplierCompanyId: supplier.id,
          poDate: new Date('2026-07-01'),
          items: {
            create: {
              productId: product.id,
              skuSnapshot: product.sku,
              productNameSnapshot: product.name,
              unitSnapshot: 'pcs',
              orderedQuantity: new Prisma.Decimal('100.000'),
              unitPrice: new Prisma.Decimal('850.0000'),
              lineTotal: new Prisma.Decimal('85000.00'),
            },
          },
        },
        include: { items: true },
      });

      // Partial delivery: 40 now, 60 later.
      for (const [index, quantity] of [['40.000'], ['60.000']].entries()) {
        await testPrisma.goodsReceipt.create({
          data: {
            receiptNumber: `GR/HYD/2026-27/00000${index + 1}`,
            purchaseOrderId: purchaseOrder.id,
            warehouseId: warehouse.id,
            receiptDate: new Date('2026-07-10'),
            items: {
              create: {
                purchaseOrderItemId: purchaseOrder.items[0].id,
                productId: product.id,
                quantityReceived: new Prisma.Decimal(quantity[0]),
                acceptedQuantity: new Prisma.Decimal(quantity[0]),
              },
            },
          },
        });
      }

      const stored = await testPrisma.purchaseOrder.findUniqueOrThrow({
        where: { id: purchaseOrder.id },
        include: { goodsReceipts: { include: { items: true } } },
      });

      expect(stored.goodsReceipts).toHaveLength(2);
      expect(stored.goodsReceipts[0].items[0].quantityReceived.toFixed(3)).toBe('40.000');
      expect(stored.goodsReceipts[1].items[0].quantityReceived.toFixed(3)).toBe('60.000');
    });

    it('rejects a goods receipt line whose accepted and rejected do not sum to received', async () => {
      const supplier = await testPrisma.company.create({
        data: { name: 'Supplier Split', isSupplier: true },
      });
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH4', name: 'QC' },
      });
      const product = await createProduct('SKU-SPLIT');
      const purchaseOrder = await testPrisma.purchaseOrder.create({
        data: {
          poNumber: 'PO/HYD/2026-27/000002',
          supplierCompanyId: supplier.id,
          poDate: new Date('2026-07-01'),
          items: {
            create: {
              productId: product.id,
              skuSnapshot: product.sku,
              productNameSnapshot: product.name,
              unitSnapshot: 'pcs',
              orderedQuantity: new Prisma.Decimal('10.000'),
              unitPrice: new Prisma.Decimal('100.0000'),
              lineTotal: new Prisma.Decimal('1000.00'),
            },
          },
        },
        include: { items: true },
      });

      await expect(
        testPrisma.goodsReceipt.create({
          data: {
            receiptNumber: 'GR/HYD/2026-27/000099',
            purchaseOrderId: purchaseOrder.id,
            warehouseId: warehouse.id,
            receiptDate: new Date('2026-07-10'),
            items: {
              create: {
                purchaseOrderItemId: purchaseOrder.items[0].id,
                productId: product.id,
                quantityReceived: new Prisma.Decimal('10.000'),
                acceptedQuantity: new Prisma.Decimal('7.000'),
                rejectedQuantity: new Prisma.Decimal('1.000'),
              },
            },
          },
        }),
      ).rejects.toThrow();
    });

    it('allocates one payment across several invoices', async () => {
      const customer = await createCustomer();
      const makeInvoice = (suffix: string, total: string) =>
        testPrisma.invoice.create({
          data: {
            invoiceNumber: `INV/HYD/2026-27/${suffix}`,
            customerCompanyId: customer.id,
            invoiceDate: new Date('2026-07-26'),
            customerNameSnapshot: customer.name,
            totalAmount: new Prisma.Decimal(total),
          },
        });

      const invoiceA = await makeInvoice('000101', '60000.00');
      const invoiceB = await makeInvoice('000102', '40000.00');

      const payment = await testPrisma.payment.create({
        data: {
          paymentNumber: 'PAY/2026-27/000101',
          customerCompanyId: customer.id,
          paymentDate: new Date('2026-07-26'),
          amount: new Prisma.Decimal('100000.00'),
          paymentMethod: 'bank_transfer',
          allocations: {
            create: [
              { invoiceId: invoiceA.id, allocatedAmount: new Prisma.Decimal('60000.00') },
              { invoiceId: invoiceB.id, allocatedAmount: new Prisma.Decimal('40000.00') },
            ],
          },
        },
        include: { allocations: true },
      });

      expect(payment.allocations).toHaveLength(2);

      const total = payment.allocations.reduce(
        (sum, allocation) => sum.plus(allocation.allocatedAmount),
        new Prisma.Decimal(0),
      );
      expect(total.toFixed(2)).toBe('100000.00');
    });

    it('allocates several payments to one invoice', async () => {
      const customer = await createCustomer();
      const invoice = await testPrisma.invoice.create({
        data: {
          invoiceNumber: 'INV/HYD/2026-27/000201',
          customerCompanyId: customer.id,
          invoiceDate: new Date('2026-07-26'),
          customerNameSnapshot: customer.name,
          totalAmount: new Prisma.Decimal('40000.00'),
        },
      });

      for (const [index, amount] of ['25000.00', '15000.00'].entries()) {
        await testPrisma.payment.create({
          data: {
            paymentNumber: `PAY/2026-27/00020${index + 1}`,
            customerCompanyId: customer.id,
            paymentDate: new Date('2026-07-26'),
            amount: new Prisma.Decimal(amount),
            paymentMethod: 'cheque',
            allocations: {
              create: { invoiceId: invoice.id, allocatedAmount: new Prisma.Decimal(amount) },
            },
          },
        });
      }

      const stored = await testPrisma.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
        include: { allocations: true },
      });

      expect(stored.allocations).toHaveLength(2);
    });

    it('prevents the same payment being allocated to one invoice twice', async () => {
      const customer = await createCustomer();
      const invoice = await testPrisma.invoice.create({
        data: {
          invoiceNumber: 'INV/HYD/2026-27/000301',
          customerCompanyId: customer.id,
          invoiceDate: new Date('2026-07-26'),
          customerNameSnapshot: customer.name,
        },
      });
      const payment = await testPrisma.payment.create({
        data: {
          paymentNumber: 'PAY/2026-27/000301',
          customerCompanyId: customer.id,
          paymentDate: new Date('2026-07-26'),
          amount: new Prisma.Decimal('5000.00'),
          paymentMethod: 'upi',
        },
      });

      await testPrisma.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          allocatedAmount: new Prisma.Decimal('2000.00'),
        },
      });

      await expect(
        testPrisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            allocatedAmount: new Prisma.Decimal('3000.00'),
          },
        }),
      ).rejects.toThrow();
    });

    it('links stock movements to their product and warehouse', async () => {
      const product = await createProduct('SKU-MOVE');
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH5', name: 'Ledger' },
      });

      await testPrisma.stockMovement.createMany({
        data: [
          {
            productId: product.id,
            warehouseId: warehouse.id,
            movementType: 'purchase_receipt',
            quantityDelta: new Prisma.Decimal('50.000'),
          },
          {
            productId: product.id,
            warehouseId: warehouse.id,
            movementType: 'sales_issue',
            quantityDelta: new Prisma.Decimal('-10.000'),
          },
        ],
      });

      const movements = await testPrisma.stockMovement.findMany({
        where: { productId: product.id },
      });

      expect(movements).toHaveLength(2);

      // The signed convention means net stock is a plain sum.
      const net = movements.reduce(
        (sum, movement) => sum.plus(movement.quantityDelta),
        new Prisma.Decimal(0),
      );
      expect(net.toFixed(3)).toBe('40.000');
    });
  });

  describe('delete behaviour', () => {
    it('refuses to delete a customer that has invoices', async () => {
      const customer = await createCustomer('Protected Customer');
      await testPrisma.invoice.create({
        data: {
          invoiceNumber: 'INV/HYD/2026-27/000401',
          customerCompanyId: customer.id,
          invoiceDate: new Date('2026-07-26'),
          customerNameSnapshot: customer.name,
        },
      });

      await expect(testPrisma.company.delete({ where: { id: customer.id } })).rejects.toThrow();

      // The financial history must still be intact after the refused delete.
      expect(await testPrisma.invoice.count()).toBe(1);
    });

    it('refuses to delete a product that has stock history', async () => {
      const product = await createProduct('SKU-PROTECTED');
      const warehouse = await testPrisma.warehouse.create({
        data: { code: 'WH6', name: 'History' },
      });
      await testPrisma.stockMovement.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          movementType: 'opening',
          quantityDelta: new Prisma.Decimal('5.000'),
        },
      });

      await expect(testPrisma.product.delete({ where: { id: product.id } })).rejects.toThrow();
    });

    it('removes owned line items with their parent quotation', async () => {
      const customer = await createCustomer();
      const product = await createProduct('SKU-CASCADE');
      const quotation = await testPrisma.quotation.create({
        data: {
          quotationNumber: 'QT/HYD/2026-27/000900',
          customerCompanyId: customer.id,
          quotationDate: new Date('2026-07-26'),
          items: {
            create: {
              productId: product.id,
              skuSnapshot: product.sku,
              productNameSnapshot: product.name,
              unitSnapshot: 'pcs',
              quantity: new Prisma.Decimal('2.000'),
              unitPrice: new Prisma.Decimal('2500.0000'),
              lineTotal: new Prisma.Decimal('5000.00'),
            },
          },
        },
      });

      await testPrisma.quotation.delete({ where: { id: quotation.id } });

      expect(await testPrisma.quotationItem.count()).toBe(0);
      // The product itself is untouched by the cascade.
      expect(await testPrisma.product.count()).toBe(1);
    });

    it('keeps audit history when the acting user is deleted', async () => {
      const user = await createUser('actor@example.com');
      await testPrisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'invoice.issue',
          entityType: 'invoice',
          requestId: 'req_test',
        },
      });

      await testPrisma.user.delete({ where: { id: user.id } });

      const logs = await testPrisma.auditLog.findMany();
      expect(logs).toHaveLength(1);
      expect(logs[0].actorUserId).toBeNull();
      expect(logs[0].action).toBe('invoice.issue');
    });
  });
});
