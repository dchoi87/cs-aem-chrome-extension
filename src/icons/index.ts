import Dashboard from "./Dashboard";
import Dispatcher from "./Dispatcher";
import Editor from "./Editor";
import Preview from "./Preview";
import Published from "./Published";
import Target from "./Target";

export const ICONS = {
  dashboard: Dashboard,
  editor: Editor,
  published: Published,
  dispatcher: Dispatcher,
  preview: Preview,
  target: Target,
} as const;

export type IconName = keyof typeof ICONS;
