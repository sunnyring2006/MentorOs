function handleComplete() {
  alert("Task Completed! 🎉");
}
function TaskCard({ title, status }) {
  let statusColor = "";

  if (status === "Pending") {
    statusColor = "pending";
  } else if (status === "In Progress") {
    statusColor = "progress";
  } else {
    statusColor = "completed";
  }

  return (
    <div className="task-card">
      <div>
        <h3>{title}</h3>
        <span className={statusColor}>{status}</span>
      </div>

      <button onClick={handleComplete}>Complete</button>
    </div>
  );
}

export default TaskCard;