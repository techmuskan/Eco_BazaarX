import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

test("renders footer brand and subtitle", () => {
  render(<Footer />);
  expect(screen.getByText("EcoBazaarX")).toBeInTheDocument();
  expect(
    screen.getByText(/Smarter shopping with sustainability visibility/i)
  ).toBeInTheDocument();
});
