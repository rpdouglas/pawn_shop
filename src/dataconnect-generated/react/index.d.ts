import { ListAllPawnedItemsData, CreateNewCustomerData, CreateNewCustomerVariables, GetLoanDetailsData, GetLoanDetailsVariables, UpdateItemStatusData, UpdateItemStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllPawnedItems(options?: useDataConnectQueryOptions<ListAllPawnedItemsData>): UseDataConnectQueryResult<ListAllPawnedItemsData, undefined>;
export function useListAllPawnedItems(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllPawnedItemsData>): UseDataConnectQueryResult<ListAllPawnedItemsData, undefined>;

export function useCreateNewCustomer(options?: useDataConnectMutationOptions<CreateNewCustomerData, FirebaseError, CreateNewCustomerVariables>): UseDataConnectMutationResult<CreateNewCustomerData, CreateNewCustomerVariables>;
export function useCreateNewCustomer(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewCustomerData, FirebaseError, CreateNewCustomerVariables>): UseDataConnectMutationResult<CreateNewCustomerData, CreateNewCustomerVariables>;

export function useGetLoanDetails(vars: GetLoanDetailsVariables, options?: useDataConnectQueryOptions<GetLoanDetailsData>): UseDataConnectQueryResult<GetLoanDetailsData, GetLoanDetailsVariables>;
export function useGetLoanDetails(dc: DataConnect, vars: GetLoanDetailsVariables, options?: useDataConnectQueryOptions<GetLoanDetailsData>): UseDataConnectQueryResult<GetLoanDetailsData, GetLoanDetailsVariables>;

export function useUpdateItemStatus(options?: useDataConnectMutationOptions<UpdateItemStatusData, FirebaseError, UpdateItemStatusVariables>): UseDataConnectMutationResult<UpdateItemStatusData, UpdateItemStatusVariables>;
export function useUpdateItemStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateItemStatusData, FirebaseError, UpdateItemStatusVariables>): UseDataConnectMutationResult<UpdateItemStatusData, UpdateItemStatusVariables>;
