import React from 'react';
import PropTypes from 'prop-types';

import { Panel, PanelHeader } from '@vkontakte/vkui';

import Sliders from '../components/Sliders/Sliders';

const Home = ({ id, fetchedState, snackbarError }) => (
	<Panel id={id}>
		<PanelHeader>Туалетка</PanelHeader>
    {
      fetchedState &&
      <Sliders fetchedState={fetchedState} snackbarError={snackbarError} />
    }
	</Panel>
);

Home.propTypes = {
	id: PropTypes.string.isRequired,
};

export default Home;
