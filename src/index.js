import { createElement } from "./simpleFrameworks.js";
import { useState, registerComponent } from "./simpleState.js";

function Counter() {
  const [count, setCount] = useState(0);

  return createElement(
    "div",
    {},
    createElement("h2", {}, "Счетчик"),
    createElement("p", {}, "Значение: ", count),
    createElement(
      "div",
      {},
      createElement(
        "button",
        {
          onClick: () => setCount(count - 1),
        },
        "Уменьшить"
      ),
      createElement(
        "button",
        {
          onClick: () => setCount(0),
        },
        "Сбросить"
      ),
      createElement(
        "button",
        {
          onClick: () => setCount(count + 1),
        },
        "Увеличить"
      )
    )
  );
}

function init() {
  registerComponent(Counter, "app");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
