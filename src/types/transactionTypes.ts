export interface Transaction {
  id: string;
  transactionCode: string;
  title: string;
  status: string;
  clientId: string;
  transactionTypeId?: string;
  description?: string;
  priority?: string;
  createdAt: string;
  // أضف أي حقول أخرى تحتاجها
  tasks?: any[];
  staff?: any[];
}

export interface NewTransactionData {
  title: string;
  clientId: string;
  type?: string;
  priority?: string;
  description?: string;
}

export interface TransactionType {
  id: string;
  name: string;
  tasks?: any[];
  documents?: string[];
}

export interface Employee {
  id: string;
  name: string;
  position: string;
}