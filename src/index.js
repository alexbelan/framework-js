import "./styles.css";
import {
  createElement,
  initState,
  setState,
  getState,
  mount,
} from "./frameworks.js";
import { getContacts, createContact } from "./api.js";

/*
 * ============================================
 * КАК РАБОТАЕТ СИСТЕМА КОМПОНЕНТОВ И STATE
 * ============================================
 *
 * 1. СОЗДАЕМ КОМПОНЕНТ (функция, которая возвращает элемент):
 *
 *    function ContactsList() {
 *      const state = getState(); // Получаем state
 *      return createElement('div', {}, ...); // Возвращаем элемент
 *    }
 *
 * 2. МОНТИРУЕМ КОМПОНЕНТ ОДИН РАЗ:
 *
 *    mount(ContactsList, '#contactsContainer');
 *
 * 3. ПРИ ИЗМЕНЕНИИ STATE КОМПОНЕНТ АВТОМАТИЧЕСКИ ОБНОВЛЯЕТСЯ:
 *
 *    setState({ contacts: [...contacts, newContact] });
 *    // Компонент ContactsList автоматически перерисуется!
 *
 * ============================================
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ ЛОКАЛЬНОГО STATE:
 * ============================================
 *
 * function Counter() {
 *   const [count, setCount] = useState(0, 'counter-id');
 *
 *   return createElement('div', {},
 *     createElement('p', {}, 'Счет: ', count),
 *     createElement('button', {
 *       onClick: () => setCount(count + 1)
 *     }, 'Увеличить')
 *   );
 * }
 */

// ============================================
// КОМПОНЕНТ КАРТОЧКИ КОНТАКТА
// ============================================
function ContactCard(contact) {
  // Названия категорий
  const categoryNames = {
    friend: "Друг",
    colleague: "Коллега",
    family: "Семья",
    work: "Работа",
    other: "Другое",
  };

  return createElement(
    "div",
    { className: "contact-card" },
    // Заголовок карточки
    createElement(
      "div",
      { className: "contact-card-header" },
      createElement(
        "h3",
        { className: "contact-name" },
        contact.firstName,
        " ",
        contact.lastName
      ),
      // Значки (избранное, VIP)
      createElement(
        "div",
        { className: "contact-badges" },
        contact.isFavorite
          ? createElement("span", { className: "badge favorite" }, "⭐")
          : null,
        contact.isVip
          ? createElement("span", { className: "badge vip" }, "VIP")
          : null
      )
    ),
    // Тело карточки
    createElement(
      "div",
      { className: "contact-card-body" },
      createElement(
        "p",
        { className: "contact-info" },
        createElement("strong", {}, "Телефон: "),
        contact.phone
      ),
      createElement(
        "p",
        { className: "contact-info" },
        createElement("strong", {}, "Email: "),
        contact.email
      ),
      contact.category
        ? createElement(
            "span",
            { className: "contact-category" },
            categoryNames[contact.category] || contact.category
          )
        : null
    )
  );
}

// ============================================
// КОМПОНЕНТ СПИСКА КОНТАКТОВ
// ============================================
// Эта функция автоматически вызывается при изменении state
function ContactsList() {
  // Получаем текущий стейт из фреймворка
  const state = getState();

  // Если идет загрузка
  if (state.loading) {
    return createElement(
      "p",
      {
        style: {
          textAlign: "center",
          color: "#999",
          padding: "20px",
        },
      },
      "Загрузка..."
    );
  }

  // Если есть ошибка
  if (state.error) {
    return createElement(
      "p",
      {
        style: {
          color: "red",
          textAlign: "center",
          padding: "20px",
        },
      },
      `Ошибка: ${state.error}`
    );
  }

  // Если контактов нет
  if (state.contacts.length === 0) {
    return createElement(
      "p",
      {
        style: {
          textAlign: "center",
          color: "#999",
          padding: "20px",
        },
      },
      "Контактов пока нет"
    );
  }

  // Рисуем все карточки контактов
  return createElement(
    "div",
    {},
    ...state.contacts.map((contact) => ContactCard(contact))
  );
}

// ============================================
// ЗАГРУЗКА КОНТАКТОВ С СЕРВЕРА
// ============================================
async function loadContacts() {
  // Показываем загрузку
  setState({ loading: true, error: null });

  try {
    // Загружаем контакты
    const contacts = await getContacts();
    console.log("Контакты загружены:", contacts);

    // Обновляем стейт
    setState({ contacts, loading: false, error: null });
  } catch (error) {
    console.error("Ошибка при загрузке контактов:", error);
    setState({ loading: false, error: error.message });
  }
}

// ============================================
// СОЗДАНИЕ НОВОГО КОНТАКТА
// ============================================
async function handleCreateContact(event) {
  // Предотвращаем перезагрузку страницы
  event.preventDefault();

  // Получаем форму
  const form = event.target;

  // Собираем данные из формы
  const formData = new FormData(form);

  const contactData = {
    firstName: formData.get("firstName") || "",
    lastName: formData.get("lastName") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    category: formData.get("category") || null,
    isFavorite: formData.get("isFavorite") === "on",
    isVip: formData.get("isVip") === "on",
    newsletter: formData.get("newsletter") === "on",
  };

  // Удаляем пустую категорию
  if (!contactData.category) {
    delete contactData.category;
  }

  // Кнопка отправки
  const submitButton = form.querySelector(".submit-btn");
  const originalText = submitButton.textContent;

  try {
    // Показываем загрузку на кнопке
    submitButton.textContent = "Создание...";
    submitButton.disabled = true;

    // Отправляем данные на сервер
    const newContact = await createContact(contactData);
    console.log("Контакт создан:", newContact);

    // Очищаем форму
    form.reset();

    // Добавляем новый контакт в стейт
    const currentState = getState();
    const updatedContacts = [...currentState.contacts, newContact];
    setState({ contacts: updatedContacts });

    // Показываем сообщение об успехе
    showMessage("Контакт успешно создан!", "success");
  } catch (error) {
    console.error("Ошибка при создании контакта:", error);
    showMessage(`Ошибка: ${error.message}`, "error");
  } finally {
    // Возвращаем кнопку в исходное состояние
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
async function init() {
  console.log("Приложение запущено");

  // Инициализируем стейт через фреймворк
  initState({
    contacts: [], // Список контактов
    loading: false, // Загружаются ли данные
    error: null, // Ошибка, если есть
  });

  // Монтируем компонент списка контактов
  // Теперь он будет автоматически обновляться при изменении state
  mount(ContactsList, "#contactsContainer");

  // Находим форму
  const form = document.querySelector("#contactForm");
  if (form) {
    // Подключаем обработчик отправки формы
    form.addEventListener("submit", handleCreateContact);
  }

  // Загружаем контакты
  await loadContacts();
}

// ============================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
