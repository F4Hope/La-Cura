import { Users, HeartPulse, Pill, CalendarDays } from "lucide-react";
export default function DashboardPage() {
  return (
  <>
      {/* Header */}
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">La-Cura Dashboard</h1>
        <p className="text-green-100">
          Welcome back!
        </p>
      </header>

      {/* Dashboard Cards */}
      <section className="p-8">

        <h2 className="text-2xl font-semibold mb-6">
          Quick Overview
        </h2>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

  <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-green-700">
        Residents
      </h3>
      <Users size={32} className="text-green-700" />
    </div>
    <p className="text-4xl font-bold mt-6">125</p>
    <p className="text-gray-500 mt-2 text-sm">
      Total residents
    </p>
  </div>

  <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-blue-700">
        Nurses
      </h3>
      <HeartPulse size={32} className="text-blue-700" />
    </div>
    <p className="text-4xl font-bold mt-6">28</p>
    <p className="text-gray-500 mt-2 text-sm">
      Active staff
    </p>
  </div>

  <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-orange-600">
        Medications
      </h3>
      <Pill size={32} className="text-orange-600" />
    </div>
    <p className="text-4xl font-bold mt-6">64</p>
    <p className="text-gray-500 mt-2 text-sm">
      Scheduled today
    </p>
  </div>

  <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-purple-700">
        Appointments
      </h3>
      <CalendarDays size={32} className="text-purple-700" />
    </div>
    <p className="text-4xl font-bold mt-6">14</p>
    <p className="text-gray-500 mt-2 text-sm">
      Today's appointments
    </p>
  </div>

</div>

<h2 className="text-2xl font-semibold mt-10 mb-6">
  Today's Activity
</h2>

<div className="bg-white rounded-2xl shadow p-6">

  <div className="flex justify-between border-b py-4">
    <span>🟢 Medication rounds completed</span>
    <span className="font-bold">32</span>
  </div>

  <div className="flex justify-between border-b py-4">
    <span>🟡 Pending medications</span>
    <span className="font-bold">12</span>
  </div>

  <div className="flex justify-between border-b py-4">
    <span>🔵 New admissions</span>
    <span className="font-bold">2</span>
  </div>

  <div className="flex justify-between py-4">
    <span>🟣 Scheduled appointments</span>
    <span className="font-bold">14</span>
  </div>

</div>

</section>

</>
);
}