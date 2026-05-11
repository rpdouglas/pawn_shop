# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListAllPawnedItems, useCreateNewCustomer, useGetLoanDetails, useUpdateItemStatus } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListAllPawnedItems();

const { data, isPending, isSuccess, isError, error } = useCreateNewCustomer(createNewCustomerVars);

const { data, isPending, isSuccess, isError, error } = useGetLoanDetails(getLoanDetailsVars);

const { data, isPending, isSuccess, isError, error } = useUpdateItemStatus(updateItemStatusVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listAllPawnedItems, createNewCustomer, getLoanDetails, updateItemStatus } from '@dataconnect/generated';


// Operation ListAllPawnedItems: 
const { data } = await ListAllPawnedItems(dataConnect);

// Operation CreateNewCustomer:  For variables, look at type CreateNewCustomerVars in ../index.d.ts
const { data } = await CreateNewCustomer(dataConnect, createNewCustomerVars);

// Operation GetLoanDetails:  For variables, look at type GetLoanDetailsVars in ../index.d.ts
const { data } = await GetLoanDetails(dataConnect, getLoanDetailsVars);

// Operation UpdateItemStatus:  For variables, look at type UpdateItemStatusVars in ../index.d.ts
const { data } = await UpdateItemStatus(dataConnect, updateItemStatusVars);


```