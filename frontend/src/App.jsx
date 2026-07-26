return (
  <div className="min-h-screen bg-slate-100 p-8">
    <Navbar />

    <div className="max-w-5xl mx-auto mt-8">

      <h1 className="text-4xl font-bold">
        Good Morning, Kimaya 👋
      </h1>

      <p className="text-gray-600 mt-2">
        Your AI-powered productivity companion
      </p>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <StatsCard title="Productivity" value="82%" />
        <StatsCard title="Tasks" value="6/9" />
        <StatsCard title="Focus Time" value="4.2h" />
        <StatsCard title="Streak" value="14🔥" />
      </div>

      {/* AI Recommendation Card */}
      <div className="mt-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold">
          🤖 AI Recommendation
        </h2>

        <p className="mt-3">
          Solve your DSA problems first.
        </p>

        <p>
          Best focus time:
          <span className="font-bold"> 9:00 AM - 11:00 AM</span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-5">
        Today's Tasks
      </h2>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={index}
            title={task.title}
            status={task.status}
          />
        ))}
      </div>

    </div>
  </div>
);