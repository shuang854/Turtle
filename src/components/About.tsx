import { IonCol, IonGrid, IonIcon, IonRow, IonRouterLink } from '@ionic/react';
import { logoGithub } from 'ionicons/icons';
import { Icon } from '@iconify/react';
import discordIcon from '@iconify/icons-simple-icons/discord';

import React from 'react';
import './About.css';

type AboutProps = {
  pane: string;
};

const About: React.FC<AboutProps> = ({ pane }) => {
  return (
    <IonGrid style={{ display: pane === 'about' ? null : 'none' }} class="about-grid">
      <IonRow>
        <IonCol>
          <span>Any feedback, questions, or issues? </span>
          <span role="img" aria-label="Turtle">
            🐢🐢
          </span>
        </IonCol>
      </IonRow>
      <IonRow class="externals-row">
        <IonCol size="3"></IonCol>
        <IonCol size="3">
          <IonRouterLink href="https://github.com/shuang854/Turtle" target="_blank">
            <IonIcon icon={logoGithub} class="about-icons"></IonIcon>
          </IonRouterLink>
        </IonCol>
        <IonCol size="3">
          <IonRouterLink href="https://discord.gg/NEw3Msu" target="_blank">
            <Icon icon={discordIcon} className="about-icons"></Icon>
          </IonRouterLink>
        </IonCol>
        <IonCol size="3"></IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default About;
