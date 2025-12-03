// ============================================
// ПРОСТОЙ ФРЕЙМВОРК ДЛЯ НОВИЧКОВ
// ============================================

/**
 * Создает HTML элемент
 * @param {string} tag - Тег элемента (div, p, button и т.д.)
 * @param {Object} attributes - Атрибуты элемента (className, id, onClick и т.д.)
 * @param {...any} children - Дочерние элементы или текст
 * @returns {HTMLElement} Созданный элемент
 * 
 * Пример использования:
 * const button = createElement('button', {
 *   className: 'my-button',
 *   onClick: () => alert('Привет!')
 * }, 'Нажми меня');
 */
export function createElement(tag, attributes = {}, ...children) {
  // Создаем элемент
  const element = document.createElement(tag);

  // Устанавливаем атрибуты
  Object.keys(attributes).forEach((key) => {
    if (key === "className") {
      element.className = attributes[key];
    } else if (key === "style" && typeof attributes[key] === "object") {
      Object.assign(element.style, attributes[key]);
    } else if (key.startsWith("on") && typeof attributes[key] === "function") {
      // Обработчики событий (onClick, onSubmit и т.д.)
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });

  // Добавляем дочерние элементы
  children.forEach((child) => {
    if (child === null || child === undefined) {
      // Пропускаем null и undefined
      return;
    } else if (typeof child === "string" || typeof child === "number") {
      // Текст добавляем как текстовый узел
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof HTMLElement) {
      // Если это уже HTML элемент, просто добавляем
      element.appendChild(child);
    } else if (Array.isArray(child)) {
      // Если массив, добавляем каждый элемент
      child.forEach((item) => {
        if (item instanceof HTMLElement) {
          element.appendChild(item);
        } else if (typeof item === "string" || typeof item === "number") {
          element.appendChild(document.createTextNode(String(item)));
        }
      });
    }
  });

  return element;
}

/**
 * Рендерит компонент в контейнер по ID
 * @param {Function|HTMLElement} component - Функция компонента или HTML элемент
 * @param {string} containerId - ID контейнера в HTML
 * 
 * Пример использования:
 * render(() => {
 *   return createElement('div', {}, 'Привет, мир!');
 * }, 'myContainer');
 */
export function render(component, containerId) {
  // Находим контейнер по ID
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Контейнер с ID "${containerId}" не найден!`);
    return;
  }

  // Очищаем контейнер
  container.innerHTML = '';

  // Если компонент - функция, вызываем её
  let element;
  if (typeof component === "function") {
    element = component();
  } else if (component instanceof HTMLElement) {
    element = component;
  } else {
    console.error("Компонент должен быть функцией или HTML элементом");
    return;
  }

  // Добавляем элемент в контейнер
  if (element instanceof HTMLElement) {
    container.appendChild(element);
  }
}

