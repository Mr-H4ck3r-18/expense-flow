export default function Header() {
  return (
    <nav className="flex justify-between p-5 bg-white shadow-md textalign-center text-lg font-medium ">
      <div>Logo</div>
      <ul className="flex gap-10">
        <li>Features</li>
        <li>Dashboard</li>
        <li>Pricing</li>
        <li>Get Started</li>
      </ul>
    </nav>
  );
}
