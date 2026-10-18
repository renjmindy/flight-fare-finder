import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "@/App";

function renderAt(path: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("App routing", () => {
  it("renders the landing page for /", () => {
    renderAt("/");
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
    expect(screen.getAllByText("Flight Price Notifier").length).toBeGreaterThan(0);
  });

  it("renders the sign-in and sign-up forms", () => {
    renderAt("/signin");
    expect(screen.getByRole("heading", { name: /Sign in/ })).toBeInTheDocument();
  });

  it("falls back to not found for unknown paths", () => {
    renderAt("/nope");
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
