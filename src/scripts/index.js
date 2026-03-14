/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getCardList, getUserInfo, setUserInfo, setProfileAvatar, putNewCard, deleteYourCard, changeLikeCardStatus} from './components/api.js';

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const popupList = cardInfoModalWindow.querySelector(".popup__list");

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const showLoading = (formElement, text) => {
  const submitButton = formElement.querySelector('.popup__button');
  submitButton.dataset.originalText = submitButton.textContent;
  submitButton.textContent = text;
};

const hideLoading = (formElement) => {
  const submitButton = formElement.querySelector('.popup__button');
  submitButton.textContent = submitButton.dataset.originalText;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  showLoading(profileForm, 'Сохранение...');
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
  .then((userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModalWindow(profileFormModalWindow);
  })
  .catch((err) => {
      console.log(err);
  })
  .finally(() => {
    hideLoading(profileForm);
  });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  showLoading(avatarForm, 'Сохранение...');
  setProfileAvatar({avatar: avatarInput.value})
  .then((userData) => {
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    closeModalWindow(avatarFormModalWindow);
  })
  .catch((err) => {
      console.log(err);
  })
  .finally(() => {
    hideLoading(avatarForm);
  });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
const handleInfoClick = (cardId) => {
  cardInfoModalInfoList.innerHTML = '';
  popupList.innerHTML = '';
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name)
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );
      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length)
      );
    
      cardData.likes.forEach((user) => {
        popupList.append(createUserList(user.name));
      });  
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const createInfoString = (term, description) => {
  const template = document.getElementById('popup-info-definition-template');
  const clone = template.content.querySelector('.popup__info-item').cloneNode(true);
  clone.querySelector('.popup__info-term').textContent = term;
  clone.querySelector('.popup__info-description').textContent = description;
  return clone;
};

const createUserList = (userName) => {
  const template = document.getElementById('popup-info-user-preview-template');
  const clone = template.content.querySelector('.popup__list-item').cloneNode(true);
  clone.textContent = userName;
  return clone;
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  showLoading(cardForm, 'Создание...');
  putNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
  .then((newCard) => {
    const cardElement = createCardElement(newCard, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: () => {
        const likeButton = cardElement.querySelector(".card__like-button");
        const likeCount = cardElement.querySelector(".card__like-count");
        handleLikeCard(newCard._id, likeButton, likeCount);
      },
      onDeleteCard: cardElement => hideDeleteCard(cardElement, newCard._id),
      onInfoCard: () => handleInfoClick(newCard._id),
    });
    const likeCount = cardElement.querySelector(".card__like-count");
    likeCount.textContent = newCard.likes.length; 
    placesWrap.prepend(cardElement);
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    hideLoading(cardForm);
  });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings); 

const hideDeleteButton = (cardElement, card, userId) => {
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  if (card.owner._id !== userId) {
    deleteButton.style.display = "none";
  }
};

const hideDeleteCard = (cardElement, cardId) => {
  deleteYourCard(cardId)
    .then(() => {
      deleteCard(cardElement); 
      console.log('Пост удалён');
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  changeLikeCardStatus(cardId, isLiked)
    .then((card) => {
      likeCard(likeButton);
      likeCount.textContent = card.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    cards.forEach((card) => {
      const cardElement = createCardElement(card, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: () => {
          const likeButton = cardElement.querySelector(".card__like-button");
          const likeCount = cardElement.querySelector(".card__like-count");
          handleLikeCard(card._id, likeButton, likeCount);
        },
        onDeleteCard: cardElement => hideDeleteCard(cardElement, card._id),
        onInfoCard: () => handleInfoClick(card._id),
      });
      const likeCount = cardElement.querySelector(".card__like-count");
      likeCount.textContent = card.likes.length;
      const likeButton = cardElement.querySelector(".card__like-button");
      const isLikedByMe = card.likes.some(user => user._id === userData._id);
      if (isLikedByMe) {
        likeButton.classList.add('card__like-button_is-active');
      }
      hideDeleteButton(cardElement, card, userData._id);
      placesWrap.append(cardElement);
    });
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  })
  .catch((err) => {
    console.log(err);
  });


  