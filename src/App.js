import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AppRoot, SplitLayout, SplitCol, Snackbar, Avatar, Panel, PanelHeader, Group, Header } from '@vkontakte/vkui';
import Icon24Error from '@vkontakte/icons/dist/24/error';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Intro from './panels/Intro';

import { ROUTES } from './utils/constants';

const STORAGE_KEYS = {
  STATUS: 'status',
};

const App = () => {
  const [activePanel, setActivePanel] = useState(ROUTES.INTRO);
  const [fetchedUser, setfetchedUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [userHasSeenIntro, setUserHasSeenIntro] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const storageData = await bridge.send('VKWebAppStorageGet', {
        keys: Object.values(STORAGE_KEYS)
      });
      const data = {};

      storageData.keys.forEach(({ key, value }) => {
        try {
          data[key] = value ? JSON.parse(value) : {};
          switch (key) {
            case STORAGE_KEYS.STATUS:
              if (data[key].hasSeenIntro) {
                setActivePanel(ROUTES.HOME);
                setUserHasSeenIntro(true);
              }
              break;
            default:
              break;
          }
        } catch(err) {
          setSnackbar(
            <Snackbar
              layout='vertical'
              onClose={() => setSnackbar(null)}
              duration={900}
              before={<Avatar size={24} style={{ backgroundColor: 'var(--dynamic-red)'}}>
                <Icon24Error fill='#fff' width='14' height='14' />
              </Avatar>}
            >
              Проблема получения данных из Storage
            </Snackbar>
          )
        }
      })
      setfetchedUser(user);
      setPopout(null);
    }
    fetchData();
  }, []);

  const go = e => {
    setActivePanel(e.currentTarget.dataset.to);
  };

  const viewIntro = async function() {
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEYS.STATUS,
        value: JSON.stringify({
          hasSeenIntro: true,
        }),
      });
    } catch(err) {
      setSnackbar(
        <Snackbar
          layout='vertical'
          onClose={() => setSnackbar(null)}
          duration={900}
          before={<Avatar size={24} style={{ backgroundColor: 'var(--dynamic-red)'}}>
            <Icon24Error fill='#fff' width='14' height='14' />
          </Avatar>}
        >
          Проблема с отправкой данных в Storage
        </Snackbar>
      )
    }
  }

  return (
    <AppRoot>
      <SplitLayout popout={popout}>
        <SplitCol>
          <View activePanel={activePanel}>
            <Home id={ROUTES.HOME} fetchedUser={fetchedUser} go={go} snackbarError={snackbar} />
            <Intro id={ROUTES.INTRO} go={viewIntro} fetchedUser={fetchedUser} snackbarError={snackbar} userHasSeenIntro={userHasSeenIntro} />
            {/* <Panel id='main'>
              <PanelHeader>Donor Search games</PanelHeader>
              <Group mode='card' header={<Header mode='secondary'>Попробуйте наши игры:</Header>}>
              </Group>
            </Panel> */}
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>

  );
}

export default App;
