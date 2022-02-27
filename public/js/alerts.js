/* eslint-disable */

export const showAlert = (status, message) => {
  hideAlert();
  const html = `<div class="alert alert--${status}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', html);
  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
