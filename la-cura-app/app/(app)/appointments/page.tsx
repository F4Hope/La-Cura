export default function AppointmentsPage() {
  return (
    <div>
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Appointments
        </h1>
        <p className="text-green-100">
          Manage resident appointments
        </p>
      </header>

      <section className="p-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Appointments
          </h2>

          <p className="text-gray-600">
            No appointments available.
          </p>
        </div>
      </section>
    </div>
  );
}