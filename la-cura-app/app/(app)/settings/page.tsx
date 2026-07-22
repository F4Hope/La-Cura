export default function SettingsPage() {
  return (
    <div>
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="text-green-100">
          System Configuration
        </p>
      </header>

      <section className="p-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold mb-6">
            General Settings
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between border-b pb-3">
              <span>Facility Name</span>
              <span className="font-semibold">La-Cura</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>System Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>Database</span>
              <span className="text-green-700 font-semibold">
                Connected
              </span>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-700 font-semibold">
                Online
              </span>
            </div>

          </div>

        </div>

      </section>
    </div>
  );
}