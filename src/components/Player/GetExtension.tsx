import { IonContent, IonImg, IonListHeader, IonRouterLink } from '@ionic/react';
import React from 'react';
import firefox from '../../assets/get-firefox-addon.png';
import chrome from '../../assets/get-chrome-ext.png';
import './GetExtension.css';

const GetExtension: React.FC = () => {
  return (
    <IonContent class="extension-content">
      <IonListHeader>Browser extension installation is required.</IonListHeader>
      <IonRouterLink
        href="https://chrome.google.com/webstore/detail/turtle/impnlaffkhninicciominkpmacjebogd"
        target="_blank"
        class="ext-link"
      >
        <IonImg src={chrome} alt="Get the extension for Chrome" class="chrome-ext-img"></IonImg>
      </IonRouterLink>
      <IonRouterLink href="https://addons.mozilla.org/en-US/firefox/addon/turtletv/" target="_blank" class="ext-link">
        <IonImg src={firefox} alt="Get the extension for Firefox" class="firefox-ext-img"></IonImg>
      </IonRouterLink>
    </IonContent>
  );
};

export default GetExtension;
