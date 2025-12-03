const API_URL = "https://1ba1b6b8b0aab80d.mokky.dev/users";

/**
 * Получить все контакты
 * @returns {Promise<Array>} Массив контактов
 */
export async function getContacts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при получении контактов:", error);
    throw error;
  }
}

/**
 * Получить контакт по ID
 * @param {number} id - ID контакта
 * @returns {Promise<Object>} Данные контакта
 */
export async function getContactById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Ошибка при получении контакта ${id}:`, error);
    throw error;
  }
}

/**
 * Создать новый контакт
 * @param {Object} contactData - Данные контакта
 * @returns {Promise<Object>} Созданный контакт
 */
export async function createContact(contactData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при создании контакта:", error);
    throw error;
  }
}

/**
 * Обновить контакт
 * @param {number} id - ID контакта
 * @param {Object} contactData - Новые данные контакта
 * @returns {Promise<Object>} Обновленный контакт
 */
export async function updateContact(id, contactData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Ошибка при обновлении контакта ${id}:`, error);
    throw error;
  }
}

/**
 * Удалить контакт
 * @param {number} id - ID контакта
 * @returns {Promise<void>}
 */
export async function deleteContact(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Ошибка при удалении контакта ${id}:`, error);
    throw error;
  }
}
