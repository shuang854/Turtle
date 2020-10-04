import { IonContent, IonImg, IonListHeader, IonRouterLink } from '@ionic/react';
import React from 'react';
import firefox from '../../assets/get-firefox-addon.png';
import './GetExtension.css';

const GetExtension: React.FC = () => {
  return (
    <IonContent class="extension-content">
      <IonListHeader>Browser extension installation is required.</IonListHeader>
      <IonRouterLink
        href="https://addons.mozilla.org/en-US/firefox/addon/turtletv/"
        target="_blank"
        class="firefox-link"
      >
        <IonImg src={firefox} alt="Get the extension for Firefox" class="firefox-ext-img"></IonImg>
      </IonRouterLink>
    </IonContent>
  );
};

export default GetExtension;
