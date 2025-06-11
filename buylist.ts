type Product = {
    id: string;
    name: string;
    count: number;
    bought: boolean;
};

const STORAGE_KEY = 'buylist-products';

function generateId(): string {
    return '_' + Math.random().toString(36).substring(2, 9);
}

const initialProducts: Product[] = [
    { id: generateId(), name: 'Помідори', count: 2, bought: true },
    { id: generateId(), name: 'Печиво', count: 2, bought: false },
    { id: generateId(), name: 'Сир', count: 1, bought: false },
];

let products: Product[] = [];

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {

    // Якщо локал сторедж пустий - то нічого не підгружати після перезагрузки

    // const data = localStorage.getItem(STORAGE_KEY);
    // if (data) {
    //     products = JSON.parse(data);
    // } else {
    //     products = initialProducts;
    //     saveProducts();
    // }

    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
            products = parsed;
        } else {
            products = initialProducts;
            saveProducts();
        }
    } else {
        products = initialProducts;
        saveProducts();
    }
}

function render() {
    const tableMain = document.querySelector('.table-main') as HTMLElement;
    const leftPanel = document.querySelectorAll('.secondary-products')[0] as HTMLElement;
    const boughtPanel = document.querySelectorAll('.secondary-products')[1] as HTMLElement;

    // Очищення всього
    tableMain.innerHTML = '';

    tableMain.appendChild(createSearchBar());

    // Рендер товарів
    products.forEach(product => {
        tableMain.appendChild(createProductRow(product));
    });

    // Оновлення статистики
    leftPanel.innerHTML = '';
    boughtPanel.innerHTML = '';
    products.filter(p => !p.bought).forEach(p => {
        leftPanel.appendChild(createStatRow(p));
    });
    products.filter(p => p.bought).forEach(p => {
        boughtPanel.appendChild(createStatRow(p));
    });
}

function createSearchBar(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-searchbar-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Назва товару';
    input.id = 'productInput';

    const button = document.createElement('button');
    button.textContent = 'Додати';
    button.id = 'addItem';

    // Додавання івентів
    button.addEventListener('click', () => addProduct(input));
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') addProduct(input);
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);

    return wrapper;
}

function addProduct(input: HTMLInputElement) {
    const name = input.value.trim();
    if (!name) return;
    products.push({
        id: generateId(),
        name,
        count: 1,
        bought: false,
    });
    input.value = '';
    input.focus();
    saveProducts();
    render();
}

function createProductRow(product: Product): HTMLElement {
    const row = document.createElement('div');
    row.className = 'table-products';

    // Назва або input для редагування
    const nameDiv = document.createElement('div');
    if (!product.bought) {
        const nameP = document.createElement('p');
        nameP.textContent = product.name;
        nameP.style.cursor = 'pointer';
        nameP.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = product.name;
            input.addEventListener('blur', () => {
                product.name = input.value.trim() || product.name;
                saveProducts();
                render();
            });
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') input.blur();
            });
            nameDiv.innerHTML = '';
            nameDiv.appendChild(input);
            input.focus();
        });
        nameDiv.appendChild(nameP);
    } else {
        const nameP = document.createElement('p');
        nameP.innerHTML = `<s>${product.name}</s>`;
        nameDiv.appendChild(nameP);
    }

    // Кількість та кнопки
    const countDiv = document.createElement('div');
    countDiv.className = 'tp-addbuttons';
    if (!product.bought) {
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.disabled = product.count === 1;
        minusBtn.addEventListener('click', () => {
            if (product.count > 1) {
                product.count--;
                saveProducts();
                render();
            }
        });

        const countText = document.createElement('div');
        countText.textContent = product.count.toString();

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => {
            product.count++;
            saveProducts();
            render();
        });

        countDiv.appendChild(minusBtn);
        countDiv.appendChild(countText);
        countDiv.appendChild(plusBtn);
    } else {
        const countText = document.createElement('div');
        countText.textContent = product.count.toString();
        countDiv.appendChild(countText);
    }

    // Кнопки "куплено - не куплено" та "видалити"
    const actionDiv = document.createElement('div');
    actionDiv.className = 'tp-removebuttons';

    if (!product.bought) {
        const buyBtn = document.createElement('button');
        buyBtn.textContent = 'Куплено';
        buyBtn.addEventListener('click', () => {
            product.bought = true;
            saveProducts();
            render();
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'x';
        delBtn.addEventListener('click', () => {
            products = products.filter(p => p.id !== product.id);
            saveProducts();
            render();
        });

        actionDiv.appendChild(buyBtn);
        actionDiv.appendChild(delBtn);
    } else {
        const unbuyBtn = document.createElement('button');
        unbuyBtn.textContent = 'Не куплено';
        unbuyBtn.addEventListener('click', () => {
            product.bought = false;
            saveProducts();
            render();
        });
        actionDiv.appendChild(unbuyBtn);
    }

    row.appendChild(nameDiv);
    row.appendChild(countDiv);
    row.appendChild(actionDiv);

    return row;
}

function createStatRow(product: Product): HTMLElement {
    const statDiv = document.createElement('div');
    statDiv.className = 'secondary-info';
    const nameP = document.createElement('p');
    nameP.innerHTML = product.bought ? `<s>${product.name}</s>` : product.name;
    const countDiv = document.createElement('div');
    countDiv.textContent = product.count.toString();
    statDiv.appendChild(nameP);
    statDiv.appendChild(countDiv);
    return statDiv;
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    render();
});
