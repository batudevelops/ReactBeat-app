import 'react-native-gesture-handler';

import * as Sentry from '@sentry/react-native';
import { registerRootComponent } from 'expo';

import App from './App';
import { initSentry } from './src/lib/sentry';

initSentry();

registerRootComponent(Sentry.wrap(App));
