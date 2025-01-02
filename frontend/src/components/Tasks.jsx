import { FaCheck, FaPencilAlt, FaTrash } from "react-icons/fa";

function Tasks({ task, handleTaskDone, handleEditTask, handleDeleteTask }) {
  return (
    <div className="flex p-2 m-3 rounded-md items-center justify-between bg-gray-200">
      <span
        className={
          task.isDone === true
            ? " text-gray-800 line-through ml-4"
            : " text-gray-800 ml-4"
        }
      >
        {task.taskName}
      </span>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleTaskDone(task)}
          className="bg-green-500 text-white text-sm py-2 px-4 rounded-md"
          type="button"
        >
          <FaCheck />
        </button>
        <button
          onClick={() => handleEditTask(task)}
          className="bg-blue-500 text-white text-sm py-2 px-4 rounded-md"
          type="button"
        >
          <FaPencilAlt />
        </button>
        <button
          onClick={() => handleDeleteTask(task._id)}
          className="bg-red-500 text-white text-sm py-2 px-4 rounded-md"
          type="button"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
export default Tasks;
