/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapBox';
import { updateSetting } from './updateSetting';

// DOM ELEMENTS
const formLogin = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');
const map = document.getElementById('map');
const formData = document.querySelector('.form-user-data');
const formPassword = document.querySelector('.form-user-settings');

// display maps
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

// login
if (formLogin)
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

// logout
if (logoutBtn)
  logoutBtn.addEventListener('click', () => {
    logout();
  });

if (formData)
  formData.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSetting({ name, email }, 'Details');
  });

if (formPassword)
  formPassword.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordMatch = document.getElementById('password-confirm').value;

    await updateSetting(
      { passwordCurrent, password, passwordMatch },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
