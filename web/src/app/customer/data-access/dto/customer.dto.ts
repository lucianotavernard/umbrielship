export type CustomerDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    address: string;
    city: string;
    state: string;
  };
};

export type CustomerResponseDto = {
  customer: CustomerDto;
};

export type CustomersResponseDto = {
  customers: CustomerDto[];
  total: number;
};
