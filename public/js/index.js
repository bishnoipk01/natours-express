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
    updateSetting({ name, email });
  });
