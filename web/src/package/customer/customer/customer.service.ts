import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: {
    address: string;
    city: string;
    state: string;
  };
};

export type CreateCustomerRequest = Omit<Customer, 'id'>;

export type GetCustomersResponse = {
  customers: Customer[];
  total: number;
};

export type GetCustomerResponse = {
  customer: Customer;
};

@Service()
export class CustomerService {
  private readonly http = inject(HttpClient);

  createCustomer(request: CreateCustomerRequest): Observable<GetCustomerResponse> {
    return this.http.post<GetCustomerResponse>('/api/customers', request);
  }
}
