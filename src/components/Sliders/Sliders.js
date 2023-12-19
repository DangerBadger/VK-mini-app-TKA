import { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Group, FormLayout, FixedLayout, FormItem, Slider, Header, Counter, Div, Button, Snackbar, Avatar } from '@vkontakte/vkui';
import Icon24Error from '@vkontakte/icons/dist/24/error';

import slidersStyles from './Sliders.module.css';
import roll from '../../img/roll.svg';

import { throttle } from '../../utils/utils';
import { DEFAULT_CONSTANTS } from "../../utils/constants";

const IS_TAPTICK_SUPPORTED = bridge.supports('VKWebAppTapticNotificationOccurred');

const Sliders = ({ fetchedState, snackbarError }) => {
  const {
    SHEETS_PER_ROLL,
    SHEETS_PER_VISIT,
    ROLLS_NUMBER,
    TOILET_VISITS,
    PERSONS_NUMBER,
  } = DEFAULT_CONSTANTS;

  const [rollsCount, setRollsCount] = useState(fetchedState?.rollsCount ?? ROLLS_NUMBER);
  const [toiletVisits, setToiletVisits] = useState(fetchedState?.toiletVisits ?? TOILET_VISITS);
  const [personsCount, setPersonsCount] = useState(fetchedState?.personsCount ?? PERSONS_NUMBER);
  const [sheetsCount, setSheetsCount] = useState(fetchedState?.sheetsCount ?? (ROLLS_NUMBER * SHEETS_PER_ROLL));
  const [snackBar, setSnackbar] = useState(snackbarError);

  const countDays = () => {
    const sheetsPerDay = SHEETS_PER_VISIT * toiletVisits * personsCount;
    const totalSheets = rollsCount * SHEETS_PER_ROLL;
    return Math.floor(totalSheets / sheetsPerDay);
  }

  const setStorage = async function (properties) {
    await bridge.send('VKWebAppStorageSet', {
      key: 'state',
      value: JSON.stringify({
        rollsCount,
        toiletVisits,
        personsCount,
        sheetsCount,
        ...properties
      })
    })
  }

  const onSheetHandler = async function () {
    if (IS_TAPTICK_SUPPORTED) {
      await bridge.send('VKWebAppTapticNotificationOccurred', {
        type: (sheetsCount <= 0) ? 'error' : 'success'
      });
    }

    if (sheetsCount <= 0) {
      setSnackbar(
        <Snackbar
          layout='vertical'
          onClose={() => setSnackbar(null)}
          duration={900}
          before={<Avatar size={24} style={{ backgroundColor: 'var(--dynamic-red)' }}>
            <Icon24Error fill='#fff' width='14' height='14' />
          </Avatar>}
        >
          У вас закончилась туалетная бумага
        </Snackbar>
      );
      setRollsCount(0);
      return;
    }

    const newSheetsCount = sheetsCount - 1;
    const newRollsCount = Math.floor(newSheetsCount / SHEETS_PER_ROLL);

    setSheetsCount(newSheetsCount);
    if (newRollsCount !== rollsCount && newRollsCount !== 0) {
      setRollsCount(newRollsCount);
    }
    setSnackbar(
      <Snackbar
        layout='vertical'
        onClose={() => setSnackbar(null)}
        duration={900}
        before={<Avatar size={24} style={{ backgroundColor: 'var(--accent)' }}>
          <Icon24Error fill='#fff' width='14' height='14' />
        </Avatar>}
      >
        {newSheetsCount <= 0 ? 'У вас не осталось туалетной бумаги' : `Листочек туалетной бумаги потрачен. Осталось ${newSheetsCount}`}
      </Snackbar>
    );
    setStorage({
      sheetsCount: newSheetsCount,
    });
  }

  const onRollsChange = throttle(rolls => {
    if (rolls === rollsCount) return;
    setSheetsCount(sheetsCount + (rolls - rollsCount) * SHEETS_PER_ROLL);
    setRollsCount(rolls);
    setStorage();
  }, 200);

  const onVisitsChange = throttle(visits => {
    if (visits === toiletVisits) return;
    setToiletVisits(visits);
    setStorage();
  }, 200);

  const onPersonsChange = throttle(persons => {
    if (persons === personsCount) return;
    setPersonsCount(persons);
    setStorage();
  }, 200);

  return (
    <>
      <Group>
        <h1 className={slidersStyles.daysLeftHeading}>{countDays()}</h1>
        <h3 className={slidersStyles.daysLeftSubheading}>Столько дней вы продержитесь</h3>
      </Group>
      <FormLayout>
        <FormItem
          top={
            <Header
              indicator={<Counter size='m' mode='primary'>{rollsCount}</Counter>}
            >
              <span role='img' aria-label='Toilet paper'>&#129531;</span>
              Количество рулонов
            </Header>
          }
        >
          <Slider
            step={1}
            min={0}
            max={36}
            value={rollsCount}
            onChange={rolls => onRollsChange(rolls)}
          >
          </Slider>
        </FormItem>
        <FormItem
          top={
            <Header
              indicator={<Counter size='m' mode='primary'>{toiletVisits}</Counter>}
            >
              <span role='img' aria-label='Toilet'>&#128701;</span>
              Количество посещений туалета
            </Header>
          }
        >
          <Slider
            step={1}
            min={0}
            max={8}
            value={toiletVisits}
            onChange={visits => onVisitsChange(visits)}
          >
          </Slider>
        </FormItem>
        <FormItem
          top={
            <Header
              indicator={<Counter size='m' mode='primary'>{personsCount}</Counter>}
            >
              <span role='img' aria-label='Persons'>&#128106;</span>
              Количество людей в доме
            </Header>
          }
        >
          <Slider
            step={1}
            min={1}
            max={18}
            value={personsCount}
            onChange={persons => onPersonsChange(persons)}
          >
          </Slider>
        </FormItem>
      </FormLayout>
      <FixedLayout vertical='bottom'>
        <Div className={slidersStyles.buttonContainer}>
          <Button className={slidersStyles.button} appearance='accent-invariable' size='l' onClick={onSheetHandler}>
            <img src={roll} alt='Toilet paper roll' />
          </Button>
        </Div>
      </FixedLayout>
      {snackBar}
      {snackbarError}
    </>
  )
};

export default Sliders;