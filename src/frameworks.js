// ============================================
// СИСТЕМА УПРАВЛЕНИЯ СОСТОЯНИЕМ (STATE)
// ============================================

// Глобальное состояние приложения
let globalState = {};
let renderCallback = null; // Функция для перерисовки при изменении стейта

// Список компонентов для автоматического обновления
const componentSubscribers = [];

/**
 * Функция для установки глобального стейта
 * @param {Object} newState - Новые данные для обновления стейта
 *
 * Пример использования:
 * setState({ contacts: [...contacts, newContact] });
 */
export function setState(newState) {
  // Обновляем стейт
  globalState = { ...globalState, ...newState };
  console.log("State обновлен:", globalState);

  // Вызываем функцию перерисовки, если она есть
  if (renderCallback) {
    renderCallback();
  }

  // Обновляем все подписанные компоненты
  componentSubscribers.forEach((updateFn) => {
    updateFn();
  });
}

/**
 * Функция для получения текущего стейта
 * @returns {Object} Текущий глобальный стейт
 *
 * Пример использования:
 * const state = getState();
 * console.log(state.contacts);
 */
export function getState() {
  return globalState;
}

/**
 * Функция для инициализации стейта
 * @param {Object} initialState - Начальное состояние
 * @param {Function} renderFn - Функция для перерисовки при изменении стейта (опционально)
 * @returns {Object} Инициализированный стейт
 *
 * Пример использования:
 * initState({ contacts: [], loading: false });
 * или
 * initState({ contacts: [], loading: false }, render);
 */
export function initState(initialState, renderFn = null) {
  globalState = { ...initialState };
  renderCallback = renderFn;
  return globalState;
}

// Хранилище для локальных состояний компонентов
const componentStates = new Map();
let componentIdCounter = 0;

/**
 * Хук для создания локального состояния внутри компонента
 * @param {any} initialValue - Начальное значение состояния
 * @param {string} componentId - Уникальный ID компонента (опционально)
 * @returns {Array} [значение, функцияОбновления]
 *
 * Пример использования внутри компонента:
 *
 * function Counter() {
 *   const [count, setCount] = useState(0, 'counter');
 *
 *   return createElement('div', {},
 *     createElement('p', {}, 'Счетчик: ', count),
 *     createElement('button', {
 *       onClick: () => setCount(count + 1)
 *     }, 'Увеличить')
 *   );
 * }
 */
export function useState(initialValue, componentId = null) {
  // Если передан ID компонента, используем его, иначе создаем новый
  const id = componentId || `component_${componentIdCounter++}`;

  // Если состояния для этого компонента еще нет, инициализируем
  if (!componentStates.has(id)) {
    componentStates.set(id, initialValue);
  }

  // Получаем текущее значение
  const stateValue = componentStates.get(id);

  // Функция для обновления состояния
  const setStateValue = (newValue) => {
    // Обновляем значение (поддерживаем функции обновления)
    // Можно передать либо новое значение, либо функцию (prev => prev + 1)
    const updatedValue =
      typeof newValue === "function"
        ? newValue(componentStates.get(id))
        : newValue;

    componentStates.set(id, updatedValue);

    // Вызываем функцию перерисовки, если она есть
    if (renderCallback) {
      renderCallback();
    }
  };

  // Возвращаем значение и функцию обновления (как в React)
  return [stateValue, setStateValue];
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Функция для добавления дочернего элемента (обрабатывает все случаи)
function addChild(parent, child) {
  if (!child && child !== 0) return; // Пропускаем null, undefined, false

  if (typeof child === "string" || typeof child === "number") {
    parent.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof HTMLElement) {
    parent.appendChild(child);
  } else if (Array.isArray(child)) {
    child.forEach((item) => addChild(parent, item));
  } else if (child && typeof child.render === "function") {
    parent.appendChild(child.render());
  }
}

// Функция для создания DOM элемента
export function createElement(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);

  // Устанавливаем атрибуты
  Object.keys(attributes).forEach((key) => {
    if (key === "className") {
      element.className = attributes[key];
    } else if (key === "style" && typeof attributes[key] === "object") {
      Object.assign(element.style, attributes[key]);
    } else if (key.startsWith("on") && typeof attributes[key] === "function") {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });

  // Добавляем всех детей
  children.forEach((child) => addChild(element, child));

  return element;
}

// ============================================
// СИСТЕМА МОНТИРОВАНИЯ КОМПОНЕНТОВ
// ============================================

// Хранилище замонтированных компонентов
const mountedComponents = new Map();

/**
 * Создает компонент, который автоматически обновляется при изменении state
 * @param {Function} renderFn - Функция рендеринга компонента
 * @returns {Object} Компонент с методами render и update
 *
 * Пример использования:
 *
 * const ContactsList = createComponent(() => {
 *   const state = getState();
 *   return createElement('div', {},
 *     ...state.contacts.map(contact => ContactCard(contact))
 *   );
 * });
 */
export function createComponent(renderFn) {
  const componentId = `component_${Date.now()}_${Math.random()}`;

  return {
    id: componentId,
    render: renderFn,
    update: function () {
      const mounted = mountedComponents.get(this.id);
      if (mounted && mounted.element) {
        // Находим родительский элемент и следующего соседа
        const parent = mounted.element.parentNode;
        const nextSibling = mounted.element.nextSibling;

        // Создаем новый элемент
        const newElement = this.render();

        // Заменяем старый на новый
        if (parent) {
          parent.removeChild(mounted.element);
          if (nextSibling) {
            parent.insertBefore(newElement, nextSibling);
          } else {
            parent.appendChild(newElement);
          }
        }

        // Обновляем ссылку на элемент
        mounted.element = newElement;
      }
    },
  };
}

/**
 * Монтирует компонент в контейнер и настраивает автоматическое обновление
 * @param {Function|Object} component - Компонент или функция рендеринга
 * @param {string|HTMLElement} container - Контейнер или селектор
 * @returns {HTMLElement} Замонтированный элемент
 *
 * Пример использования:
 *
 * mount(() => {
 *   const state = getState();
 *   return createElement('div', {},
 *     ...state.contacts.map(contact => ContactCard(contact))
 *   );
 * }, '#contactsContainer');
 */
export function mount(component, container) {
  // Если передан селектор, находим элемент
  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  if (!container) {
    console.error("Контейнер не найден");
    return null;
  }

  // Если компонент - функция, создаем компонент из неё
  let componentInstance;
  if (typeof component === "function") {
    componentInstance = createComponent(component);
  } else if (component && typeof component.render === "function") {
    componentInstance = component;
  } else {
    console.error(
      "Компонент должен быть функцией или объектом с методом render"
    );
    return null;
  }

  // Рендерим компонент
  const element = componentInstance.render();

  // Добавляем в контейнер
  container.appendChild(element);

  // Сохраняем информацию о монтированном компоненте
  mountedComponents.set(componentInstance.id, {
    component: componentInstance,
    element: element,
    container: container,
  });

  // Подписываем компонент на обновления state
  const updateFn = () => {
    componentInstance.update();
  };
  componentSubscribers.push(updateFn);

  return element;
}
