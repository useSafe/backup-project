export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    contractDate?: string;  // ISO date string e.g. "2024-03-15"
    createdAt?: string;
    updatedAt?: string;
}
