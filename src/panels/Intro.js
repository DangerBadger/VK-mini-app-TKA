import React from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader, Group, Div, Avatar, FixedLayout, Button, PanelHeaderBack } from '@vkontakte/vkui';

import introStyles from './Intro.module.css';

const Intro = ({
  id,
  go,
  snackbarError,
  fetchedUser,
  userHasSeenIntro
}) => {

  console.log(fetchedUser)

  return (
  <Panel id={id} centered={true} className={introStyles.panel}>
		<PanelHeader>
			Туалетка
		</PanelHeader>
    {(!userHasSeenIntro && fetchedUser) && 
      <>
        <Group mode="plain">
          <Div className={introStyles.user}>
            {fetchedUser.photo_200 && 
              <>
                <Avatar src={fetchedUser.photo_200} />
                <h2>Привет, {fetchedUser.first_name}!</h2>
                <h3>Этот сервис помогает следить за тем чтобы в доме не закончилась туалетная бумага.</h3>
              </>
            }
          </Div>
        </Group>
        <FixedLayout vertical='bottom'>
          <Div>
            <Button mode='primary' size='l'>Кнопка</Button>
          </Div>
        </FixedLayout>
      </>
    }
    {snackbarError}
	</Panel>
  )
};

Intro.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
  userHasSeenIntro: PropTypes.bool.isRequired,
};

export default Intro;
