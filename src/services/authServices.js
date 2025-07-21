import { toast } from "react-toastify";
import baseApi from '../lib/baseApi';

const authServices = {
  login: async (credentials) => {
    try {
      const res = await baseApi.post('/auth/login', credentials);

      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },
};

export default authServices;