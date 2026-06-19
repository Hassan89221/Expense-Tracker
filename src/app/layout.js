import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "A simple expense tracker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
