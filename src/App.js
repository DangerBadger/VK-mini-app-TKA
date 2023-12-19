import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AppRoot, SplitLayout, SplitCol, Snackbar, Avatar, Panel, PanelHeader, Group, Header } from '@vkontakte/vkui';
import Icon24Error from '@vkontakte/icons/dist/24/error';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Intro from './panels/Intro';

import { ROUTES } from './utils/constants';

const STORAGE_KEYS = {
  STATE: 'state',
  STATUS: 'viewStatus',
};

const App = () => {
  const [activePanel, setActivePanel] = useState(ROUTES.INTRO);
  const [fetchedUser, setfetchedUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [userHasSeenIntro, setUserHasSeenIntro] = useState(false);
  const [fetchedState, setFetchedState] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });

    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const storageData = await bridge.send('VKWebAppStorageGet', {
        keys: Object.values(STORAGE_KEYS)
      });

      if (Array.isArray(storageData.keys)) {
        const data = {};
        storageData.keys.forEach(({ key, value }) => {
          try {
            data[key] = value ? JSON.parse(value) : {};
            switch (key) {
              case STORAGE_KEYS.STATUS:
                if (data[key]?.hasSeenIntro) {
                  setActivePanel(ROUTES.HOME);
                  setUserHasSeenIntro(true);
                }
                break;
              case STORAGE_KEYS.STATE:
                setFetchedState(data[key]);
                break;
              default:
                break;
            }
          } catch (err) {
            setSnackbar(
              <Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                duration={900}
                before={<Avatar size={24} style={{ backgroundColor: 'var(--dynamic-red)' }}>
                  <Icon24Error fill='#fff' width='14' height='14' />
                </Avatar>}
              >
                Проблема получения данных из Storage
              </Snackbar>
            );
            setFetchedState({});
          }
        });
      } else {
        setFetchedState({});
      }
      setfetchedUser(user);
      setPopout(null);
      console.log(storageData.keys[0].value);
    }
    fetchData();
  }, []);

  const go = (panel) => {
    setActivePanel(panel);
  };

  const viewIntro = async function () {
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEYS.STATUS,
        value: JSON.stringify({
          hasSeenIntro: true,
        }),
      });
      go(ROUTES.HOME);
    } catch (err) {
      setSnackbar(
        <Snackbar
          layout='vertical'
          onClose={() => setSnackbar(null)}
          duration={900}
          before={<Avatar size={24} style={{ backgroundColor: 'var(--dynamic-red)' }}>
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
            <Home id={ROUTES.HOME} fetchedUser={fetchedUser} fetchedState={fetchedState} snackbarError={snackbar} />
            <Intro id={ROUTES.INTRO} go={viewIntro} fetchedUser={fetchedUser} snackbarError={snackbar} userHasSeenIntro={userHasSeenIntro} />
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>

  );
}

export default App;
