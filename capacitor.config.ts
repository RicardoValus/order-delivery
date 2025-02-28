import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'order-delivery',
  webDir: 'www',
  "plugins": {
    "Camera": {
      "android": {
        "photosPermission": {
          "description": "Este aplicativo requer acesso à biblioteca de fotos para salvar imagens"
        }
      }
    }
  },

  server: {
    androidScheme: 'https'
  }
};

export default config;
