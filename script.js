let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

// CONTROL DE TEMAS
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('selectedTheme', theme);
    document.getElementById('theme-menu-box').classList.add('hidden');
    showToast(`Tema cambiado a: ${theme === 'dark' ? 'Oscuro (Azul Turquí)' : 'Verde Menta'}`);
}

function toggleThemeMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('theme-menu-box');
    const isHidden = menu.classList.contains('hidden');
    closeAllDropdowns();
    if (isHidden) menu.classList.remove('hidden');
}

function toggleCityDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('city-dropdown-menu');
    const isHidden = menu.classList.contains('hidden');
    closeAllDropdowns();
    if (isHidden) menu.classList.remove('hidden');
}

// BÚSQUEDA INTELIGENTE
function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    const suggestionsBox = document.getElementById('search-suggestions-box');
    const cards = document.querySelectorAll('.review-card');
    const noResultsBox = document.getElementById('no-results-box');

    suggestionsBox.innerHTML = '';
    
    if (query.length === 0) {
        suggestionsBox.classList.add('hidden');
        cards.forEach(card => card.style.display = 'block');
        if (noResultsBox) noResultsBox.classList.add('hidden');
        return;
    }

    let matches = [];
    let visibleCount = 0;

    cards.forEach(card => {
        const titleElement = card.querySelector('h3');
        const descElement = card.querySelector('.description');
        const titleText = titleElement ? titleElement.innerText.toLowerCase() : '';
        const descText = descElement ? descElement.innerText.toLowerCase() : '';
        const cardId = card.id;

        if (titleText.includes(query) || descText.includes(query)) {
            card.style.display = 'block';
            visibleCount++;
            matches.push({ title: titleElement.innerText, id: cardId });
        } else {
            card.style.display = 'none';
        }
    });

    if (visibleCount === 0) {
        if (noResultsBox) noResultsBox.classList.remove('hidden');
    } else {
        if (noResultsBox) noResultsBox.classList.add('hidden');
    }

    if (matches.length > 0) {
        suggestionsBox.classList.remove('hidden');
        matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${match.title}`;
            item.onclick = () => {
                document.getElementById('site-search-input').value = match.title;
                suggestionsBox.classList.add('hidden');
                document.getElementById(match.id).scrollIntoView({ behavior: 'smooth' });
            };
            suggestionsBox.appendChild(item);
        });
    } else {
        suggestionsBox.classList.add('hidden');
    }
}

// FILTRAR POR CATEGORÍA
function filterByCategory(category, btnElement) {
    document.querySelectorAll('.filter-tags .tag').forEach(t => t.classList.remove('active'));
    btnElement.classList.add('active');

    const cards = document.querySelectorAll('.review-card');
    let visibleCount = 0;
    const noResultsBox = document.getElementById('no-results-box');

    cards.forEach(card => {
        if (category === 'Todos') {
            card.style.display = 'block';
            visibleCount++;
        } else {
            const cardCategories = card.getAttribute('data-category') || '';
            if (cardCategories.includes(category)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        }
    });

    if (visibleCount === 0) {
        if (noResultsBox) noResultsBox.classList.remove('hidden');
    } else {
        if (noResultsBox) noResultsBox.classList.add('hidden');
    }
}

function toggleCustomPriceInput(select) {
    const container = document.getElementById('custom-price-container');
    if (select.value === 'custom') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// TOGGLE OPCIONES
function toggleOptionsDropdown(event, menuId, cardId) {
    event.stopPropagation();
    const targetMenu = document.getElementById(menuId);
    const isHidden = targetMenu ? targetMenu.classList.contains('hidden') : true;
    
    closeAllDropdowns();

    if (targetMenu && isHidden) {
        const card = document.getElementById(cardId);
        const cardAuthor = card ? card.getAttribute('data-author') : null;

        targetMenu.innerHTML = '';

        if (currentUser && currentUser === cardAuthor) {
            targetMenu.innerHTML = `
                <button type="button" class="danger" onclick="deleteReview('${cardId}')">
                    <i class="fa-solid fa-trash-can"></i> Eliminar reseña
                </button>
            `;
        } else {
            targetMenu.innerHTML = `
                <button type="button" onclick="reportReview('${cardId}')">
                    <i class="fa-solid fa-flag"></i> Reportar reseña
                </button>
            `;
        }

        targetMenu.classList.remove('hidden');
    }
}

function closeAllDropdowns() {
    const themeMenu = document.getElementById('theme-menu-box');
    const cityMenu = document.getElementById('city-dropdown-menu');
    const searchBox = document.getElementById('search-suggestions-box');
    
    if (themeMenu) themeMenu.classList.add('hidden');
    if (cityMenu) cityMenu.classList.add('hidden');
    if (searchBox) searchBox.classList.add('hidden');
    
    document.querySelectorAll('.options-menu').forEach(menu => menu.classList.add('hidden'));
}

window.addEventListener('click', closeAllDropdowns);

// ACCIONES
function deleteReview(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.remove();
        showToast("Reseña eliminada correctamente.");
    }
}

function reportReview(cardId) {
    closeAllDropdowns();
    showToast("La reseña ha sido reportada y enviada a revisión de IA / Moderación.");
}

// MODALES
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

function openLoginModal() { openModal('login-modal'); }
function closeLoginModal() { closeModal('login-modal'); }

function openAddModal() { openModal('add-modal'); }
function closeAddModal() { 
    closeModal('add-modal');
    document.getElementById('ai-warning').classList.add('hidden');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    const title = document.getElementById('modal-auth-title');
    
    document.getElementById('btn-show-login').classList.remove('active');
    document.getElementById('btn-show-register').classList.remove('active');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        document.getElementById('btn-show-login').classList.add('active');
        title.innerText = "¡Inicia sesión en Lugares Imperdibles!";
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        document.getElementById('btn-show-register').classList.add('active');
        title.innerText = "Crea tu cuenta en Lugares Imperdibles";
    }
}

function zoomImage(src) {
    document.getElementById('lightbox-img').src = src;
    openModal('image-lightbox');
}

function closeLightbox() {
    closeModal('image-lightbox');
}

function filterByCity(cityName) {
    closeAllDropdowns();
    showToast(`Filtrando publicaciones de: ${cityName}`);
}

function openCommentModal(siteId) {
    document.getElementById('comment-site-id').value = siteId;
    openModal('comment-modal');
}

function handleAddComment(event) {
    event.preventDefault();
    const siteId = document.getElementById('comment-site-id').value;
    const text = document.getElementById('comment-text').value;

    const commentsContainer = document.getElementById(`comments-section-${siteId}`);
    commentsContainer.classList.remove('hidden');

    const commentItem = document.createElement('div');
    commentItem.style.padding = "10px";
    commentItem.style.margin = "8px 0";
    commentItem.style.background = "var(--border-color)";
    commentItem.style.borderRadius = "8px";
    commentItem.innerHTML = `<strong>Usuario Comunidad:</strong> ${text}`;

    commentsContainer.appendChild(commentItem);
    document.getElementById('comment-text').value = '';
    closeModal('comment-modal');
    showToast("¡Comentario publicado correctamente!");
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    localStorage.setItem('registeredUser', JSON.stringify({ name, email, pass }));
    currentUser = name;
    
    closeLoginModal();
    showToast(`¡Cuenta creada con éxito, ${name}! Sesión iniciada.`);
    updateUserNavbar(name);
}

function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('login-email').value;
    const passInput = document.getElementById('login-pass').value;

    const savedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (savedUser && (savedUser.email === emailInput || savedUser.name === emailInput) && savedUser.pass === passInput) {
        currentUser = savedUser.name;
        closeLoginModal();
        showToast(`¡Bienvenido de nuevo, ${savedUser.name}!`);
        updateUserNavbar(savedUser.name);
    } else {
        currentUser = emailInput.split('@')[0];
        closeLoginModal();
        showToast("¡Inicio de sesión exitoso!");
        updateUserNavbar(currentUser);
    }
}

function handleGoogleLogin() {
    currentUser = "Usuario Google";
    closeLoginModal();
    showToast("¡Sesión iniciada mediante Google con éxito!");
    updateUserNavbar(currentUser);
}

function setAnonymousUser() {
    currentUser = null;
    closeLoginModal();
    showToast("Navegando como visitante anónimo.");
}

function updateUserNavbar(userName) {
    document.getElementById('user-nav-area').innerHTML = `
        <span style="font-weight:600; color:var(--primary-color);">
            <i class="fa-solid fa-user-check"></i> ${userName}
        </span>
    `;
}

// REGISTRAR NUEVO SITIO
const forbiddenWords = ["groseria", "insulto", "estafa", "robo", "fake", "basura"];

function handleNewReview(event) {
    event.preventDefault();
    
    const name = document.getElementById('site-name').value;
    const address = document.getElementById('site-address').value;
    const city = document.getElementById('site-city').value;
    const ratingFull = document.getElementById('site-rating').value;
    const reviewText = document.getElementById('site-review').value;
    const aiWarning = document.getElementById('ai-warning');

    const priceSelect = document.getElementById('site-price-select').value;
    const customPrice = document.getElementById('site-price-custom').value;
    const finalPrice = priceSelect === 'custom' ? (customPrice || '$30k - $60k') : priceSelect;

    const containsOffense = forbiddenWords.some(word => reviewText.toLowerCase().includes(word));

    if (containsOffense) {
        aiWarning.classList.remove('hidden');
        document.getElementById('ai-alert-text').innerText = "Bloqueado por IA: Lenguaje no permitido.";
        return;
    }

    aiWarning.classList.add('hidden');

    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + address + ' ' + city)}`;

    let badgesHTML = `<span class="feature-badge"><i class="fa-solid fa-utensils"></i> ${finalPrice}</span>`;
    
    document.querySelectorAll('.tag-checkbox-btn input:checked').forEach(cb => {
        const icon = cb.getAttribute('data-icon') || 'fa-tag';
        const isWarning = cb.getAttribute('data-type') === 'warning';
        const badgeClass = isWarning ? 'feature-badge warning' : 'feature-badge';
        badgesHTML += ` <span class="${badgeClass}"><i class="fa-solid ${icon}"></i> ${cb.value}</span>`;
    });

    const cardId = 'card-' + Date.now();
    const optId = 'opt-' + Date.now();
    const authorName = currentUser || "Usuario Anónimo";

    const feed = document.getElementById('reviews-feed');
    const newCard = document.createElement('article');
    newCard.className = 'review-card reddit-card';
    newCard.id = cardId;
    newCard.setAttribute('data-author', authorName);
    newCard.setAttribute('data-name', name);
    newCard.setAttribute('data-category', 'Gastronomía Fines de Semana');
    newCard.setAttribute('data-city', city);
    
    newCard.innerHTML = `
        <div class="card-options-dropdown">
            <button type="button" class="btn-more-options" onclick="toggleOptionsDropdown(event, '${optId}', '${cardId}')" title="Opciones">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div id="${optId}" class="options-menu hidden"></div>
        </div>
        <div class="card-author">
            <div class="svg-avatar-box">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="48" fill="#d8f3dc"/>
                    <circle cx="50" cy="38" r="18" fill="#52b788"/>
                    <path d="M 20,88 C 20,62 32,58 50,58 C 68,58 80,62 80,88 Z" fill="#52b788"/>
                </svg>
            </div>
            <div class="author-info-wrapper">
                <h4>${authorName} <span class="author-tag">Nueva Publicación</span></h4>
                <span>${city}, Colombia • Publicado recientemente</span>
            </div>
        </div>
        <div class="card-content">
            <h3>${name}</h3>
            <p class="location">
                <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-location-dot"></i> ${address} • ${city} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </p>
            <p class="description">${reviewText}</p>
            <div class="site-features">
                ${badgesHTML}
            </div>
        </div>
        <div class="card-footer">
            <div class="rating">
                <i class="fa-solid fa-star"></i> <span>${ratingFull}</span>
            </div>
            <div class="actions">
                <button type="button" class="btn-action" onclick="toggleLike(this)"><i class="fa-regular fa-thumbs-up"></i> Útil (<span class="like-count">0</span>)</button>
                <button type="button" class="btn-action" onclick="openCommentModal('${cardId}')"><i class="fa-regular fa-comment"></i> Comentar</button>
            </div>
        </div>
        <div id="comments-section-${cardId}" class="comments-container hidden"></div>
    `;

    feed.prepend(newCard);
    closeAddModal();
    showToast("¡Sitio publicado con enlace a Google Maps y etiquetas personalizadas!");
}

function toggleLike(button) {
    const countSpan = button.querySelector('.like-count');
    let currentCount = parseInt(countSpan.innerText);
    
    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        countSpan.innerText = currentCount - 1;
    } else {
        button.classList.add('liked');
        countSpan.innerText = currentCount + 1;
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-message').innerText = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
// Función para calcular y formatear el tiempo transcurrido dinámicamente
function calcularTiempoTranscurrido(fechaPublicacion) {
    const ahora = new Date();
    const fechaPost = new Date(fechaPublicacion);
    const diferenciaSegundos = Math.floor((ahora - fechaPost) / 1000);

    if (diferenciaSegundos < 60) {
        return "Hace un momento";
    }
    
    const minutos = Math.floor(diferenciaSegundos / 60);
    if (minutos < 60) {
        return `Hace ${minutos} min${minutos > 1 ? 's' : ''}`;
    }
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
        return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    }
    
    const dias = Math.floor(horas / 24);
    if (dias < 7) {
        return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    }
    
    const semanas = Math.floor(dias / 7);
    if (semanas < 4) {
        return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
    }

    const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
    return fechaPost.toLocaleDateString('es-ES', opcionesFecha);
}