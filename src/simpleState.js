import { render } from "./simpleFrameworks.js";

const states = new Map();
let currentComponentId = null;
let renderQueue = [];
export const componentIds = new WeakMap();

export function setCurrentComponentId(id) {
  currentComponentId = id;
}

export function clearCurrentComponentId() {
  currentComponentId = null;
}

export function useState(initValue) {
  const id = currentComponentId || `component_${Date.now()}_${Math.random()}`;

  if (!states.has(id)) {
    states.set(id, initValue);
  }

  const state = states.get(id);

  const setState = (newValue) => {
    let updatedValue =
      typeof newValue === "function" ? newValue(state) : newValue;

    states.set(id, updatedValue);
    if (renderQueue.length > 0) {
      renderQueue.forEach(({ component, containerId }) => {
        render(component, containerId);
      });
    }
  };

  return [state, setState];
}

export function registerComponent(component, containerId) {
  if (!componentIds.has(component)) {
    const componentId = `component_${Date.now()}_${Math.random()}`;
    componentIds.set(component, componentId);
    renderQueue.push({ component, containerId });
  }
  render(component, containerId);
}
