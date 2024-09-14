import Header from "@/components/Header";
import Dashboard from "@/screens/Dashboard";

export default function Home() {
  return (
    <div className="flex flex-col w-screen min-h-screen">
      <Header />
      <div>
        <Dashboard />
      </div>
    </div>
  );
}
