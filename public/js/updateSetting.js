/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
export const updateSetting = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/users/resetMyPassword'
      : '/api/v1/users/updateMyDetails';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type} updated successfully!`);
      window.setTimeout(() => {
        location.reload();
      }, 500);
    }
  } catch (err) {
    showAlert('error', `failed to update your ${type}..try again`);
  }
};
