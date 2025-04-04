import React from "react";

function AboutPage() {
  return (
    <div className="flex flex-col items-center w-3/4 mx-auto mt-10 p-6 bg-gray-50 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">About Us</h1>

      <section className="mb-8">
        <p className="text-lg text-gray-700 text-center">
          Welcome to{" "}
          <span className="font-semibold text-blue-500">Task Manager App</span>,
          your go-to solution for organizing and managing your daily tasks
          effectively. Whether you're juggling multiple responsibilities or
          simply staying organized, our app is designed to make task management
          simple and intuitive.
        </p>
      </section>

      <section className="w-full mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Add New Tasks:</span> Create tasks to
            stay on top of your to-do list.
          </li>
          <li>
            <span className="font-medium">Mark Tasks as Done:</span> Check off
            tasks when completed.
          </li>
          <li>
            <span className="font-medium">Edit Tasks:</span> Update your tasks
            anytime.
          </li>
          <li>
            <span className="font-medium">Delete Tasks:</span> Remove tasks you
            no longer need.
          </li>
          <li>
            <span className="font-medium">Search Tasks:</span> Find specific
            tasks instantly.
          </li>
        </ul>
      </section>

      <section className="w-full mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          How It Works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Add a task using the input field and save it.</li>
          <li>Mark a task as done when completed.</li>
          <li>Edit or delete tasks as needed.</li>
          <li>
            Search through your tasks using the search bar for quick access.
          </li>
        </ol>
      </section>

      <section className="w-full mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Tech Stack
        </h2>
        <p className="text-lg text-gray-700">
          The{" "}
          <span className="font-semibold text-blue-500">Task Manager App</span>{" "}
          is crafted with care by a passionate developer dedicated to
          simplifying lives. Built using modern technologies like
          <span className="font-medium text-gray-800"> React</span>,
          <span className="font-medium text-gray-800"> Node.js</span>, and
          <span className="font-medium text-gray-800"> MongoDB</span>, this task
          manager app ensures a seamless and efficient experience.
        </p>
      </section>
    </div>
  );
}

export default AboutPage;
