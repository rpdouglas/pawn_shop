# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllPawnedItems*](#listallpawneditems)
  - [*GetLoanDetails*](#getloandetails)
- [**Mutations**](#mutations)
  - [*CreateNewCustomer*](#createnewcustomer)
  - [*UpdateItemStatus*](#updateitemstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllPawnedItems
You can execute the `ListAllPawnedItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllPawnedItems(options?: ExecuteQueryOptions): QueryPromise<ListAllPawnedItemsData, undefined>;

interface ListAllPawnedItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllPawnedItemsData, undefined>;
}
export const listAllPawnedItemsRef: ListAllPawnedItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllPawnedItems(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllPawnedItemsData, undefined>;

interface ListAllPawnedItemsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllPawnedItemsData, undefined>;
}
export const listAllPawnedItemsRef: ListAllPawnedItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllPawnedItemsRef:
```typescript
const name = listAllPawnedItemsRef.operationName;
console.log(name);
```

### Variables
The `ListAllPawnedItems` query has no variables.
### Return Type
Recall that executing the `ListAllPawnedItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllPawnedItemsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllPawnedItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllPawnedItems } from '@dataconnect/generated';


// Call the `listAllPawnedItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllPawnedItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllPawnedItems(dataConnect);

console.log(data.items);

// Or, you can use the `Promise` API.
listAllPawnedItems().then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `ListAllPawnedItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllPawnedItemsRef } from '@dataconnect/generated';


// Call the `listAllPawnedItemsRef()` function to get a reference to the query.
const ref = listAllPawnedItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllPawnedItemsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

## GetLoanDetails
You can execute the `GetLoanDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLoanDetails(vars: GetLoanDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

interface GetLoanDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
}
export const getLoanDetailsRef: GetLoanDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoanDetails(dc: DataConnect, vars: GetLoanDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

interface GetLoanDetailsRef {
  ...
  (dc: DataConnect, vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
}
export const getLoanDetailsRef: GetLoanDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanDetailsRef:
```typescript
const name = getLoanDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanDetailsVariables {
  loanId: UUIDString;
}
```
### Return Type
Recall that executing the `GetLoanDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetLoanDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoanDetails, GetLoanDetailsVariables } from '@dataconnect/generated';

// The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`:
const getLoanDetailsVars: GetLoanDetailsVariables = {
  loanId: ..., 
};

// Call the `getLoanDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoanDetails(getLoanDetailsVars);
// Variables can be defined inline as well.
const { data } = await getLoanDetails({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoanDetails(dataConnect, getLoanDetailsVars);

console.log(data.loan);

// Or, you can use the `Promise` API.
getLoanDetails(getLoanDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.loan);
});
```

### Using `GetLoanDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanDetailsRef, GetLoanDetailsVariables } from '@dataconnect/generated';

// The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`:
const getLoanDetailsVars: GetLoanDetailsVariables = {
  loanId: ..., 
};

// Call the `getLoanDetailsRef()` function to get a reference to the query.
const ref = getLoanDetailsRef(getLoanDetailsVars);
// Variables can be defined inline as well.
const ref = getLoanDetailsRef({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanDetailsRef(dataConnect, getLoanDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loan);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loan);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewCustomer
You can execute the `CreateNewCustomer` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewCustomer(vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;

interface CreateNewCustomerRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
}
export const createNewCustomerRef: CreateNewCustomerRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewCustomer(dc: DataConnect, vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;

interface CreateNewCustomerRef {
  ...
  (dc: DataConnect, vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
}
export const createNewCustomerRef: CreateNewCustomerRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewCustomerRef:
```typescript
const name = createNewCustomerRef.operationName;
console.log(name);
```

### Variables
The `CreateNewCustomer` mutation requires an argument of type `CreateNewCustomerVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewCustomerVariables {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  identification?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewCustomer` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewCustomerData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewCustomerData {
  customer_insert: Customer_Key;
}
```
### Using `CreateNewCustomer`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewCustomer, CreateNewCustomerVariables } from '@dataconnect/generated';

// The `CreateNewCustomer` mutation requires an argument of type `CreateNewCustomerVariables`:
const createNewCustomerVars: CreateNewCustomerVariables = {
  firstName: ..., 
  lastName: ..., 
  phoneNumber: ..., 
  email: ..., // optional
  address: ..., // optional
  identification: ..., // optional
};

// Call the `createNewCustomer()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewCustomer(createNewCustomerVars);
// Variables can be defined inline as well.
const { data } = await createNewCustomer({ firstName: ..., lastName: ..., phoneNumber: ..., email: ..., address: ..., identification: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewCustomer(dataConnect, createNewCustomerVars);

console.log(data.customer_insert);

// Or, you can use the `Promise` API.
createNewCustomer(createNewCustomerVars).then((response) => {
  const data = response.data;
  console.log(data.customer_insert);
});
```

### Using `CreateNewCustomer`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewCustomerRef, CreateNewCustomerVariables } from '@dataconnect/generated';

// The `CreateNewCustomer` mutation requires an argument of type `CreateNewCustomerVariables`:
const createNewCustomerVars: CreateNewCustomerVariables = {
  firstName: ..., 
  lastName: ..., 
  phoneNumber: ..., 
  email: ..., // optional
  address: ..., // optional
  identification: ..., // optional
};

// Call the `createNewCustomerRef()` function to get a reference to the mutation.
const ref = createNewCustomerRef(createNewCustomerVars);
// Variables can be defined inline as well.
const ref = createNewCustomerRef({ firstName: ..., lastName: ..., phoneNumber: ..., email: ..., address: ..., identification: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewCustomerRef(dataConnect, createNewCustomerVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.customer_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.customer_insert);
});
```

## UpdateItemStatus
You can execute the `UpdateItemStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateItemStatus(vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

interface UpdateItemStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
}
export const updateItemStatusRef: UpdateItemStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateItemStatus(dc: DataConnect, vars: UpdateItemStatusVariables): MutationPromise<UpdateItemStatusData, UpdateItemStatusVariables>;

interface UpdateItemStatusRef {
  ...
  (dc: DataConnect, vars: UpdateItemStatusVariables): MutationRef<UpdateItemStatusData, UpdateItemStatusVariables>;
}
export const updateItemStatusRef: UpdateItemStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateItemStatusRef:
```typescript
const name = updateItemStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateItemStatusVariables {
  itemId: UUIDString;
  newStatus: string;
}
```
### Return Type
Recall that executing the `UpdateItemStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateItemStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateItemStatusData {
  item_update?: Item_Key | null;
}
```
### Using `UpdateItemStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateItemStatus, UpdateItemStatusVariables } from '@dataconnect/generated';

// The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`:
const updateItemStatusVars: UpdateItemStatusVariables = {
  itemId: ..., 
  newStatus: ..., 
};

// Call the `updateItemStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateItemStatus(updateItemStatusVars);
// Variables can be defined inline as well.
const { data } = await updateItemStatus({ itemId: ..., newStatus: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateItemStatus(dataConnect, updateItemStatusVars);

console.log(data.item_update);

// Or, you can use the `Promise` API.
updateItemStatus(updateItemStatusVars).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

### Using `UpdateItemStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateItemStatusRef, UpdateItemStatusVariables } from '@dataconnect/generated';

// The `UpdateItemStatus` mutation requires an argument of type `UpdateItemStatusVariables`:
const updateItemStatusVars: UpdateItemStatusVariables = {
  itemId: ..., 
  newStatus: ..., 
};

// Call the `updateItemStatusRef()` function to get a reference to the mutation.
const ref = updateItemStatusRef(updateItemStatusVars);
// Variables can be defined inline as well.
const ref = updateItemStatusRef({ itemId: ..., newStatus: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateItemStatusRef(dataConnect, updateItemStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.item_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

