import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewCustomerData {
  customer_insert: Customer_Key;
}

export interface CreateNewCustomerVariables {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  identification?: string | null;
}

export interface Customer_Key {
  id: UUIDString;
  __typename?: 'Customer_Key';
}

export interface GetLoanDetailsData {
  loan?: {
    id: UUIDString;
    loanAmount: number;
    interestRate: number;
    dueDate: DateString;
    startDate: DateString;
    status: string;
    principalAmountPaid?: number | null;
    interestAmountPaid?: number | null;
    outstandingBalance?: number | null;
    customer: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email?: string | null;
    };
      item: {
        name: string;
        description: string;
        appraisalValue: number;
        serialNumber?: string | null;
      };
  } & Loan_Key;
}

export interface GetLoanDetailsVariables {
  loanId: UUIDString;
}

export interface Item_Key {
  id: UUIDString;
  __typename?: 'Item_Key';
}

export interface ListAllPawnedItemsData {
  items: ({
    id: UUIDString;
    name: string;
    description: string;
    appraisalValue: number;
    status: string;
    category?: string | null;
    serialNumber?: string | null;
    condition?: string | null;
    customer?: {
      firstName: string;
      lastName: string;
    };
  } & Item_Key)[];
}

export interface Loan_Key {
  id: UUIDString;
  __typename?: 'Loan_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface UpdateItemStatusData {
  item_update?: Item_Key | null;
}

export interface UpdateItemStatusVariables {
  itemId: UUIDString;
  newStatus: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllPawnedItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllPawnedItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllPawnedItemsData, undefined>;
  operationName: string;
}
export const listAllPawnedItemsRef: ListAllPawnedItemsRef;

export function listAllPawnedItems(options?: ExecuteQueryOptions): QueryPromise<ListAllPawnedItemsData, undefined>;
export function listAllPawnedItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllPawnedItemsData, undefined>;

interface CreateNewCustomerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
  operationName: string;
}
export const createNewCustomerRef: CreateNewCustomerRef;

export function createNewCustomer(vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;
export function createNewCustomer(dc: DataConnect, vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;

interface GetLoanDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
  operationName: string;
}
export const getLoanDetailsRef: GetLoanDetailsRef;

export function getLoanDetails(vars: GetLoanDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;
export function getLoanDetails(dc: DataConnect, vars: GetLoanDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

interface UpdateItemStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
  operationName: string;
}
export const updateItemStatusRef: UpdateItemStatusRef;

export function updateItemStatus(vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;
export function updateItemStatus(dc: DataConnect, vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

