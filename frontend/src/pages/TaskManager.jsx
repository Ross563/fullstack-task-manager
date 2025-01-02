import { useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

import Tasks from "../components/Tasks";
import axios from "axios";

function TaskManager() {
  const [input, setInput] = useState("");
  const [handleDone, setHandleDone] = useState(false);
  const [tasksCopy, setTasksCopy] = useState([]);
  const [updateTask, setUpdateTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get("/tasks");
        setTasks(data.tasks);
        setTasksCopy(data.tasks);
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }
    };

    fetchTasks();
  }, []);

  async function handleCreateAndUpdateTask() {
    if (!input.trim() && !handleDone) {
      alert("Task cannot be empty!");
      return;
    }

    if (!updateTask) {
      try {
        const { data: oldTask } = await axios.post("/tasks", {
          taskName: input,
          isDone: false,
        });
        setTasks([...tasks, oldTask]);
        setTasksCopy([...tasks, oldTask]);
        setInput("");
      } catch (error) {
        alert("Couldn't create task. Please try again.");
      }
    } else {
      try {
        const { data: newTask } = await axios.post("/tasks/update", {
          id: updateTask._id,
          taskName: input,
          isDone: updateTask.isDone,
        });

        const updatedTasks = tasks.map((task) => {
          if (task._id === newTask._id) {
            return newTask;
          }
          return task;
        });

        setTasks(updatedTasks);
        setTasksCopy(updatedTasks);
        setInput("");
        setHandleDone(false);
        setUpdateTask(null);
      } catch (error) {
        console.log(error);
        alert("Couldn't update task. Please try again.");
      }
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const oldTasks = [...tasksCopy];
    const results = oldTasks.filter((item) =>
      item.taskName.toLowerCase().includes(query)
    );
    setTasks(results);
  };

  const handleTaskDone = async (task) => {
    task.isDone = !task.isDone;
    setUpdateTask(task);
    setHandleDone(true);
  };

  useEffect(() => {
    if (handleDone) {
      handleCreateAndUpdateTask();
    }
  }, [handleDone]);

  const handleEditTask = async (task) => {
    setInput(task.taskName);
    setUpdateTask(task);
  };
  const handleDeleteTask = async (id) => {
    try {
      await axios.post("/tasks/delete", {
        id,
      });
      const Updatedtasks = tasks.filter((task) => task._id.toString() !== id);
      setTasks(Updatedtasks);
      setTasksCopy(Updatedtasks);
    } catch (e) {
      alert("Deletion failed. Please try again later");
    }
  };

  return (
    <div className="flex flex-col items-center w-1/2 mx-auto mt-5 ">
      <h1 className="mb-4 text-2xl font-bold">Task Manager App</h1>
      <div className="flex justify-between items-center gap-2 mb-4 w-full">
        <div className="flex-grow flex items-center ">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="form-input flex-grow h-10 p-2 border border-gray-300 rounded-l-md"
            placeholder="Add a new Task"
          />
          <button
            onClick={handleCreateAndUpdateTask}
            className="btn bg-green-500 text-white text-sm py-2 ml-0 px-4 rounded-r-md h-10 hover:bg-green-600"
          >
            <FaPlus className="m-1" />
          </button>
        </div>

        <div className="flex-grow flex items-center ">
          <button
            className={"btn p-2 py-2 border bg-gray-100 h-10 rounded-l-md"}
          >
            <FaSearch />
          </button>
          <input
            onChange={handleSearch}
            className="form-input flex-grow p-2 h-10 border border-gray-300 rounded-r-md"
            type="text"
            placeholder="Search tasks"
          />
        </div>
      </div>

      <div className="flex flex-col w-full m-6">
        <ul>
          {tasks?.map((taskItem) => (
            <li key={taskItem._id}>
              <Tasks
                task={taskItem}
                handleTaskDone={handleTaskDone}
                handleEditTask={handleEditTask}
                handleDeleteTask={handleDeleteTask}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TaskManager;
