import axios from 'axios';

const growApi = axios.create({
  baseURL: 'https://db.grow90.org/v1/graphql',
});

const vocalLabApi = axios.create({
  baseURL: 'https://db.vocallabs.ai/v1/graphql',
});

const webHookUrl = axios.create({
  baseURL: 'https://n8n.subspace.money/webhook/vocal'
})
// Add request interceptor
const addAuthInterceptor = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }else{
        console.log("NO TOKEN FOUND")
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};  
const addAuthInterceptorForWebHook = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `${token}`;
      }else{
        console.log("NO TOKEN FOUND")
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};  

addAuthInterceptor(growApi);
addAuthInterceptor(vocalLabApi);
addAuthInterceptorForWebHook(webHookUrl);

export { growApi, vocalLabApi,webHookUrl };