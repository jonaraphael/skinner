import { Navigate, useRoutes } from "react-router-dom";
import { Dashboard } from "../screens/Dashboard";
import { Rewards } from "../screens/Rewards";
import { Settings } from "../screens/Settings";
import { TaskEditor } from "../screens/TaskEditor";
import { Tasks } from "../screens/Tasks";
import { Upcoming } from "../screens/Upcoming";

export const AppRoutes = () => {
  return useRoutes([
    { path: "/", element: <Dashboard /> },
    { path: "/tasks", element: <Tasks /> },
    { path: "/task/new", element: <TaskEditor /> },
    { path: "/task/:id/edit", element: <TaskEditor /> },
    { path: "/upcoming", element: <Upcoming /> },
    { path: "/rewards", element: <Rewards /> },
    { path: "/settings", element: <Settings /> },
    { path: "*", element: <Navigate to="/" replace /> }
  ]);
};
