import {
    render,
  } from "@testing-library/react";
  import { BrowserRouter } from "react-router-dom";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  
  export const renderComponent = (component: React.ReactNode) => {
    const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};