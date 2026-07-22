export default function ReportsPage() {
  return (
    <div>
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Reports
        </h1>

        <p className="text-green-100">
          Facility Reports
        </p>
      </header>

      <section className="p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold">Residents</h2>
            <p className="text-4xl font-bold text-green-700 mt-4">
              1
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold">Staff</h2>
            <p className="text-4xl font-bold text-blue-700 mt-4">
              0
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold">Medications</h2>
            <p className="text-4xl font-bold text-orange-700 mt-4">
              3
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold">Appointments</h2>
            <p className="text-4xl font-bold text-purple-700 mt-4">
              0
            </p>
          </div>

        </div>

      </section>
    </div>
  );
}